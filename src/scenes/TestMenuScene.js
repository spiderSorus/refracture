import { BaseMenuScene } from './BaseMenuScene';
import { TestScenes } from './test/index';

export class TestMenuScene extends BaseMenuScene {
    constructor() {
        super('TestMenuScene', 'LAB / TEST SUITE', 'Environment & System Debug');
        this.options = TestScenes.map(sceneClass => ({
            label: sceneClass.name,
            scene: sceneClass.name
        }));
    }

    handleSelection() {
        const choice = this.options[this.selected];
        this.scene.start(choice.scene);
    }

    handleBack() {
        this.scene.start('MenuScene');
    }
}