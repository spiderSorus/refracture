import Phaser from 'phaser';

export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.enter = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.esc = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.pad = null;
        this.lastInputTime = 0;
        this.debounceTime = 150;

        this.scene.input.gamepad.once('connected', (pad) => {
            this.pad = pad;
        });
    }

    getAction(action) {
        const now = this.scene.time.now;
        if (now - this.lastInputTime < this.debounceTime) return false;

        let active = false;
        if (action === 'UP') {
            active = this.cursors.up.isDown || (this.pad?.dpadUp) || (this.pad?.leftStick.y < -0.5);
        } else if (action === 'DOWN') {
            active = this.cursors.down.isDown || (this.pad?.dpadDown) || (this.pad?.leftStick.y > 0.5);
        } else if (action === 'SELECT') {
            active = this.enter.isDown || this.pad?.A;
        } else if (action === 'BACK') {
            active = this.esc.isDown || this.pad?.B;
        }

        if (active) this.lastInputTime = now;
        return active;
    }

    getMovement() {
        let x = 0;
        let y = 0;

        if (this.cursors.left.isDown) x = -1;
        else if (this.cursors.right.isDown) x = 1;

        if (this.cursors.up.isDown) y = -1;
        else if (this.cursors.down.isDown) y = 1;

        if (this.pad) {
            if (Math.abs(this.pad.leftStick.x) > 0.1) x = this.pad.leftStick.x;
            if (Math.abs(this.pad.leftStick.y) > 0.1) y = this.pad.leftStick.y;
        }

        return { x, y };
    }
}