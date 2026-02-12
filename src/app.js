// src/app.js
import Phaser from 'phaser';

// Define the Scene
class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        // Create a simple white circle texture
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(16, 16, 16); // radius 16
        graphics.generateTexture('playerCircle', 32, 32);

        // Add the player
        this.player = this.physics.add.sprite(400, 300, 'playerCircle');
        this.player.setCollideWorldBounds(true);

        // Setup keys
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        const speed = 300;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }
    }
}

// Config
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#080808',
    parent: 'game-container', // Matches the ID in index.html
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    scene: MainScene
};

const game = new Phaser.Game(config);