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
            console.log(`Gamepad connected: ${pad.id}`);
            this.pad = pad;
        });
    }

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

        // --- MEDITATION TRIGGERS ---
        if (action === 'ELEVATE') {
            // Check Keyboard (E)
            if (this.keys.lengthen.isDown) return true;
            // Check Gamepad R2 (Button 7)
            if (this.pad) {
                const btn = this.pad.buttons[7];
                if (btn && (btn.pressed || btn.value > 0.1)) return true;
                // Some pads map R2 differently
                if (this.pad.R2 > 0.1) return true;
            }
        }
        if (action === 'DECLINE') {
            // Check Keyboard (Q)
            if (this.keys.shorten.isDown) return true;
            // Check Gamepad L2 (Button 6)
            if (this.pad) {
                const btn = this.pad.buttons[6];
                if (btn && (btn.pressed || btn.value > 0.1)) return true;
                if (this.pad.L2 > 0.1) return true;
            }
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
        
        if (action === 'SELECT') return justDown(this.keys.enter) || justDown(this.keys.x) || this.isButtonPressed('A') || this.isButtonPressed('X');
        if (action === 'BACK') return justDown(this.keys.esc) || justDown(this.keys.b) || this.isButtonPressed('B');

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

    getZoom() {
        let zoom = 0;
        if (this.pad) {
            // L2 (button 6) to zoom out, R2 (button 7) to zoom in
            const l2 = this.pad.buttons[6]?.value || 0;
            const r2 = this.pad.buttons[7]?.value || 0;
            zoom = r2 - l2;
        } else {
            // Keyboard fallbacks for testing: I and O
            if (this.scene.input.keyboard.addKey('I').isDown) zoom = 1;
            if (this.scene.input.keyboard.addKey('O').isDown) zoom = -1;
        }
        return zoom;
    }

    getRightStickRaw() {
        let x = 0, y = 0;
        if (this.pad) {
            x = this.pad.rightStick.x;
            y = this.pad.rightStick.y;
        }
        return { x, y };
    }

    getRightStick() {
        const raw = this.getRightStickRaw();
        const deadzone = 0.15;
        const mag = Math.sqrt(raw.x * raw.x + raw.y * raw.y);
        if (mag < deadzone) return { x: 0, y: 0 };
        return raw;
    }
}
