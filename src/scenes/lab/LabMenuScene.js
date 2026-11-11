// src/scenes/lab/LabMenuScene.js
import { BaseMenuScene } from '../BaseMenuScene';
import { LAB_SPACES } from './LabRegistry';

export class LabMenuScene extends BaseMenuScene {
    constructor() {
        // Keep scene key 'TestMenuScene' so legacy test scenes return here on ESC/BACK
        super('TestMenuScene', 'LAB SUITE', 'Select a Design Space');
        this.currentSpace = null;
    }

    init(data) {
        const spaceId = data && data.spaceId ? data.spaceId : null;
        this.currentSpace = LAB_SPACES.find(s => s.id === spaceId) || null;
        this._backHandled = false;

        if (this.currentSpace) {
            this.title = 'SPACE LAB';
            this.subtitle = this.currentSpace.label;
            this.options = [
                ...this.currentSpace.scenes,
                { label: '← Back to Design Spaces', isBack: true }
            ];
        } else {
            this.title = 'LAB SUITE';
            this.subtitle = '6 Design Spaces + Archive';
            this.options = LAB_SPACES.map(space => ({
                label: `${space.label} (${space.scenes.length})`,
                spaceId: space.id
            }));
        }

        if (this.options.length > 3) {
            this.options.push({ label: ' ', isSeparator: true });
        }
        this.selected = 0;
    }

    handleSelection() {
        const choice = this.options[this.selected];
        if (!choice || choice.isSeparator) return;

        if (choice.isBack) {
            this.handleBack();
            return;
        }

        if (choice.spaceId) {
            this.scene.start('TestMenuScene', { spaceId: choice.spaceId });
        } else if (choice.scene) {
            this.scene.start(choice.scene);
        }
    }

    handleBack() {
        if (this._backHandled) return;
        this._backHandled = true;

        if (this.currentSpace) {
            this.scene.start('TestMenuScene', { spaceId: null });
        }
    }
}
