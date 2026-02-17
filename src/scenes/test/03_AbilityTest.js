import { createPlayer } from '../../ecs/entities/player';
import { EntityType, AbilityState, CameraTarget, Position, Renderable } from '../../ecs/components/index';
import { BaseTestScene } from './BaseTestScene';
import Phaser from 'phaser'; // Needed for Math

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
                    Position(Phaser.Math.Between(-600, 600), Phaser.Math.Between(-400, 400)),
                    // Updated to Renderable
                    Renderable({
                        'BASE': { type: t.tex, color: t.color, width: 15, height: 15, radius: 8 }
                    }),
                    EntityType(t.id),
                    CameraTarget()
                ]);
            }
        });
    }
}