import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import {
    Position, Renderable, Collider, PlatformTag, Parent, AbilityState
} from '../../ecs/components/index';

export class MovementTest extends BaseTestScene {
    constructor() {
        super('MovementTest', 'Restrained Movement', 'Player tethered. Hold X/Y to target.');
    }

    create() {
        super.create();

        const cage = this.addEntity([
            { id: 'cage_platform' },
            Position(400, 300),
            // Updated to Renderable
            Renderable({
                'BASE': { type: 'circle', radius: 100, color: 0x333333 }
            }),
            Collider('circle', 100),
            PlatformTag()
        ]);

        this.addEntity([
            ...createPlayer(400, 300),
            AbilityState(),
            Parent(cage.id, { x: 0, y: 0 })
        ]);

        this.cameras.main.centerOn(400, 300);
    }
}