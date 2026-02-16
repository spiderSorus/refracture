import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';

// Direct Component Imports
import {
    Position,
    Velocity,
    Collider,
    PlatformTag,
    Graphic,
    Rotation,
    CameraTarget
} from '../../ecs/components/index';

// Direct System Imports
import { AttachmentSystem } from '../../ecs/systems/AttachmentSystem';
import { MovementSystem } from '../../ecs/systems/MovementSystem';
import { PhysicsSystem } from '../../ecs/systems/PhysicsSystem';
import { RenderSystem } from '../../ecs/systems/RenderSystem';
import { CameraSystem } from '../../ecs/systems/CameraSystem';
import { DebugLayerSystem } from '../../ecs/systems/DebugLayerSystem';

export class PlatformTest extends BaseTestScene {
    constructor() {
        super('PlatformTest', 'Platform Snapping', 'Move onto circles to stick. B to detach.');
    }

    create() {
        super.create();

        // 1. Spawn Player
        // We start the player at -300 so they have to walk onto the platform
        this.addEntity([...createPlayer(-300, 0)]);

        // 2. Visible "Safe" Platform
        // 100px diameter (radius 50)
        this.addEntity([
            Position(0, 0),
            Graphic('circle', 0x333333, 50),
            Collider('circle', 50),
            PlatformTag(),
            CameraTarget()
        ]);

        // 3. Invisible Automated Mover
        // This acts as a trigger zone that moves the player once they enter it
        this.addEntity([
            { id: 'mover_invisible' },
            Position(400, 0),
            Velocity(0, 150),
            Graphic('none'),
            Collider('rect', 0, 200, 200),
            PlatformTag(),
            CameraTarget()
        ]);
    }

    update(time, delta) {
        if (!super.update(time, delta)) return;

        // Oscillate the invisible platform vertically
        const mover = this.entities.find(e => e.id === 'mover_invisible');
        if (mover && mover.components.Velocity) {
            mover.components.Velocity.y = Math.sin(time / 1000) * 200;
        }

        // --- ECS System Execution ---

        // 1. Input & Logic
        MovementSystem(this.entities, this.inputManager);
        AttachmentSystem(this.entities, this.inputManager);

        // 2. State Resolution
        PhysicsSystem(this.entities, delta);

        // 3. View & UI
        CameraSystem(this.entities, this);
        RenderSystem(this.entities, this);

        // Final debug overlay (Pins status to top-left)
        DebugLayerSystem(this.entities, this);
    }
}