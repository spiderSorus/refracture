import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Collider, PlatformTag, Graphic, CameraTarget, Parent, AbilityState
} from '../../ecs/components/index';

export class OrbitTest extends BaseTestScene {
    constructor() {
        super('OrbitTest', 'Circular Orbit', 'Player orbits. Hold X to Target.');
        this.theta = 0;
        this.orbitRadius = 300;
        this.orbitSpeed = 0.01;
    }

    create() {
        super.create();

        this.addEntity([
            { id: 'sun' },
            Position(0, 0),
            Graphic('circle', 0xffcc00, 50),
            Collider('circle', 50),
            PlatformTag(),
            CameraTarget()
        ]);

        this.addEntity([
            { id: 'planet' },
            Position(this.orbitRadius, 0),
            Graphic('circle', 0x00aaff, 50),
            Collider('circle', 50),
            PlatformTag(),
            CameraTarget()
        ]);

        this.addEntity([
            ...createPlayer(0, 0),
            AbilityState(),
            Parent('planet', { x: 0, y: -40 })
        ]);
    }

    // Custom Orbit Math running in the fixed loop
    fixedUpdate(time, dt) {
        this.theta += this.orbitSpeed;
        const planet = this.entities.find(e => e.id === 'planet');

        if (planet && planet.components.Position) {
            planet.components.Position.x = Math.cos(this.theta) * this.orbitRadius;
            planet.components.Position.y = Math.sin(this.theta) * this.orbitRadius;
        }
    }
}