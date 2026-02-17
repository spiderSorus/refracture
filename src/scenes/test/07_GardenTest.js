import Phaser from 'phaser';
import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import { Position, Renderable, ViewLayers, CameraTarget, AbilityState } from '../../ecs/components/index';
import { LayeredRenderSystem } from '../../ecs/systems/LayeredRenderSystem';

export class GardenTest extends BaseTestScene {
    constructor() {
        super('GardenTest', 'Contract Test', 'Player: Red Emit / Yellow Absorb. Grid: Random Emit.');
    }

    create() {
        super.create();

        // 1. PLAYER: Red Dot + Dual Emitter Signature
        const player = this.addEntity([
            ...createPlayer(0, 0),
            AbilityState(),
            CameraTarget(),
            ViewLayers(['BASE', 'FAIRY', 'CHAOS'])
        ]);

        player.components.Renderable.definitions = {
            'BASE': { type: 'circle', radius: 5, color: 0xff0000 },
            'FAIRY': {
                type: 'fairy_glow',
                size: 0.6, coreColor: 0xff0000,
                intensity: 1.0, push: 0.5 // RED EMIT
            },
            'CHAOS': {
                type: 'chaos_emitter',
                size: 0.4, headColor: 0xffff00, tracerColor: 0xffaa00,
                intensity: 1.2, push: -1.2, // YELLOW ABSORB
                maxParticles: 40
            }
        };

        const gridSize = 11;
        const spacing = 200;
        const offset = 5 * spacing;

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (x === 5 && y === 5) continue;

                const posX = (x * spacing) - offset;
                const posY = (y * spacing) - offset;
                const isFairy = Math.random() > 0.5;
                const randomColor = Phaser.Display.Color.RandomRGB().color;

                this.addEntity([
                    Position(posX, posY),
                    Renderable({
                        'BASE': {
                            type: isFairy ? 'fairy_glow' : 'chaos_emitter',
                            size: 0.8,
                            coreColor: randomColor,
                            headColor: randomColor,
                            tracerColor: randomColor,
                            intensity: 0.1,
                            push: 0.3 // ALL GRID ENTITIES PUSH OUT (EMIT)
                        }
                    })
                ]);
            }
        }
        this.cameras.main.setZoom(1.2);
    }

    update(time, delta) {
        super.update(time, delta);
        const player = this.entities.find(e => e.components.PlayerTag);
        if (!player) return;

        const pPos = player.components.Position;
        this.entities.forEach(entity => {
            const renderable = entity.components.Renderable;
            const pos = entity.components.Position;
            if (!renderable || !pos || entity.components.PlayerTag) return;

            const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, pos.x, pos.y);
            const intensity = dist < 300 ? 0.1 + (Math.pow(1 - (dist / 300), 1.5) * 2.5) : 0.1;
            renderable.definitions['BASE'].intensity = intensity;
        });

        LayeredRenderSystem(this.entities, this);
    }
}