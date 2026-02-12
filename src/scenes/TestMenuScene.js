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
        this.textObjects = [];

        // Background / UI Header
        this.add.text(50, 50, 'LAB / TEST SUITE', {
            fontSize: '32px',
            fill: '#0ff',
            fontFamily: 'monospace'
        });

        // Generate menu items from the registry
        TestScenes.forEach((sceneClass, index) => {
            const name = sceneClass.name;
            const text = this.add.text(100, 150 + (index * 50), `  ${name}`, {
                fontSize: '24px',
                fill: '#666',
                fontFamily: 'monospace'
            });
            this.textObjects.push(text);
        });

        this.updateSelection();
    }

    update() {
        // Navigation
        if (this.inputManager.getAction('UP')) {
            this.selected = (this.selected - 1 + TestScenes.length) % TestScenes.length;
            this.updateSelection();
        }
        else if (this.inputManager.getAction('DOWN')) {
            this.selected = (this.selected + 1) % TestScenes.length;
            this.updateSelection();
        }

        // Action
        if (this.inputManager.getAction('SELECT')) {
            const sceneClass = TestScenes[this.selected];
            this.scene.start(sceneClass.name);
        }

        if (this.inputManager.getAction('BACK')) {
            this.scene.start('MenuScene');
        }
    }

    updateSelection() {
        this.textObjects.forEach((text, index) => {
            if (!text || !text.active) return;
            const sceneName = TestScenes[index].name;
            if (index === this.selected) {
                text.setColor('#0f0').setText(`> ${sceneName}`);
            } else {
                text.setColor('#666').setText(`  ${sceneName}`);
            }
        });
    }
}