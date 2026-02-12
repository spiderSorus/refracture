import { createPlayer } from '../../ecs/entities/player';
import { EntityType, AbilityState, CameraTarget } from '../../ecs/components/index';
import { AbilityTargetingSystem } from '../../ecs/systems/AbilityTargetingSystem';
import { TargetRenderSystem } from '../../ecs/systems/TargetRenderSystem';
import { BaseTestScene } from './BaseTestScene';

// Direct system imports
import { MovementSystem } from '../../ecs/systems/MovementSystem';
import { RenderSystem } from '../../ecs/systems/RenderSystem';
import { PhysicsSystem } from '../../ecs/systems/PhysicsSystem';
import { CameraSystem } from '../../ecs/systems/CameraSystem';

export class AbilityTest extends BaseTestScene {
    constructor() {
        super('AbilityTest', 'Ability Targeting', 'Hold X (A/B) or Y (C). Tap E to cycle.');
    }

    create() {
        super.create();

        // 1. Spawn Player with CameraTarget
        this.addEntity([...createPlayer(0, 0), AbilityState(), CameraTarget()]);

        const types = [
            { id: 'A', color: 0x0000ff, texture: 'rect' },
            { id: 'B', color: 0x00ff00, texture: 'rect' },
            { id: 'C', color: 0xffff00, texture: 'circle' }
        ];

        // 2. Scatter 15 of each
        types.forEach(typeCfg => {
            for (let i = 0; i < 15; i++) {
                const x = Phaser.Math.Between(-800, 800);
                const y = Phaser.Math.Between(-600, 600);

                this.addEntity([
                    { _type: 'Position', x, y },
                    { _type: 'Graphic', texture: typeCfg.texture, color: typeCfg.color },
                    EntityType(typeCfg.id),
                    CameraTarget() // All targets influence the camera zoom
                ]);
            }
        });
    }

    update(time, delta) {
        if (!super.update(time, delta)) return;

        MovementSystem(this.entities, this.inputManager);
        AbilityTargetingSystem(this.entities, this.inputManager);
        TargetRenderSystem(this.entities, this);
        RenderSystem(this.entities, this);
        PhysicsSystem(this.entities, delta);

        // Pass 'this' to let the camera look at all CameraTarget entities
        CameraSystem(this.entities, this);
    }
}