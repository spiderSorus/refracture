import Phaser from 'phaser';

export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.cursors = scene.input.keyboard.createCursorKeys();

        // Keyboard Mappings
        this.keys = scene.input.keyboard.addKeys({
            enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
            esc: Phaser.Input.Keyboard.KeyCodes.ESC,
            x: Phaser.Input.Keyboard.KeyCodes.X,
            y: Phaser.Input.Keyboard.KeyCodes.Y,
            tab: Phaser.Input.Keyboard.KeyCodes.TAB,
            next: Phaser.Input.Keyboard.KeyCodes.E, // Shoulder R1 equivalent
            prev: Phaser.Input.Keyboard.KeyCodes.Q  // Shoulder L1 equivalent
        });

        this.pad = null;
        this.prevPadState = {};

        this.scene.input.gamepad.on('connected', (pad) => {
            this.pad = pad;
        });
    }

    /**
     * For HOLD logic (Ability Arming)
     */
    isButtonDown(action) {
        // Check Keyboard
        if (action === 'X' && this.keys.x.isDown) return true;
        if (action === 'Y' && this.keys.y.isDown) return true;

        // Check Gamepad
        if (this.pad) {
            if (action === 'X' && this.pad.X) return true;
            if (action === 'Y' && this.pad.Y) return true;
        }
        return false;
    }

    /**
     * For TAP logic (Menu / Ring Buffer Cycling)
     */
    getAction(action) {
        // Internal helper for "JustDown" check
        const justDown = (key) => Phaser.Input.Keyboard.JustDown(key);

        if (action === 'NEXT_TARGET') {
            return justDown(this.keys.next) || this.isButtonPressed('R1');
        }
        if (action === 'UP') return justDown(this.cursors.up) || this.isButtonPressed('up');
        if (action === 'DOWN') return justDown(this.cursors.down) || this.isButtonPressed('down');
        if (action === 'SELECT') return justDown(this.keys.enter) || this.isButtonPressed('A');
        if (action === 'BACK') return justDown(this.keys.esc) || this.isButtonPressed('B');

        return false;
    }

    // Helper for Gamepad "JustDown" equivalent
    isButtonPressed(button) {
        if (!this.pad) return false;
        const isDown = this.pad[button];
        const wasDown = this.prevPadState[button] || false;
        this.prevPadState[button] = isDown;
        return isDown && !wasDown;
    }

    getMovement() {
        let x = 0, y = 0;
        if (this.cursors.left.isDown) x = -1;
        else if (this.cursors.right.isDown) x = 1;
        if (this.cursors.up.isDown) y = -1;
        else if (this.cursors.down.isDown) y = 1;

        if (this.pad) {
            const t = 0.15;
            if (Math.abs(this.pad.leftStick.x) > t) x = this.pad.leftStick.x;
            if (Math.abs(this.pad.leftStick.y) > t) y = this.pad.leftStick.y;
        }
        return { x, y };
    }
}