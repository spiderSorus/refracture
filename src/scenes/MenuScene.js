import { BaseMenuScene } from './BaseMenuScene';

export class MenuScene extends BaseMenuScene {
    constructor() {
        super('MenuScene', 'REFRACT');
        this.options = ['START GAME', 'LOAD GAME', 'TEST SUITE'];
    }

    handleSelection() {
        const choice = this.options[this.selected];
        if (choice === 'TEST SUITE') {
            this.scene.start('TestMenuScene');
        } else {
            console.log("Not implemented yet:", choice);
        }
    }
}