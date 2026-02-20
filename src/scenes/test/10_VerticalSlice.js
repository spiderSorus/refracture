import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, AbilityState, EntityType, SlingshotJump
} from '../../ecs/components/index';

export class VerticalSlice extends BaseTestScene {
    constructor() {
        super('VerticalSlice', 'Vertical Slice', '3000x10000 World. Gravity Active.');
    }

    create() {
        super.create();

        const WORLD_WIDTH = 3000;
        const WORLD_HEIGHT = 10000;

        // 1. Generate an "Endless" repeating texture dynamically
        if (!this.textures.exists('bg_grid')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x1a1a1a, 1);
            gfx.strokeRect(0, 0, 100, 100);
            gfx.generateTexture('bg_grid', 100, 100);
        }

        // Add TileSprite for the background (Centered)
        const bg = this.add.tileSprite(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 'bg_grid');
        bg.setDepth(0); // Ensure it's behind the ECS graphics layer

        // 2. Set Camera Bounds
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.8);

        // 3. Create World Bounds (Using ECS Entities so they interact with systems)
        const wallThickness = 200;

        // Floor
        this.addEntity([
            Position(WORLD_WIDTH / 2, WORLD_HEIGHT + (wallThickness / 2)),
            Renderable({ 'BASE': { type: 'rect', width: WORLD_WIDTH, height: wallThickness, color: 0x444444 } }),
            Collider('rect', 0, WORLD_WIDTH, wallThickness),
            PlatformTag(),
            EntityType('PLATFORM')
        ]);

        // Left Wall
        this.addEntity([
            Position(-wallThickness / 2, WORLD_HEIGHT / 2),
            Renderable({ 'BASE': { type: 'rect', width: wallThickness, height: WORLD_HEIGHT, color: 0x444444 } }),
            Collider('rect', 0, wallThickness, WORLD_HEIGHT),
            PlatformTag(),
            EntityType('PLATFORM')
        ]);

        // Right Wall
        this.addEntity([
            Position(WORLD_WIDTH + (wallThickness / 2), WORLD_HEIGHT / 2),
            Renderable({ 'BASE': { type: 'rect', width: wallThickness, height: WORLD_HEIGHT, color: 0x444444 } }),
            Collider('rect', 0, wallThickness, WORLD_HEIGHT),
            PlatformTag(),
            EntityType('PLATFORM')
        ]);

        // 4. Create Player (Spawned on the ground)
        const spawnX = WORLD_WIDTH / 2;
        const spawnY = WORLD_HEIGHT - 50; // Just above the floor

        this.addEntity([
            ...createPlayer(spawnX, spawnY),
            AbilityState(),
            SlingshotJump(1800) // --- NEW: Add Slingshot Component to player! ---
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}