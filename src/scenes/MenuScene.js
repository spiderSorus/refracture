const PIXI = require('pixi.js');
const { createWorld, addEntity, addComponent, defineQuery } = require('bitecs');
const { Keyboard } = require('../ecs/components');
const createKeyboardSystem = require('../ecs/systems/keyboard');

// Import Test Scenes
const testScenes = require('./test/index');

// Constants for Menu States
const STATE_WAITING = 0; // "Press Start"
const STATE_MAIN = 1;    // "New / Load / Test"
const STATE_TEST = 2;    // List of Test Scenes

const keyboardQuery = defineQuery([Keyboard]);

module.exports = class MenuScene {
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;
        this.world = createWorld();
        this.keyboardSystem = createKeyboardSystem();

        // Menu State
        this.menuState = STATE_WAITING;
        this.selectionIndex = 0;

        // Input Edge Detection
        this.lastInput = { up: 0, down: 0, confirm: 0 };

        // Data for Menus
        this.mainMenuItems = [
            { label: "< NEW >", action: () => console.log("New Game - TODO") },
            { label: "< LOAD >", action: () => console.log("Load Game - TODO") },
            { label: "< TEST >", action: () => this.switchState(STATE_TEST) }
        ];
    }

    async init() {
        // Setup Input Entity
        const eid = addEntity(this.world);
        addComponent(this.world, Keyboard, eid);

        // Setup Visual Containers
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);

        this.titleText = new PIXI.Text({
            text: 'REFRACT', style: {
                fontFamily: 'monospace', fontSize: 60, fill: '#FFB000', fontWeight: 'bold'
            }
        });
        this.titleText.anchor.set(0.5);
        this.titleText.x = this.app.screen.width / 2;
        this.titleText.y = 100;
        this.container.addChild(this.titleText);

        this.menuText = new PIXI.Text({
            text: '', style: {
                fontFamily: 'monospace', fontSize: 30, fill: '#FFFFFF', align: 'center', lineHeight: 50
            }
        });
        this.menuText.anchor.set(0.5, 0);
        this.menuText.x = this.app.screen.width / 2;
        this.menuText.y = 250;
        this.container.addChild(this.menuText);

        this.renderMenu();
    }

    switchState(newState) {
        this.menuState = newState;
        this.selectionIndex = 0; // Reset selection on state change
        this.renderMenu();
    }

    // "Ring Buffer" Logic
    moveSelection(dir, length) {
        this.selectionIndex += dir;
        if (this.selectionIndex < 0) this.selectionIndex = length - 1;
        if (this.selectionIndex >= length) this.selectionIndex = 0;
        this.renderMenu();
    }

    update() {
        this.keyboardSystem(this.world);
        const ents = keyboardQuery(this.world);
        if (ents.length === 0) return;

        const eid = ents[0];
        const keys = Keyboard.keys[eid];

        // Input Mapping
        const up = keys[38];
        const down = keys[40];
        // Confirm is Space (32), Enter (13), or X (88)
        const confirm = keys[32] || keys[13] || keys[88];

        // 1. Handle Navigation (Up/Down) - Only on Edge (Press)
        if (up && !this.lastInput.up) {
            if (this.menuState === STATE_MAIN) this.moveSelection(-1, this.mainMenuItems.length);
            if (this.menuState === STATE_TEST) this.moveSelection(-1, testScenes.length);
        }
        if (down && !this.lastInput.down) {
            if (this.menuState === STATE_MAIN) this.moveSelection(1, this.mainMenuItems.length);
            if (this.menuState === STATE_TEST) this.moveSelection(1, testScenes.length);
        }

        // 2. Handle Confirmation
        if (confirm && !this.lastInput.confirm) {
            if (this.menuState === STATE_WAITING) {
                this.switchState(STATE_MAIN);
            } else if (this.menuState === STATE_MAIN) {
                // Execute the action for the selected item
                this.mainMenuItems[this.selectionIndex].action();
            } else if (this.menuState === STATE_TEST) {
                // Load the selected test scene
                const selected = testScenes[this.selectionIndex];
                if (selected && selected.SceneClass) {
                    console.log(`Loading ${selected.label}...`);
                    try {
                        this.manager.loadScene(selected.SceneClass);
                    } catch (e) {
                        console.error("Failed to load scene:", e);
                    }
                }
            }
        }

        // Update Edge State
        this.lastInput = { up, down, confirm };
    }

    renderMenu() {
        if (this.menuState === STATE_WAITING) {
            this.menuText.text = "[ PRESS SPACE TO START ]";
            return;
        }

        let items = [];
        if (this.menuState === STATE_MAIN) items = this.mainMenuItems;
        else if (this.menuState === STATE_TEST) items = testScenes;

        // Generate Text String
        const textStr = items.map((item, index) => {
            let label = item.label;

            // AUTO-NUMBERING: If we are in the Test Menu, prepend the index
            if (this.menuState === STATE_TEST) {
                const num = String(index).padStart(2, '0'); // "00", "01", etc.
                label = `${num} ${label}`;
            }

            if (index === this.selectionIndex) {
                return `> ${label} <`; // Highlight
            }
            return `  ${label}  `;
        }).join('\n');

        this.menuText.text = textStr;

        // Visual polish: Green text for tests, White for main menu
        this.menuText.style.fill = (this.menuState === STATE_TEST) ? '#00FF00' : '#FFFFFF';
    }

    destroy() {
        this.app.stage.removeChild(this.container);
        this.container.destroy({ children: true });
    }
};