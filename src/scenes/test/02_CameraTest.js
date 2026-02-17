import { createPlayer } from '../../ecs/entities/player';
import { createTarget } from '../../ecs/entities/target';
import { CameraTarget, AbilityState } from '../../ecs/components/index';
import { BaseTestScene } from './BaseTestScene';

export class CameraTest extends BaseTestScene {
    constructor() {
        super('CameraTest', 'Camera Focus', 'Face Target (200,200) & Hold X to Lock.');
    }

    create() {
        super.create();

        this.addEntity([
            ...createTarget(200, 200, 'A'),
            CameraTarget()
        ]);

        this.addEntity([
            ...createPlayer(0, 0),
            AbilityState(),
            CameraTarget()
        ]);

        this.cameras.main.centerOn(0, 0);
    }
}