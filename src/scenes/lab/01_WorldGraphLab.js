// src/scenes/lab/01_WorldGraphLab.js
import Phaser from 'phaser';
import { BaseTestScene } from '../test/BaseTestScene';
import { createPlayer, spawnPlayer, findPlayer } from '../../ecs/entities/player';
import { SlingshotJump, ZLayer } from '../../ecs/components/index';
import { generateFractureGraph } from '../../world/FractureGraph';
import { getCellAreaInPlayerUnits } from '../../world/GraphQueries';
import { spawnGraphCells, createGraphOverlay } from '../../ecs/entities/cell';
import { CELL_STYLE_KEYS, resolveCellStyle } from '../../styles/CellStyles';
import { GRAPH_STYLE_KEYS, resolveGraphStyle } from '../../styles/GraphStyles';
import { closestPointOnPolygon } from '../../utils/CollisionUtils';

export class WorldGraphLabScene extends BaseTestScene {
    constructor() {
        super('WorldGraphLabScene', 'World Graph & Player Lab', 'Walk on cells & jump across 10-player-width gaps');
        this.hasBoundaries = false;
        this.disableGravity = true; // 360-degree top-down cell jumping with local cell edge pull
    }

    create() {
        super.create();

        this.seed = 42;
        this.unitToPixel = 20.0;       // 1 player width = 20px (matches player diameter 2 * 10px)
        this.gapInPlayerWidths = 10.0; // Spread cells apart by 10 player widths (200px)
        this.cellStyleIdx = 0;
        this.graphStyleIdx = 0;

        this.cameras.main.setBackgroundColor(0x06080e);
        this.cameras.main.setZoom(0.65);

        this.infoText = this.add.text(24, 90, '', {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#00ffcc',
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            padding: { x: 12, y: 10 }
        }).setScrollFactor(0).setDepth(2100);
        if (this.uiLayer) this.uiLayer.add(this.infoText);

        this.rebuildWorld();
    }

    rebuildWorld() {
        // Destroy existing entities cleanly
        for (const e of this.entities) {
            const renderable = e.components?.Renderable;
            if (renderable && renderable.activeVisuals) {
                Object.values(renderable.activeVisuals).forEach(v => v.destroy());
            }
        }
        this.entities = [];
        this.entitiesMap.clear();

        this.graph = generateFractureGraph({
            seed: this.seed,
            universeDiameter: 1000,
            boundarySides: 128,
            minCellPlayerAreas: 100,
            maxCellUniverseFraction: 0.01,
            branchingFactor: 0.65
        });

        const cellStyleKey = CELL_STYLE_KEYS[this.cellStyleIdx];
        const graphStyleKey = GRAPH_STYLE_KEYS[this.graphStyleIdx];

        this.cellEntities = spawnGraphCells(this, this.graph, {
            unitToPixel: this.unitToPixel,
            gapInPlayerWidths: this.gapInPlayerWidths,
            markCenterAsSpawn: true,
            style: cellStyleKey
        });

        this.overlayEntity = this.addEntity(createGraphOverlay(this.graph, {
            unitToPixel: this.unitToPixel,
            style: graphStyleKey
        }));

        const spawnPoint = this.entities.find(e => e.components.SpawnTag) || this.cellEntities[0];
        const player = spawnPlayer(this, spawnPoint);
        if (player) {
            player.components.SlingshotJump = SlingshotJump(3500);
            player.components.ZLayer = ZLayer('PLAY', 0);
            const pPos = player.components.Position;
            this.cameras.main.centerOn(pPos.x, pPos.y);
        }

        this.initialized = true;

        let minArea = Infinity;
        let maxArea = 0;
        for (const cell of this.graph.cells) {
            const area = getCellAreaInPlayerUnits(this.graph, cell.id);
            if (area < minArea) minArea = area;
            if (area > maxArea) maxArea = area;
        }
        this.stats = {
            minArea: Math.round(minArea),
            maxArea: Math.round(maxArea),
            maxAllowed: Math.round(this.graph.maxCellPlayerAreas)
        };
    }

    applyStyles() {
        const cellStyle = resolveCellStyle(CELL_STYLE_KEYS[this.cellStyleIdx]);
        for (const entity of this.cellEntities) {
            const baseDef = entity.components.Renderable?.definitions?.BASE;
            if (baseDef) {
                baseDef.style = cellStyle;
            }
        }

        if (this.overlayEntity) {
            const overlayDef = this.overlayEntity.components.Renderable?.definitions?.OVERLAY;
            if (overlayDef) {
                overlayDef.style = resolveGraphStyle(GRAPH_STYLE_KEYS[this.graphStyleIdx]);
            }
        }
    }

    fixedUpdate(_time, stepMs) {
        const dt = stepMs / 1000;
        const player = findPlayer(this.entities);
        if (!player || player.components.Parent) return;

        // When airborne between cells and slowing down, pull gently toward the nearest cell edge
        // so the player always lands on a cell and never gets stranded in a gap.
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
            this.scene.start('TestMenuScene');
            return;
        }

        // X: Reseed fracture graph
        if (this.inputManager.isButtonPressed('X') || Phaser.Input.Keyboard.JustDown(this.inputManager.keys.x)) {
            this.seed += 37;
            this.rebuildWorld();
        }

        // A / Enter: Cycle Cell Visual Style
        if (this.inputManager.isButtonPressed('A') || Phaser.Input.Keyboard.JustDown(this.inputManager.keys.enter)) {
            this.cellStyleIdx = (this.cellStyleIdx + 1) % CELL_STYLE_KEYS.length;
            this.applyStyles();
        }

        // Y: Cycle Graph Metadata Overlay Style
        if (this.inputManager.isButtonPressed('Y') || Phaser.Input.Keyboard.JustDown(this.inputManager.keys.y)) {
            this.graphStyleIdx = (this.graphStyleIdx + 1) % GRAPH_STYLE_KEYS.length;
            this.applyStyles();
        }

        const player = findPlayer(this.entities);
        const attachedCellId = player?.components?.Parent?.id || 'AIRBORNE';
        const cellStyle = resolveCellStyle(CELL_STYLE_KEYS[this.cellStyleIdx]);

        if (this.infoText) {
            this.infoText.setText([
                `Seed: #${this.seed} | Cells: ${this.graph.cells.length} | Gap: ${this.gapInPlayerWidths} player widths (${this.gapInPlayerWidths * this.unitToPixel}px)`,
                `Player Cell: ${attachedCellId} | Cell Style [A]: ${cellStyle.label}`,
                `Controls: [Left Stick/WASD] Walk on Cell  [Right Stick] Aim & Release to Jump  [L2/R2] Zoom  [X] Reseed  [B/ESC] Back`
            ]);
        }
    }
}
