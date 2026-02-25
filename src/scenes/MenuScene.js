import { BaseMenuScene } from './BaseMenuScene';

export class MenuScene extends BaseMenuScene {
    constructor() {
        super('MenuScene', 'REFRACT');
        this.options = ['START GAME', 'TEST SUITE'];
    }

    handleSelection() {
        const choice = this.options[this.selected];
        if (choice === 'START GAME') {
            this.scene.start('Gameplay');
        } else if (choice === 'TEST SUITE') {
            this.scene.start('TestMenuScene');
        }
    }
}