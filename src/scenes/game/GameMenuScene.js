// src/scenes/game/GameMenuScene.js
import { BaseMenuScene } from '../BaseMenuScene';

export class GameMenuScene extends BaseMenuScene {
    constructor() {
        super('GameMenuScene', 'REFRACTURE', 'A game about a spider.');
        this.options = ['ENTER UNIVERSE'];
    }

    handleSelection() {
        const choice = this.options[this.selected];
        if (choice === 'ENTER UNIVERSE') {
            this.scene.start('RefractureGameScene');
        }
    }
}
