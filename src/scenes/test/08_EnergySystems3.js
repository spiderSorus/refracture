// src/scenes/test/08_EnergySystems3.js
import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    SpawnTag, RealityLevel, MeditationState, Mass, Velocity
} from '../../ecs/components/index';
import { DynamicStaticToggleRule } from '../../ecs/systems/energy_logic/Rules';
import Phaser from 'phaser';

export class EnergySystems3 extends BaseTestScene {
    constructor() {
        super('EnergySystems3', 'Energy Systems 3', 'Platform Toggle: Static (Attached) / Dynamic (Free).');
        this.meditationEnabled = false;
        this.energyRules = [DynamicStaticToggleRule];
    }

    create() {
        super.create();

        const WORLD_WIDTH = 4000;
        const WORLD_HEIGHT = 4000;
        
        this.cameras.main.setBounds(0, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.6);

        if (!this.textures.exists('bg_grid')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x1a1a1a, 1);
            gfx.strokeRect(0, 0, 100, 100);
            gfx.generateTexture('bg_grid', 100, 100);
        }

        this.add.tileSprite(WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid').setDepth(0);

        const centerX = WORLD_WIDTH / 2;
        const centerY = -WORLD_HEIGHT / 2;

        // 1. SPAWN PLATFORM
        const spawnX = centerX;
        const spawnY = -150;
        this.addEntity([
            Position(spawnX, spawnY),
            Velocity(0, 0),
            PlatformTag(),
            SpawnTag(),
            RealityLevel([0], [0]),
            EntityType('PLATFORM'),
            Mass(10),
            Renderable({ 'BASE': { type: 'rect', width: 100, height: 20, color: 0x00ff00 } }),
            Collider('rect', 0, 100, 20)
        ]);

        // 2. 10 PROCEDURAL FLOATERS
        for (let i = 0; i < 10; i++) {
            const fx = Phaser.Math.Between(500, WORLD_WIDTH - 500);
            const fy = Phaser.Math.Between(-WORLD_HEIGHT + 500, -500);
            const size = Phaser.Math.Between(60, 120);
            const color = Phaser.Display.Color.RandomRGB(100).color;

            this.addEntity([
                Position(fx, fy),
                // Small random initial velocity for "bounce"
                Velocity(Phaser.Math.Between(-40, 40), Phaser.Math.Between(-40, 40)),
                PlatformTag(),
                RealityLevel([0], [0]),
                EntityType('PLATFORM'),
                Mass(5),
                Renderable({ 'BASE': { type: 'circle', radius: size, color: color } }),
                Collider('circle', size)
            ]);
        }

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            SlingshotJump(3500),
            RealityLevel([0], [0])
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
