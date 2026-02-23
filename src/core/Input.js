import Phaser from 'phaser';

export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.cursors = scene.input.keyboard.createCursorKeys();

        this.keys = scene.input.keyboard.addKeys({
            enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
            esc: Phaser.Input.Keyboard.KeyCodes.ESC,
            x: Phaser.Input.Keyboard.KeyCodes.X,
            y: Phaser.Input.Keyboard.KeyCodes.Y,
            b: Phaser.Input.Keyboard.KeyCodes.B,
            tab: Phaser.Input.Keyboard.KeyCodes.TAB,
            shorten: Phaser.Input.Keyboard.KeyCodes.Q,
            lengthen: Phaser.Input.Keyboard.KeyCodes.E,
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.pad = null;
        this.prevPadState = {};

        this.scene.input.gamepad.on('connected', (pad) => {
            this.pad = pad;
        });
    }

    // CRITICAL: Call this at the start of your Scene's update()
    update() {
        if (this.scene.input.gamepad.total > 0) {
            this.pad = this.scene.input.gamepad.getPad(0);
        }
    }

    isButtonDown(action) {
        if (action === 'X' && (this.keys.x.isDown)) return true;
        if (action === 'Y' && (this.keys.y.isDown)) return true;
        if (action === 'B' && (this.keys.b.isDown || this.keys.esc.isDown)) return true;

        if (action === 'SHORTEN') {
            if (this.keys.shorten.isDown) return true;
            if (this.pad && (this.pad.L1 || this.pad.buttons[4].pressed)) return true;
        }
        if (action === 'LENGTHEN') {
            if (this.keys.lengthen.isDown) return true;
            if (this.pad && (this.pad.R1 || this.pad.buttons[5].pressed)) return true;
        }

        if (this.pad) {
            if (action === 'X' && (this.pad.X || this.pad.buttons[2].pressed)) return true;
            if (action === 'Y' && (this.pad.Y || this.pad.buttons[3].pressed)) return true;
            if (action === 'B' && (this.pad.B || this.pad.buttons[1].pressed)) return true;
        }
        return false;
    }

    getAction(action) {
        const justDown = (key) => Phaser.Input.Keyboard.JustDown(key);

        if (action === 'UP') return justDown(this.cursors.up) || justDown(this.keys.w) || this.isButtonPressed('up');
        if (action === 'DOWN') return justDown(this.cursors.down) || justDown(this.keys.s) || this.isButtonPressed('down');
        if (action === 'LEFT') return justDown(this.cursors.left) || justDown(this.keys.a) || this.isButtonPressed('left');
        if (action === 'RIGHT') return justDown(this.cursors.right) || justDown(this.keys.d) || this.isButtonPressed('right');
        
        if (action === 'SELECT') return justDown(this.keys.enter) || this.isButtonPressed('A');
        if (action === 'BACK') return justDown(this.keys.esc) || this.isButtonPressed('B');

        if (action === 'NEXT_TARGET') return justDown(this.keys.lengthen) || this.isButtonPressed('R1');
        if (action === 'PREV_TARGET') return justDown(this.keys.shorten) || this.isButtonPressed('L1');

        return false;
    }

    isButtonPressed(button) {
        if (!this.pad) return false;

        let isDown = false;
        const stickThreshold = 0.5;

        if (button === 'up') {
            isDown = this.pad.up || this.pad.buttons[12].pressed || this.pad.leftStick.y < -stickThreshold;
        }
        else if (button === 'down') {
            isDown = this.pad.down || this.pad.buttons[13].pressed || this.pad.leftStick.y > stickThreshold;
        }
        else if (button === 'left') {
            isDown = this.pad.left || this.pad.buttons[14].pressed || this.pad.leftStick.x < -stickThreshold;
        }
        else if (button === 'right') {
            isDown = this.pad.right || this.pad.buttons[15].pressed || this.pad.leftStick.x > stickThreshold;
        }
        else if (button === 'A') isDown = this.pad.A || this.pad.buttons[0].pressed;
        else if (button === 'B') isDown = this.pad.B || this.pad.buttons[1].pressed;
        else if (button === 'X') isDown = this.pad.X || this.pad.buttons[2].pressed;
        else if (button === 'Y') isDown = this.pad.Y || this.pad.buttons[3].pressed;
        else if (button === 'L1') isDown = this.pad.L1 || this.pad.buttons[4].pressed;
        else if (button === 'R1') isDown = this.pad.R1 || this.pad.buttons[5].pressed;
        else if (this.pad[button]) isDown = this.pad[button];

        const wasDown = this.prevPadState[button] || false;
        this.prevPadState[button] = isDown;

        return isDown && !wasDown;
    }

    getMovement() {
        let x = 0, y = 0;
        if (this.keys.a.isDown) x = -1;
        else if (this.keys.d.isDown) x = 1;
        if (this.keys.w.isDown) y = -1;
        else if (this.keys.s.isDown) y = 1;

        if (this.pad) {
            const t = 0.15;
            if (Math.abs(this.pad.leftStick.x) > t) x = this.pad.leftStick.x;
            if (Math.abs(this.pad.leftStick.y) > t) y = this.pad.leftStick.y;
        }
        return { x, y };
    }

    getRightStickRaw() {
        let x = 0, y = 0;
        if (this.pad) {
            x = this.pad.rightStick.x;
            y = this.pad.rightStick.y;
        } else {
            if (this.cursors.left.isDown) x = -1;
            else if (this.cursors.right.isDown) x = 1;
            if (this.cursors.up.isDown) y = -1;
            else if (this.cursors.down.isDown) y = 1;
        }
        return { x, y };
    }
}
