import Phaser from 'phaser';
import { InputManager } from '../core/Input';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
        this.options = ['START GAME', 'LOAD GAME', 'TEST SUITE'];
        this.selected = 0;
        this.textObjects = [];
    }

    create() {
        this.inputManager = new InputManager(this);
        this.textObjects = []; // CRITICAL: Reset the array

        this.add.text(100, 100, 'REFRACT', {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'monospace'
        });

        this.options.forEach((opt, index) => {
            const text = this.add.text(100, 300 + (index * 60), `  ${opt}`, {
                fontSize: '32px',
                fill: '#666',
                fontFamily: 'monospace'
            });
            this.textObjects.push(text);
        });

        this.updateSelection();
    }

    update() {
        this.inputManager.update();

        if (this.inputManager.getAction('UP')) {
            this.selected = (this.selected - 1 + this.options.length) % this.options.length;
            this.updateSelection();
        }
        else if (this.inputManager.getAction('DOWN')) {
            this.selected = (this.selected + 1) % this.options.length;
            this.updateSelection();
        }

        if (this.inputManager.getAction('SELECT')) {
            this.handleSelection();
        }
    }

    updateSelection() {
        this.textObjects.forEach((text, index) => {
            // Safety check to prevent the drawImage error during scene transitions
            if (!text || !text.active || !text.canvas) return;

            if (index === this.selected) {
                text.setColor('#0f0');
                text.setText(`> ${this.options[index]}`);
            } else {
                text.setColor('#666');
                text.setText(`  ${this.options[index]}`);
            }
        });
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