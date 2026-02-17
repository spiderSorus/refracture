export class BaseGraphic {
    constructor(scene, config) {
        this.scene = scene;
        this.gameObject = this.create(config);

        // Default Z-sorting
        this.gameObject.setDepth(config.layer === 'BASE' ? 10 : 20);
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