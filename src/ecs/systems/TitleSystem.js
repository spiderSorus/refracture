export class TitleSystem {
    constructor(scene, titleText, subText) {
        this.scene = scene;

        const styleTitle = {
            font: 'bold 64px monospace',
            fill: '#8b008b', // Dark Hot Pink
            align: 'center'
        };
        const styleSub = {
            font: '24px monospace',
            fill: '#ff69b4', // Hot Pink
            align: 'center'
        };

        // Create Container at screen center
        const screenCenterX = scene.scale.width / 2;
        const screenCenterY = scene.scale.height / 2;

        this.container = scene.add.container(screenCenterX, screenCenterY);

        // CRITICAL: setScrollFactor(0) makes it ignore camera pan AND zoom
        this.container.setScrollFactor(0);
        this.container.setDepth(2000);
        this.container.setAlpha(0);

        const title = scene.add.text(0, -40, titleText.toUpperCase(), styleTitle).setOrigin(0.5);
        const sub = scene.add.text(0, 40, subText, styleSub).setOrigin(0.5);

        this.container.add([title, sub]);

        // Animation
        scene.tweens.add({
            targets: this.container,
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                scene.time.delayedCall(3000, () => {
                    if (scene.sys.isActive()) { // Safety check for scene transitions
                        scene.tweens.add({
                            targets: this.container,
                            alpha: 0,
                            duration: 1000,
                            onComplete: () => this.container.destroy()
                        });
                    }
                });
            }
        });
    }
}