// src/scenes/test/11_ChaosLab.js
import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform } from '../../ecs/entities/platforms';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, Spin, Rotation, StaticTag, Ego
} from '../../ecs/components/index';
import { FloaterGravityRule, EgoBalanceRule, WebActivationRule } from '../../ecs/systems/energy_logic/Rules';
import Phaser from 'phaser';

export class ChaosLab extends BaseTestScene {
    constructor() {
        super('ChaosLab', 'Chaos Lab', 'Dynamic spawning, rotation, and ego.');
        this.meditationEnabled = false;
        this.energyRules = [FloaterGravityRule, EgoBalanceRule, WebActivationRule];
        this.spawnTimer = 0;
    }

    create() {
        super.create();

        const WORLD_WIDTH = 4000;
        const WORLD_HEIGHT = 12000;
        this.cameras.main.setBounds(0, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.5);

        if (!this.textures.exists('bg_grid')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x1a1a1a, 1);
            gfx.strokeRect(0, 0, 100, 100);
            gfx.generateTexture('bg_grid', 100, 100);
        }
        const grid = this.add.tileSprite(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid').setDepth(0);
        if (this.backgroundLayer) this.backgroundLayer.add(grid);

        const spawnX = WORLD_WIDTH / 2;
        const spawnY = -WORLD_HEIGHT / 2;

        // 0. SPAWN PLATFORM
        this.addEntity(createSpawnPlatform(spawnX, spawnY));

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3500)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }

    fixedUpdate(time, dt) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = 500; 
            this.spawnChaosEntity();
        }
        this.entities.forEach(e => {
            if (e.components.SpawnTag || e.components.PlayerTag) return;
            if (e.life) {
                e.life -= dt;
                if (e.life <= 0) e.toDestroy = true;
            }
        });
    }

    spawnChaosEntity() {
        const WORLD_WIDTH = 4000;
        const WORLD_HEIGHT = 12000;
        const x = Phaser.Math.Between(500, WORLD_WIDTH - 500);
        const y = Phaser.Math.Between(-WORLD_HEIGHT, -500);
        const ego = Phaser.Math.Between(20, 200);
        const isCircle = Math.random() > 0.5;
        const isSpinner = Math.random() > 0.3;
        const isFloater = Math.random() > 0.5;
        const color = Phaser.Display.Color.RandomRGB(100).color;

        const comps = [
            Position(x, y),
            Rotation(Math.random() * Math.PI * 2),
            PlatformTag(),
            Ego(ego),
            Mass(ego / 50),
            EntityType('PLATFORM')
        ];

        if (!isFloater) comps.push(StaticTag());
        else comps.push(Velocity(Phaser.Math.Between(-20, 20), Phaser.Math.Between(-20, 20)));
        if (isSpinner) comps.push(Spin(Phaser.Math.FloatBetween(-1.5, 1.5)));

        if (isCircle) {
            comps.push(Renderable({ 'BASE': { type: 'circle', radius: ego * 0.8 + 20, color: color } }));
            comps.push(Collider('circle', ego * 0.8 + 20));
        } else {
            const size = (ego * 0.8 + 20) * 2;
            comps.push(Renderable({ 'BASE': { type: 'rect', width: size, height: size, color: color } }));
            comps.push(Collider('rect', 0, size, size));
        }

        const ent = this.addEntity(comps);
        ent.life = Phaser.Math.Between(10000, 30000); 
    }
}
