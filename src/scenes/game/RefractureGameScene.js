// src/scenes/game/RefractureGameScene.js
import { BaseTestScene } from '../test/BaseTestScene';
import { spawnPlayer, findPlayer } from '../../ecs/entities/player';
import { SlingshotJump, ZLayer } from '../../ecs/components/index';
import { generateFractureGraph } from '../../world/FractureGraph';
import { spawnGraphCells } from '../../ecs/entities/cell';
import { closestPointOnPolygon } from '../../utils/CollisionUtils';

export class RefractureGameScene extends BaseTestScene {
    constructor() {
        super('RefractureGameScene', 'REFRACTURE', '');
        this.hasBoundaries = false;
        this.disableGravity = true;
    }

    create() {
        super.create();

        this.unitToPixel = 20.0;
        this.gapInPlayerWidths = 10.0;

        this.graph = generateFractureGraph({
            seed: 108,
            universeDiameter: 1000,
            boundarySides: 128,
            minCellPlayerAreas: 100,
            maxCellUniverseFraction: 0.01,
            branchingFactor: 0.65
        });

        this.cellEntities = spawnGraphCells(this, this.graph, {
            unitToPixel: this.unitToPixel,
            gapInPlayerWidths: this.gapInPlayerWidths,
            markCenterAsSpawn: true,
            style: 'SLATE_SHARD'
        });

        const spawnPoint = this.entities.find(e => e.components.SpawnTag) || this.cellEntities[0];
        const player = spawnPlayer(this, spawnPoint);
        if (player) {
            player.components.SlingshotJump = SlingshotJump(3500);
            player.components.ZLayer = ZLayer('PLAY', 0);
            const pPos = player.components.Position;
            this.cameras.main.centerOn(pPos.x, pPos.y);
        }

        this.cameras.main.setBackgroundColor(0x06080e);
        this.cameras.main.setZoom(0.65);
        this.initialized = true;
    }

    fixedUpdate(_time, stepMs) {
        const dt = stepMs / 1000;
        const player = findPlayer(this.entities);
        if (!player || player.components.Parent) return;

        const pPos = player.components.Position;
        const pVel = player.components.Velocity;
        if (!pPos || !pVel) return;

        const speed = Math.hypot(pVel.x, pVel.y);
        if (speed < 500) {
            let nearestDist = Infinity;
            let pullX = 0;
            let pullY = 0;

            for (const cellEnt of this.cellEntities) {
                const cPos = cellEnt.components.Position;
                const col = cellEnt.components.Collider;
                if (!cPos || !col || !col.points) continue;

                const localX = pPos.x - cPos.x;
                const localY = pPos.y - cPos.y;
                if (Math.hypot(localX, localY) > (col.radius || 0) + 600) continue;

                const cp = closestPointOnPolygon(localX, localY, col.points);
                if (cp.dist < nearestDist) {
                    nearestDist = cp.dist;
                    pullX = (cPos.x + cp.x) - pPos.x;
                    pullY = (cPos.y + cp.y) - pPos.y;
                }
            }

            if (nearestDist < Infinity && nearestDist > 1) {
                const len = Math.hypot(pullX, pullY) || 1;
                const pullAccel = 1200;
                pVel.x += (pullX / len) * pullAccel * dt;
                pVel.y += (pullY / len) * pullAccel * dt;
            }
        }
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.inputManager) return;

        if (this.inputManager.getAction('BACK')) {
            this.scene.start('GameMenuScene');
        }
    }
}
