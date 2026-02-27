import Phaser from 'phaser';

export class BaseGraphic {
    constructor(scene, config) {
        this.scene = scene;
        this.gameObject = this.create(config);

        if (this.gameObject.setScrollFactor) {
            this.gameObject.setScrollFactor(1);
        }

        // Default Z-sorting: Use config.depth if provided, otherwise fallback to layer-based default
        if (config.depth !== undefined) {
            this.gameObject.setDepth(config.depth);
        } else {
            this.gameObject.setDepth(config.layer === 'BASE' ? 10 : 20);
        }

        if (config.alpha !== undefined && this.gameObject.setAlpha) {
            this.gameObject.setAlpha(config.alpha);
        }
    }

    /**
     * @abstract
     * Create and return the Phaser GameObject here.
     */
    create(config) {
        throw new Error("BaseGraphic.create() must be implemented.");
    }

    update(position, rotation, config) {
        if (!this.gameObject) return;

        this.gameObject.setPosition(position.x, position.y);

        if (rotation) {
            this.gameObject.setRotation(rotation.angle);
        }

        if (config.alpha !== undefined && this.gameObject.setAlpha) {
            this.gameObject.setAlpha(config.alpha);
        }

        // Hook for specific graphic logic (animations, tweens, etc.)
        this.onUpdate(config);
    }

    onUpdate(config) {
        // Optional override
    }

    setVisible(visible) {
        if (this.gameObject) this.gameObject.setVisible(visible);
    }

    destroy() {
        if (this.gameObject) this.gameObject.destroy();
        this.gameObject = null;
    }
}