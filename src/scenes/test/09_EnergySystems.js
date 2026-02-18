import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position,
    Renderable,
    Collider,
    PlatformTag,
    Parent,
    AbilityState,
    EntityType,
    ConnectionPoint,
    EnergySource // Import this
} from '../../ecs/components/index';

export class EnergySystems extends BaseTestScene {
    constructor() {
        super('EnergySystems', 'Energy Systems', 'Energy Fields Drive You. RB to Attach.');
    }

    create() {
        super.create();

        const radius = 400;
        const platformRadius = 60;
        const platforms = [];

        // 1. Create 5 Platforms
        for (let i = 0; i < 5; i++) {
            const angleDeg = (i * 72) - 90;
            const angleRad = angleDeg * (Math.PI / 180);

            const px = Math.cos(angleRad) * radius;
            const py = Math.sin(angleRad) * radius;

            // Platform 0 (Top) is the EMITTER. Others are ABSORBERS.
            // Absorbers have negative strength (Pull). Emitters have positive (Push).
            const isEmitter = (i === 0);
            const strength = isEmitter ? 500 : -300;
            const type = isEmitter ? 'EMIT' : 'ABSORB';
            const color = isEmitter ? 0xff4400 : 0x0044ff; // Red push, Blue pull

            const platform = this.addEntity([
                { id: `platform_${i}` },
                Position(px, py),
                Renderable({
                    'BASE': { type: 'circle', radius: platformRadius, color: color }
                }),
                Collider('circle', platformRadius),
                PlatformTag(),
                EntityType('PLATFORM'),
                ConnectionPoint(0, 0),
                EnergySource(strength, type) // Add Energy Source
            ]);
            platforms.push(platform);
        }

        // 2. Create Player
        const startPlat = platforms[0];
        const startPos = startPlat.components.Position;

        this.addEntity([
            ...createPlayer(startPos.x, startPos.y),
            AbilityState(),
            Parent(startPlat.id, { x: 0, y: 0 }),
            ConnectionPoint(0, 0)
        ]);

        this.cameras.main.centerOn(0, 0);
        this.cameras.main.setZoom(0.6);
    }
}