// src/scenes/test/23_RainbowArtistLab.js
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

/**
 * Helper to get a vibrant rainbow color based on vertical altitude.
 * Maps altitude from ground (y ~ -200) to summit (y ~ -7000) across 0° -> 360° hue.
 */
function getRainbowColorForY(y, minY = -7200, maxY = -200, lightness = 0.55, saturation = 0.85) {
    const t = Phaser.Math.Clamp((maxY - y) / (maxY - minY), 0, 1);
    const hue = (t * 360) % 360;
    return Phaser.Display.Color.HSLToColor(hue / 360, saturation, lightness).color;
}

export class RainbowArtistLab extends BaseTestScene {
    constructor() {
        super(
            'RainbowArtistLab',
            'Rainbow Artist Lab',
            'Climb higher to shift background across the rainbow gradient'
        );
        this.hasBoundaries = true;
    }

    create() {
        super.create();

        const WORLD_WIDTH = 4000;
        const WORLD_HEIGHT = 8000;
        this.cameras.main.setBounds(-WORLD_WIDTH / 2, -WORLD_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.7);

        // Initial atmospheric background color (warm ruby red near ground)
        this.backgroundColor = 0x140508;
        this.enableAtmosphere = true;
        this.atmosphereIntensity = 0.4;

        // =========================================================================
        // 1. ARTIST DECLARATIVE LAYER SETUP
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
        const summitY = -7000;

        // =========================================================================
        // 2. LAYER 1: FAR HAZE (Vertical Rainbow Gradient Backdrop & Watercolor Pillars)
        // =========================================================================
        if (this.auxLayers && this.auxLayers.far_haze) {
            // A. Static continuous vertical rainbow gradient backdrop (rendered through watercolor shader)
            const gradientGfx = this.add.graphics();
            const rainbowBands = [
                { y: 200,   color: 0x880022 }, // Ground floor: Deep Ruby
                { y: -1000, color: 0xaa2200 }, // Crimson-Orange
                { y: -2200, color: 0xbb6600 }, // Warm Amber
                { y: -3400, color: 0x99aa00 }, // Chartreuse / Gold
                { y: -4600, color: 0x008844 }, // Emerald Green
                { y: -5800, color: 0x006688 }, // Deep Turquoise
                { y: -6800, color: 0x222288 }, // Indigo Blue
                { y: -8000, color: 0x550088 }, // Royal Violet
                { y: -8500, color: 0x880055 }  // Summit: Magenta
            ];

            for (let b = 0; b < rainbowBands.length - 1; b++) {
                const bottom = rainbowBands[b];
                const top = rainbowBands[b + 1];
                const h = bottom.y - top.y;

                gradientGfx.fillGradientStyle(
                    top.color, top.color,
                    bottom.color, bottom.color,
                    0.28, 0.28, 0.28, 0.28
                );
                gradientGfx.fillRect(-2200, top.y, 4400, h);
            }
            this.auxLayers.far_haze.add(gradientGfx);

            // B. Dynamic altitude-responsive ambient wash
            this.ambientWashGfx = this.add.graphics();
            this.auxLayers.far_haze.add(this.ambientWashGfx);
        }

        // Tall background pillars spanning the vertical shaft, tinted to harmonize with depth
        for (let i = -3; i <= 3; i++) {
            this.addEntity(createPillar(i * 600, -WORLD_HEIGHT / 2, {
                width: 160,
                height: WORLD_HEIGHT,
                color: 0x181828,
                alpha: 0.35,
                parallax: 0.15,
                layer: 'far_haze'
            }));
        }

        // =========================================================================
        // 3. LAYER 2: CRYSTALS (Floating Boxes Tinted by Altitude with Rainbow Shader)
        // =========================================================================
        for (let i = 0; i < 35; i++) {
            const rx = Phaser.Math.Between(-WORLD_WIDTH / 2 + 250, WORLD_WIDTH / 2 - 250);
            const ry = Phaser.Math.Between(-WORLD_HEIGHT + 500, 100);
            const size = Phaser.Math.Between(70, 170);
            const color = getRainbowColorForY(ry, summitY, spawnY, 0.6, 0.9);

            this.addEntity(createFloatingBox(rx, ry, {
                size: size,
                color: color,
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
        // 4. LAYER 3: FLOATING SHARDS (Stained Glass Prisms & Orbs Tinted Across Rainbow)
        // =========================================================================
        for (let i = 0; i < 40; i++) {
            const rx = Phaser.Math.Between(-WORLD_WIDTH / 2 + 150, WORLD_WIDTH / 2 - 150);
            const ry = Phaser.Math.Between(-WORLD_HEIGHT + 300, 300);
            const color = getRainbowColorForY(ry, summitY, spawnY, 0.65, 0.95);

            if (i % 2 === 0) {
                this.addEntity(createFloatingShard(rx, ry, {
                    size: Phaser.Math.Between(60, 130),
                    color: color,
                    alpha: 0.55,
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
                    radius: Phaser.Math.Between(30, 70),
                    color: color,
                    alpha: 0.45,
                    drift: {
                        vx: Phaser.Math.Between(-18, 18),
                        vy: Phaser.Math.Between(-25, 25)
                    },
                    parallax: 0.75,
                    layer: 'floating_shards'
                }));
            }
        }

        // =========================================================================
        // 5. GAMEPLAY LAYER (Ascending Platforms with Subtle Color Coding)
        // =========================================================================
        // Ground Spawn Platform (Ruby / Warm Red)
        this.addEntity([
            ...createSpawnPlatform(spawnX, spawnY, {
                width: 500,
                height: 80,
                color: 0x4a2228
            }),
            ZLayer('PLAY', 5)
        ]);

        // Ascending platforms jumping up to the summit
        for (let i = 1; i <= 15; i++) {
            const py = spawnY - i * 450;
            const px = (i % 2 === 0 ? 1 : -1) * Phaser.Math.Between(200, 600);
            const platformColor = getRainbowColorForY(py, summitY, spawnY, 0.4, 0.4);

            this.addEntity([
                ...createPlatform(px, py, {
                    width: Phaser.Math.Between(180, 320),
                    height: 50,
                    isStatic: true,
                    color: platformColor
                }),
                ZLayer('PLAY', 5)
            ]);
        }

        // Summit Landmark Platform (Electric Violet/Magenta at the peak)
        this.addEntity([
            ...createPlatform(0, summitY, {
                width: 600,
                height: 60,
                isStatic: true,
                color: 0x882299
            }),
            ZLayer('PLAY', 5)
        ]);

        // Player
        this.addEntity([
            ...createPlayer(spawnX, spawnY - 80),
            SlingshotJump(PHYSICS.SLINGSHOT_FORCE),
            ZLayer('PLAY', 0)
        ]);

        this.cameras.main.centerOn(spawnX, spawnY);
    }

    /**
     * Dynamically shifts the background atmospheric color and wash
     * across the full rainbow spectrum as the player climbs higher.
     */
    updateRainbowTint() {
        const player = this.entities.find(e => e.components.PlayerTag && e.components.Position);
        if (!player) return;

        const py = player.components.Position.y;
        const startY = -200;
        const summitY = -7000;

        // Map height into [0.0, 1.0]
        const climbT = Phaser.Math.Clamp((startY - py) / (startY - summitY), 0, 1);

        // Hue completes full 360° rainbow rotation as player climbs to the summit
        const hue = (climbT * 360) % 360;

        // 1. Smoothly update background clear color on the lowest camera
        const darkAtmosphere = Phaser.Display.Color.HSLToColor(hue / 360, 0.8, 0.06).color;
        this.backgroundColor = darkAtmosphere;

        // 2. Dynamically re-tint ambient wash overlay in the far haze layer
        if (this.ambientWashGfx) {
            this.ambientWashGfx.clear();
            const washColor = Phaser.Display.Color.HSLToColor(hue / 360, 0.95, 0.5).color;
            this.ambientWashGfx.fillStyle(washColor, 0.16);
            this.ambientWashGfx.fillRect(-2200, -8500, 4400, 9000);
        }
    }

    update(time, delta) {
        this.updateRainbowTint();
        super.update(time, delta);
    }
}
