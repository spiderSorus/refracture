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

        // Immediately check for already connected pads
        this.selectPad();
        if (this.pad) {
            console.log(`[INPUT] Initialized with existing gamepad: ${this.pad.id}`);
        }

        this.scene.input.gamepad.on('connected', (pad) => {
            console.log(`[INPUT] Gamepad connected: ${pad.id} (buttons: ${pad.buttons?.length || 0}, axes: ${pad.axes?.length || 0})`);
            this.selectPad();
        });
    }

    selectPad() {
        if (!this.scene.input.gamepad) return;
        const pads = this.scene.input.gamepad.getAll();
        if (pads.length === 0) return;

        // Prefer a gamepad that actually exposes buttons or axes (avoids macOS 0-button vendor HID interfaces)
        const activePad = pads.find(p => p && p.connected && ((p.buttons && p.buttons.length > 0) || (p.axes && p.axes.length > 0)))
            || pads.find(p => p && ((p.buttons && p.buttons.length > 0) || (p.axes && p.axes.length > 0)))
            || pads[0];

        if (activePad && this.pad !== activePad) {
            this.pad = activePad;
            this.seedPadState();
        }
    }

    getRawPadButtonState(button) {
        if (!this.pad) return false;
        const stickThreshold = 0.5;
        if (button === 'up') return !!(this.pad.up || this.pad.buttons[12]?.pressed || this.pad.leftStick.y < -stickThreshold);
        if (button === 'down') return !!(this.pad.down || this.pad.buttons[13]?.pressed || this.pad.leftStick.y > stickThreshold);
        if (button === 'left') return !!(this.pad.left || this.pad.buttons[14]?.pressed || this.pad.leftStick.x < -stickThreshold);
        if (button === 'right') return !!(this.pad.right || this.pad.buttons[15]?.pressed || this.pad.leftStick.x > stickThreshold);
        if (button === 'A') return !!(this.pad.A || this.pad.buttons[0]?.pressed);
        if (button === 'B') return !!(this.pad.B || this.pad.buttons[1]?.pressed);
        if (button === 'X') return !!(this.pad.X || this.pad.buttons[2]?.pressed);
        if (button === 'Y') return !!(this.pad.Y || this.pad.buttons[3]?.pressed);
        if (button === 'L1') return !!(this.pad.L1 || this.pad.buttons[4]?.pressed);
        if (button === 'R1') return !!(this.pad.R1 || this.pad.buttons[5]?.pressed);
        return !!this.pad[button];
    }

    seedPadState() {
        const tracked = ['up', 'down', 'left', 'right', 'A', 'B', 'X', 'Y', 'L1', 'R1'];
        for (const btn of tracked) {
            this.prevPadState[btn] = this.getRawPadButtonState(btn);
        }
    }

    update() {
        if (this.scene.input.gamepad && this.scene.input.gamepad.total > 0) {
            this.selectPad();
        }
    }

    isButtonDown(action) {
        if (action === 'X' && (this.keys.x.isDown)) return true;
        if (action === 'Y' && (this.keys.y.isDown)) return true;
        if (action === 'B' && (this.keys.b.isDown || this.keys.esc.isDown)) return true;

        if (action === 'SHORTEN') {
            if (this.keys.shorten.isDown) return true;
            if (this.pad && (this.pad.L1 || this.pad.buttons[4]?.pressed)) return true;
        }
        if (action === 'LENGTHEN') {
            if (this.keys.lengthen.isDown) return true;
            if (this.pad && (this.pad.R1 || this.pad.buttons[5]?.pressed)) return true;
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
            if (action === 'X' && (this.pad.X || this.pad.buttons[2]?.pressed)) return true;
            if (action === 'Y' && (this.pad.Y || this.pad.buttons[3]?.pressed)) return true;
            if (action === 'B' && (this.pad.B || this.pad.buttons[1]?.pressed)) return true;
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

        const isDown = this.getRawPadButtonState(button);
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
