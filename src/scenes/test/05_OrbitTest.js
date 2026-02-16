import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Collider, PlatformTag,
    Graphic, CameraTarget, Parent
} from '../../ecs/components/index';

import { AttachmentSystem } from '../../ecs/systems/AttachmentSystem';
import { MovementSystem } from '../../ecs/systems/MovementSystem';
import { PhysicsSystem } from '../../ecs/systems/PhysicsSystem';
import { RenderSystem } from '../../ecs/systems/RenderSystem';
import { CameraSystem } from '../../ecs/systems/CameraSystem';
import { DebugLayerSystem } from '../../ecs/systems/DebugLayerSystem';

export class OrbitTest extends BaseTestScene {
    constructor() {
        super('OrbitTest', 'Circular Orbit', 'Player starts on Planet. B to Toggle.');
        this.theta = 0; // The orbital angle
        this.orbitRadius = 300;
        this.orbitSpeed = 0.01;
    }

    create() {
        super.create();

        // 1. The Sun (The Anchor)
        this.addEntity([
            { id: 'sun' },
            Position(0, 0),
            Graphic('circle', 0xffcc00, 50),
            Collider('circle', 50),
            PlatformTag(),
            CameraTarget()
        ]);

        // 2. The Planet (The Mover)
        this.addEntity([
            { id: 'planet' },
            Position(this.orbitRadius, 0),
            Graphic('circle', 0x00aaff, 50),
            Collider('circle', 50),
            PlatformTag(),
            CameraTarget()
        ]);

        // 3. The Player (Start Parented to Planet)
        this.addEntity([
            ...createPlayer(0, 0),
            Parent('planet', { x: 0, y: -40 }) // Start 40px north of planet center
        ]);
    }

    update(time, delta) {
        if (!super.update(time, delta)) return;

        // --- ORBITAL MATH ---
        this.theta += this.orbitSpeed;
        const planet = this.entities.find(e => e.id === 'planet');

        if (planet && planet.components.Position) {
            planet.components.Position.x = Math.cos(this.theta) * this.orbitRadius;
            planet.components.Position.y = Math.sin(this.theta) * this.orbitRadius;
        }

        // --- ECS FLOW ---
        MovementSystem(this.entities, this.inputManager);
        AttachmentSystem(this.entities, this.inputManager);
        PhysicsSystem(this.entities, delta); // Syncs Player Position to Planet Position + Offset
        CameraSystem(this.entities, this);
        RenderSystem(this.entities, this);
        DebugLayerSystem(this.entities, this);
    }
}