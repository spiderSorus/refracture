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
    ConnectionPoint
} from '../../ecs/components/index';

export class WebTest extends BaseTestScene {
    constructor() {
        super('WebTest', 'Web Mechanic Lab', 'Platforms at +/- 500. Hold X to target.');
    }

    create() {
        super.create();

        // 1. Left Platform (-500, 0)
        const leftPlatform = this.addEntity([
            { id: 'platform_left' },
            Position(-500, 0),
            Renderable({
                'BASE': { type: 'circle', radius: 100, color: 0x222222 }
            }),
            Collider('circle', 100),
            PlatformTag(),
            EntityType('PLATFORM'),
            ConnectionPoint(0, 0)
        ]);

        // 2. Right Platform (500, 0)
        this.addEntity([
            { id: 'platform_right' },
            Position(500, 0),
            Renderable({
                'BASE': { type: 'circle', radius: 100, color: 0x222222 }
            }),
            Collider('circle', 100),
            PlatformTag(),
            EntityType('PLATFORM'),
            ConnectionPoint(0, 0) // Top edge
        ]);

        // 3. Player: Starts in the center of the -500 platform
        this.addEntity([
            ...createPlayer(-500, 0),
            AbilityState(),
            Parent(leftPlatform.id, { x: 0, y: 0 }),
            // ConnectionPoint at -50 ensures web attaches to the back edge (5 units back)
            ConnectionPoint(0, 0)
        ]);

        this.cameras.main.centerOn(0, 0);
        this.cameras.main.setZoom(0.7);
    }
}