import { createPlayer } from '../../ecs/entities/player';
import { createTarget } from '../../ecs/entities/target';
import { AbilityState, EntityType, CameraTarget } from '../../ecs/components/index';
import { BaseTestScene } from './BaseTestScene';

export class TargetTest extends BaseTestScene {
    constructor() {
        super('TargetTest', 'Targeting Test', 'Hold X/Y to test Spiral Logic. Tap E to cycle.');
    }

    create() {
        super.create();

        // Player with targeting enabled
        this.addEntity([
            ...createPlayer(400, 300),
            AbilityState(),
            CameraTarget()
        ]);

        // Targets
        this.addEntity([...createTarget(200, 200), EntityType('A')]);
        this.addEntity([...createTarget(600, 200), EntityType('A')]);
        this.addEntity([...createTarget(600, 500), EntityType('A')]);
        this.addEntity([...createTarget(200, 500), EntityType('B')]);

        this.cameras.main.centerOn(400, 300);
    }
}