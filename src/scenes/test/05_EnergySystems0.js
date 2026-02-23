// src/scenes/test/05_EnergySystems0.js
import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, AbilityState, EntityType, SlingshotJump,
    SpawnTag, RealityLevel, MeditationState, Mass, Velocity
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class EnergySystems0 extends BaseTestScene {
    constructor() {
        super('EnergySystems0', 'Energy Systems 0', 'Basic Energy Transfer Test.');
        this.meditationEnabled = false;
        this.floaterGravity = 980; // Gravity kicks in when connected
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

        // --- EQUILATERAL TRIANGLE LAYOUT ---
        const sideLen = 1000;
        const height = (Math.sqrt(3) / 2) * sideLen;
        
        const centerX = WORLD_WIDTH / 2;
        const centerY = -WORLD_HEIGHT / 2;

        // 1. SPAWN PLATFORM (Bottom Vertex)
        const spawnX = centerX;
        const spawnY = centerY + (height / 2);
        
        this.addEntity([
            Position(spawnX, spawnY),
            PlatformTag(),
            SpawnTag(),
            RealityLevel([0], [0]),
            EntityType('PLATFORM'),
            Mass(10),
            Renderable({ 'BASE': { type: 'rect', width: 100, height: 20, color: 0x00ff00 } }),
            Collider('rect', 0, 100, 20)
        ]);

        // 2. LEFT PLATFORM (Top Left Vertex)
        this.addEntity([
            Position(centerX - (sideLen / 2), centerY - (height / 2)),
            Velocity(0, 0),
            PlatformTag(),
            RealityLevel([0], [0]),
            EntityType('PLATFORM'),
            Mass(5),
            Renderable({ 'BASE': { type: 'circle', radius: 80, color: 0x00ffff } }),
            Collider('circle', 80)
        ]);

        // 3. RIGHT PLATFORM (Top Right Vertex)
        this.addEntity([
            Position(centerX + (sideLen / 2), centerY - (height / 2)),
            Velocity(0, 0),
            PlatformTag(),
            RealityLevel([0], [0]),
            EntityType('PLATFORM'),
            Mass(5),
            Renderable({ 'BASE': { type: 'circle', radius: 80, color: 0xffff00 } }),
            Collider('circle', 80)
        ]);

        // SPAWN PLAYER
        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            AbilityState(),
            SlingshotJump(3500),
            MeditationState(),
            RealityLevel([0], [0])
        ]);

        this.cameras.main.centerOn(centerX, centerY);
    }
}
