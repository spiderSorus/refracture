import { BaseMenuScene } from './BaseMenuScene';
import { TestScenes } from './test/index';

export class TestMenuScene extends BaseMenuScene {
    constructor() {
        super('TestMenuScene', 'LAB / TEST SUITE', 'Environment & System Debug');
        const sortedScenes = [...TestScenes].reverse();
        this.options = sortedScenes.map(sceneClass => ({
            label: sceneClass.name,
            scene: sceneClass.name
        }));

        // Add a gap/separator to indicate the end of the cycle
        this.options.push({ label: ' ', isSeparator: true });
        
        this.selected = 0; // Ensure newest is selected
    }

    handleSelection() {
        const choice = this.options[this.selected];
        if (choice && !choice.isSeparator) {
            this.scene.start(choice.scene);
        }
    }

    handleBack() {
        this.scene.start('MenuScene');
    }
}