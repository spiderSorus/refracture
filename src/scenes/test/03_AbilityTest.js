import { createPlayer } from '../../ecs/entities/player';
import { EntityType, AbilityState, CameraTarget } from '../../ecs/components/index';
import { AbilityTargetingSystem } from '../../ecs/systems/AbilityTargetingSystem';
import { TargetRenderSystem } from '../../ecs/systems/TargetRenderSystem';
import { BaseTestScene } from './BaseTestScene';
import { MovementSystem } from '../../ecs/systems/MovementSystem';
import { RenderSystem } from '../../ecs/systems/RenderSystem';
import { PhysicsSystem } from '../../ecs/systems/PhysicsSystem';
import { CameraSystem } from '../../ecs/systems/CameraSystem';

export class AbilityTest extends BaseTestScene {
    constructor() {
        super('AbilityTest', 'Ability Test', 'Hold X (A/B) or Y (C). E/Q to Cycle.');
    }

    create() {
        super.create();
        this.addEntity([...createPlayer(0, 0), AbilityState(), CameraTarget()]);

        const types = [
            { id: 'A', color: 0x0000ff, tex: 'rect' },
            { id: 'B', color: 0x00ff00, tex: 'rect' },
            { id: 'C', color: 0xffff00, tex: 'circle' }
        ];

        types.forEach(t => {
            for (let i = 0; i < 15; i++) {
                this.addEntity([
                    { _type: 'Position', x: Phaser.Math.Between(-600, 600), y: Phaser.Math.Between(-400, 400) },
                    { _type: 'Graphic', texture: t.tex, color: t.color },
                    EntityType(t.id),
                    CameraTarget()
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
        CameraSystem(this.entities, this);
    }
}