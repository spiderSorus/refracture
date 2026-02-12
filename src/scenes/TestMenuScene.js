import Phaser from 'phaser';
import { InputManager } from '../core/Input';
import { TestScenes } from './test/index';

export class TestMenuScene extends Phaser.Scene {
    constructor() {
        super('TestMenuScene');
        this.selected = 0;
        this.textObjects = [];
    }

    create() {
        this.inputManager = new InputManager(this);

        this.add.text(50, 50, 'SELECT TEST (ESC to Back)', {
            fontSize: '32px',
            fill: '#0ff',
            fontFamily: 'monospace'
        });

        TestScenes.forEach((sceneClass, index) => {
            const name = sceneClass.name;
            const text = this.add.text(100, 150 + (index * 50), name, {
                fontSize: '24px',
                fill: '#666',
                fontFamily: 'monospace'
            });
            this.textObjects.push(text);
        });

        this.updateSelection();
    }

    update() {
        if (this.inputManager.getAction('UP')) {
            this.selected = (this.selected - 1 + TestScenes.length) % TestScenes.length;
            this.updateSelection();
        }
        else if (this.inputManager.getAction('DOWN')) {
            this.selected = (this.selected + 1) % TestScenes.length;
            this.updateSelection();
        }

        if (this.inputManager.getAction('SELECT')) {
            const sceneToStart = TestScenes[this.selected];
            this.scene.start(sceneToStart.name);
        }

        if (this.inputManager.getAction('BACK')) {
            this.scene.start('MenuScene');
        }
    }

    updateSelection() {
        this.textObjects.forEach((text, index) => {
            if (index === this.selected) {
                text.setColor('rgb(234, 0, 255)');
                text.setText(`> ${TestScenes[index].name}`);
            } else {
                text.setColor('#666');
                text.setText(`  ${TestScenes[index].name}`);
            }
        });
    }
}