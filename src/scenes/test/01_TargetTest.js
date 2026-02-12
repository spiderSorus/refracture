import { createPlayer } from '../../ecs/entities/player';
import { createTarget } from '../../ecs/entities/target';
import {
    MovementSystem,
    PhysicsSystem,
    RenderSystem,
    AbilityTargetingSystem, // Fixed Import
    TargetRenderSystem      // Fixed Import
} from '../../ecs/systems/index';
import { AbilityState, EntityType } from '../../ecs/components/index';
import { BaseTestScene } from './BaseTestScene';

export class TargetTest extends BaseTestScene {
    constructor() {
        super('TargetTest', 'Targeting Test', 'Hold X/Y to test Spiral Logic. Tap E to cycle.');
    }

    create() {
        super.create();

        // 1. Player needs AbilityState to track current targets
        this.addEntity([...createPlayer(400, 300), AbilityState()]);

        // 2. Targets need EntityType to be filterable
        this.addEntity([...createTarget(200, 200), EntityType('A')]);
        this.addEntity([...createTarget(600, 200), EntityType('A')]);
        this.addEntity([...createTarget(600, 500), EntityType('A')]);
        this.addEntity([...createTarget(200, 500), EntityType('B')]);
    }

    update(time, delta) {
        if (!super.update(time, delta)) return;

        // Sequence: Movement -> Targeting Logic -> Targeting Visuals -> Rendering
        MovementSystem(this.entities, this.inputManager);

        AbilityTargetingSystem(this.entities, this.inputManager);
        TargetRenderSystem(this.entities, this);

        RenderSystem(this.entities, this);
        PhysicsSystem(this.entities, delta);
    }
}