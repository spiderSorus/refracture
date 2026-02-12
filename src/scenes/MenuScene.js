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

        this.add.text(100, 100, 'REFRACT', {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'monospace'
        });

        this.options.forEach((opt, index) => {
            const text = this.add.text(100, 300 + (index * 60), opt, {
                fontSize: '32px',
                fill: '#666',
                fontFamily: 'monospace'
            });
            this.textObjects.push(text);
        });

        this.updateSelection();
    }

    update() {
        if (this.inputManager.getAction('UP')) {
            this.selected = (this.selected - 1 + this.options.length) % this.options.length;
            this.updateSelection();
        }
        else if (this.inputManager.getAction('DOWN')) {
            this.selected = (this.selected + 1) % this.options.length;
            this.updateSelection();
        }

        if (this.inputManager.getAction('SELECT')) {
            const choice = this.options[this.selected];
            if (choice === 'TEST SUITE') {
                this.scene.start('TestMenuScene');
            }
        }
    }

    updateSelection() {
        this.textObjects.forEach((text, index) => {
            if (index === this.selected) {
                text.setColor('rgb(234, 0, 255)');
                text.setText(`> ${this.options[index]}`);
            } else {
                text.setColor('#666');
                text.setText(`  ${this.options[index]}`);
            }
        });
    }
}