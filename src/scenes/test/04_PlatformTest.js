import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Velocity, Collider, PlatformTag, Renderable, CameraTarget, AbilityState
} from '../../ecs/components/index';

export class PlatformTest extends BaseTestScene {
    constructor() {
        super('PlatformTest', 'Platform Snapping', 'Move onto circles. Hold X to Target.');
    }

    create() {
        super.create();

        this.addEntity([...createPlayer(-300, 0), AbilityState()]);

        // Safe Platform
        this.addEntity([
            Position(0, 0),
            // Updated
            Renderable({
                'BASE': { type: 'circle', radius: 50, color: 0x333333 }
            }),
            Collider('circle', 50),
            PlatformTag(),
            CameraTarget()
        ]);

        // Mover
        this.addEntity([
            { id: 'mover_invisible' },
            Position(400, 0),
            Velocity(0, 150),
            // No graphic needed, or empty renderable
            Renderable({}),
            Collider('rect', 0, 200, 200),
            PlatformTag(),
            CameraTarget()
        ]);

        this.cameras.main.centerOn(-300, 0);
    }

    fixedUpdate(time, dt) {
        const mover = this.entities.find(e => e.id === 'mover_invisible');
        if (mover && mover.components.Velocity) {
            mover.components.Velocity.y = Math.sin(time / 1000) * 200;
        }
    }
}