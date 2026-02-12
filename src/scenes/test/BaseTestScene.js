import Phaser from 'phaser';
import { UI } from '../../core/UIManager';
import { InputManager } from '../../core/Input';
import { DebugLayerSystem } from '../../ecs/systems/DebugLayerSystem';
import { GRID } from '../../core/Constants';

export class BaseTestScene extends Phaser.Scene {
    constructor(key, title, subtitle) {
        super(key);
        // Attributes used by the HTML UI and internal state
        this.testTitle = title || "Test Scene";
        this.testSubtitle = subtitle || "No description provided.";
        this.entities = [];
        this.showDebugGrid = false;
    }

    create() {
        // Initialize the Input Manager for this specific scene instance
        this.inputManager = new InputManager(this);

        // Trigger the HTML overlay title drop
        const titleStr = this.testTitle || 'SCENE';
        UI.showTitle(titleStr, this.testSubtitle);

        // Toggle the Blue Grid Crosses and HTML Debug Panel
        this.input.keyboard.on('keydown-TAB', () => {
            this.showDebugGrid = !this.showDebugGrid;
            UI.toggleDebug();
        });

        // Universal 'Exit to Menu' handler
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('TestMenuScene');
        });
    }

    update(time, delta) {
        // 1. Draw/Clear the Blue Debug Grid Crosses
        DebugLayerSystem(this);

        // 2. Locate the Player and update the HTML HUD with current coords
        const player = this.entities.find(e => e.components.PlayerTag);
        if (player) {
            const p = player.components.Position;
            UI.updateDebug({
                x: p.x.toFixed(0),
                y: p.y.toFixed(0),
                gx: (p.x / GRID.UNIT).toFixed(1),
                gy: (p.y / GRID.UNIT).toFixed(1)
            }, null);
        }

        // Return true so child scenes (CameraTest, etc.) know the base update finished
        return true;
    }

    /**
     * Standard ECS Entity Spawner
     * Converts an array of component objects into a keyed entity object.
     */
    addEntity(componentsArray) {
        const entity = {
            id: crypto.randomUUID(),
            components: {}
        };

        componentsArray.forEach(c => {
            if (c && c._type) {
                entity.components[c._type] = c;
            }
        });

        this.entities.push(entity);
        return entity;
    }
}