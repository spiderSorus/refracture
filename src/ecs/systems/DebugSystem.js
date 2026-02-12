export class DebugSystem {
    constructor(scene) {
        this.scene = scene;
        this.isVisible = false;

        // Create a fixed container for the UI elements
        this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(1000);

        // Background for readability
        this.bg = scene.add.rectangle(0, 0, window.innerWidth, 120, 0x000000, 0.7)
            .setOrigin(0, 0);

        this.playerText = scene.add.text(20, 20, '', { font: '14px monospace', fill: '#0f0' });
        this.targetText = scene.add.text(window.innerWidth - 20, 20, '', { font: '14px monospace', fill: '#f0f' })
            .setOrigin(1, 0);

        this.container.add([this.bg, this.playerText, this.targetText]);
        this.container.setVisible(this.isVisible);

        // Toggle listener
        scene.input.keyboard.on('keydown-TAB', () => {
            this.isVisible = !this.isVisible;
            this.container.setVisible(this.isVisible);
        });
    }

    update(entities) {
        if (!this.isVisible) return;

        const player = entities.find(e => e.components.PlayerTag);
        const targetId = player?.components.Targeter?.currentTarget;
        const target = entities.find(e => e.id === targetId);

        // Update Player Stats (Top Left)
        if (player) {
            const pPos = player.components.Position;
            const pVel = player.components.Velocity;
            this.playerText.setText([
                `[ PLAYER ]`,
                `COORD: x:${pPos.x.toFixed(2)} y:${pPos.y.toFixed(2)}`,
                `VELO:  x:${pVel.x.toFixed(2)} y:${pVel.y.toFixed(2)}`,
                `TGT:   ${targetId ? targetId.substring(0, 8) : 'NONE'}`
            ]);
        }

        // Update Target Stats (Top Right)
        if (target) {
            const tPos = target.components.Position;
            this.targetText.setText([
                `[ TARGET ]`,
                `ID:    ${target.id.substring(0, 8)}`,
                `COORD: x:${tPos.x.toFixed(2)} y:${tPos.y.toFixed(2)}`,
                `STATE: ACTIVE`
            ]);
        } else {
            this.targetText.setText('[ NO TARGET ]');
        }
    }
}