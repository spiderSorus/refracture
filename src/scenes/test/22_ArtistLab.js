// src/scenes/test/22_ArtistLab.js
import { BaseTestScene } from './BaseTestScene';
import { createSpawnPlatform, createPlatform } from '../../ecs/entities/platforms';
import { createPlayer } from '../../ecs/entities/player';
import {
    createFloatingBox,
    createFloatingShard,
    createFloatingOrb,
    createPillar
} from '../../ecs/entities/art/backgroundObjects';
import { PHYSICS } from '../../core/Constants';
import { SlingshotJump, ZLayer } from '../../ecs/components/index';
import Phaser from 'phaser';

export class ArtistLab extends BaseTestScene {
    constructor() {
        super('ArtistLab', 'Artist Lab', 'Multi-layer Shaders, Parallax & Drifting Entities');
        this.hasBoundaries = true;
    }

    create() {
        super.create();

        const WORLD_WIDTH = 4000;
        const WORLD_HEIGHT = 8000;
        this.cameras.main.setBounds(-WORLD_WIDTH / 2, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.7);
        this.cameras.main.setBackgroundColor(0x0a0a12);

        // =========================================================================
        // 1. ARTIST DECLARATIVE LAYER SETUP
        // Define isolated layers with distinct shaders and parallax depths.
        // =========================================================================
        this.setupBackgroundLayers({
            far_haze: {
                effect: 'watercolor',
                parallax: 0.15
            },
            crystals: {
                effect: 'rainbow',
                parallax: 0.45
            },
            floating_shards: {
                effect: 'stainedGlass',
                parallax: 0.75
            }
        });

        const spawnX = 0;
        const spawnY = -200;

        // =========================================================================
        // 2. LAYER 1: FAR HAZE (Deep Watercolor Beams & Pillars)
        // =========================================================================
        for (let i = -3; i <= 3; i++) {
            this.addEntity(createPillar(i * 600, -WORLD_HEIGHT / 2, {
                width: 180,
                height: WORLD_HEIGHT,
                color: 0x1a264a,
                alpha: 0.35,
                parallax: 0.15,
                layer: 'far_haze'
            }));
        }

        // =========================================================================
        // 3. LAYER 2: CRYSTALS (Floating, Rotating Boxes with Rainbow Shader)
        // =========================================================================
        for (let i = 0; i < 25; i++) {
            const rx = Phaser.Math.Between(-WORLD_WIDTH / 2 + 200, WORLD_WIDTH / 2 - 200);
            const ry = Phaser.Math.Between(-WORLD_HEIGHT + 400, 200);
            const size = Phaser.Math.Between(70, 160);

            this.addEntity(createFloatingBox(rx, ry, {
                size: size,
                color: 0xbb55ff,
                alpha: 0.45,
                spin: Phaser.Math.FloatBetween(-0.8, 0.8),
                drift: {
                    vx: Phaser.Math.Between(-25, 25),
                    vy: Phaser.Math.Between(-15, 15)
                },
                parallax: 0.45,
                layer: 'crystals'
            }));
        }

        // =========================================================================
        // 4. LAYER 3: FLOATING SHARDS (Stained Glass Refraction Shards & Orbs)
        // =========================================================================
        for (let i = 0; i < 30; i++) {
            const rx = Phaser.Math.Between(-WORLD_WIDTH / 2 + 100, WORLD_WIDTH / 2 - 100);
            const ry = Phaser.Math.Between(-WORLD_HEIGHT + 200, 400);

            if (i % 2 === 0) {
                this.addEntity(createFloatingShard(rx, ry, {
                    size: Phaser.Math.Between(50, 120),
                    color: 0x00ffcc,
                    alpha: 0.5,
                    spin: Phaser.Math.FloatBetween(-1.2, 1.2),
                    drift: {
                        vx: Phaser.Math.Between(-35, 35),
                        vy: Phaser.Math.Between(-20, 20)
                    },
                    parallax: 0.75,
                    layer: 'floating_shards'
                }));
            } else {
                this.addEntity(createFloatingOrb(rx, ry, {
                    radius: Phaser.Math.Between(25, 60),
                    color: 0xff6688,
                    alpha: 0.4,
                    drift: {
                        vx: Phaser.Math.Between(-15, 15),
                        vy: Phaser.Math.Between(-25, 25)
                    },
                    parallax: 0.75,
                    layer: 'floating_shards'
                }));
            }
        }

        // =========================================================================
        // 5. GAMEPLAY LAYER (Crisp, Non-distorted Platforms & Player)
        // =========================================================================
        this.addEntity([
            ...createSpawnPlatform(spawnX, spawnY, { width: 500, height: 80, color: 0x444444 }),
            ZLayer('PLAY', 5)
        ]);

        // Ascending platforms to jump across
        for (let i = 1; i <= 15; i++) {
            const py = spawnY - i * 450;
            const px = (i % 2 === 0 ? 1 : -1) * Phaser.Math.Between(200, 600);
            this.addEntity([
                ...createPlatform(px, py, {
                    width: Phaser.Math.Between(180, 320),
                    height: 50,
                    isStatic: true,
                    color: 0x777788
                }),
                ZLayer('PLAY', 5)
            ]);
        }

        // Player
        this.addEntity([
            ...createPlayer(spawnX, spawnY - 80),
            SlingshotJump(PHYSICS.SLINGSHOT_FORCE),
            ZLayer('PLAY', 0)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }
}
