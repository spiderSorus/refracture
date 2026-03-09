// src/scenes/test/21_Megaverse.js
import { createPlayer } from '../../ecs/entities/player';
import { createSpawnPlatform, createPlatform } from '../../ecs/entities/platforms';
import { createTarget } from '../../ecs/entities/target';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, EntityType, SlingshotJump,
    Mass, Velocity, ZLayer, Ego, SpawnTag
} from '../../ecs/components/index';
import Phaser from 'phaser';

export class Megaverse extends BaseTestScene {
    constructor() {
        super('Megaverse', 'Megaverse', 'A vast expanse of targets and platforms.');
        this.meditationEnabled = false;
        this.hasBoundaries = false; // INFINITE WORLD
    }

    create() {
        super.create();

        // No bounds
        this.cameras.main.setZoom(0.5);

        // 2. BACKGROUND GRID (Large tiling grid for scale)
        if (!this.textures.exists('bg_grid_large')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.lineStyle(2, 0x222222, 1);
            gfx.strokeRect(0, 0, 500, 500); // Larger grid
            gfx.generateTexture('bg_grid_large', 500, 500);
        }
        
        // Use a screen-sized tile sprite that follows the camera
        this.grid = this.add.tileSprite(0, 0, this.scale.width * 2, this.scale.height * 2, 'bg_grid_large').setDepth(0);
        this.grid.setScrollFactor(0); // Lock to screen
        if (this.backgroundLayer) this.backgroundLayer.add(this.grid);

        const spawnX = 0;
        const spawnY = 0;

        // 3. SPAWN INFRASTRUCTURE (Circular)
        this.addEntity(createPlatform(spawnX, spawnY, { 
            width: 100, 
            shape: 'circle', 
            isStatic: true, 
            color: 0x888888 
        }));
        
        // Add a SpawnTag to one of the platforms so LifecycleSystem knows where to respawn
        const spawnPoint = this.addEntity([
            Position(spawnX, spawnY),
            SpawnTag()
        ]);
        
        this.addEntity([
            ...createPlayer(spawnX, spawnY - 100),
            SlingshotJump(4000),
            ZLayer('PLAY', 0)
        ]);

        // 4. PERSISTENT STATE
        this.islandHistory = []; // Already spawned island locations
        this._spawnTimer = 0;

        this.cameras.main.centerOn(spawnX, spawnY);
    }

    update(time, delta) {
        super.update(time, delta);
        const dtSeconds = delta / 1000;

        if (this.grid) {
            const cam = this.cameras.main;
            this.grid.tilePositionX = cam.scrollX * 0.5;
            this.grid.tilePositionY = cam.scrollY * 0.5;
        }

        // --- DYNAMIC SPAWNING ---
        const player = this.entities.find(e => e.components.PlayerTag && !e.toDestroy);
        if (player) {
            const pPos = player.components.Position;
            const cam = this.cameras.main;
            const viewRadius = Math.max(cam.displayWidth, cam.displayHeight) * 1.5;

            this._spawnTimer += delta;
            if (this._spawnTimer >= 2000) {
                this._spawnTimer = 0;
                
                // Attempt to spawn a new island at the edge of the view
                const angle = Math.random() * Math.PI * 2;
                const distance = viewRadius * 0.8;
                const ix = pPos.x + Math.cos(angle) * distance;
                const iy = pPos.y + Math.sin(angle) * distance;

                // Check if we've already spawned something near this location
                const tooClose = this.islandHistory.some(h => 
                    Phaser.Math.Distance.Between(ix, iy, h.x, h.y) < 1500
                );

                if (!tooClose) {
                    this.createIsland(ix, iy);
                    this.islandHistory.push({ x: ix, y: iy });
                }
            }

            // --- CLEANUP DISTANT ENTITIES ---
            const mem = player.components.PlayerMemory;
            const cleanupRadius = viewRadius * 3;

            this.entities.forEach(entity => {
                // DON'T DESTROY: Player, SpawnPoint, or Drift Platforms (DriftSystem handles them)
                // OR anything the player HAS INTERACTED WITH (in PlayerMemory)
                const isPlayer = !!entity.components.PlayerTag;
                const isSpawn = !!entity.components.SpawnTag;
                const isDrifter = !!entity.components.Drift;
                const inMemory = mem && mem.entities.includes(entity.id);

                if (!isPlayer && !isSpawn && !isDrifter && !inMemory) {
                    const pos = entity.components.Position;
                    if (pos) {
                        const d = Phaser.Math.Distance.Between(pPos.x, pPos.y, pos.x, pos.y);
                        if (d > cleanupRadius) {
                            entity.toDestroy = true;
                        }
                    }
                }
            });
        }
    }

    createIsland(x, y) {
        const platformCount = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < platformCount; i++) {
            const px = x + (Math.random() - 0.5) * 600;
            const py = y + (Math.random() - 0.5) * 600;
            
            this.addEntity([
                ...createPlatform(px, py, { 
                    width: 100 + Math.random() * 200, 
                    height: 40, 
                    isStatic: true, 
                    color: 0x333333 
                }),
                ZLayer('PLAY', 10),
                Ego(Math.floor(Math.random() * 255))
            ]);

            // Chance for a target near platform
            if (Math.random() > 0.4) {
                this.addEntity(createTarget(px, py - 150, 60, 60));
            }
        }
    }
}
