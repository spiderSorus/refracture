import Phaser from 'phaser';
import { GRID } from '../../core/Constants';

export const AbilityTargetingSystem = (entities, inputManager) => {
    const player = entities.find(e => e.components.PlayerTag);
    if (!player || !player.components.AbilityState) return;

    const state = player.components.AbilityState;
    const pPos = player.components.Position;

    // 1. Armed State Detection
    const holdX = inputManager.isButtonDown('X');
    const holdY = inputManager.isButtonDown('Y');
    const prevArmed = state.armed;

    if (holdX && holdY) state.armed = null;
    else if (holdX) state.armed = 'X';
    else if (holdY) state.armed = 'Y';
    else state.armed = null;

    // Reset if mode toggled or disarmed
    if (prevArmed !== state.armed) {
        state.targetIndex = 0;
        state.currentTargetId = null;
    }

    if (!state.armed) return;

    // 2. Filter Configuration
    const config = {
        'X': { types: ['A', 'B'], range: 400 * GRID.UNIT },
        'Y': { types: ['C'], range: 1000 * GRID.UNIT }
    }[state.armed];

    // 3. Spiral Sorting (Ring-based Distance + Clockwise Angle)
    const validTargets = entities.filter(e => {
        if (e === player || !e.components.EntityType) return false;

        const typeMatch = config.types.includes(e.components.EntityType.value);
        const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, e.components.Position.x, e.components.Position.y);

        return typeMatch && dist <= config.range;
    }).sort((a, b) => {
        const posA = a.components.Position;
        const posB = b.components.Position;

        const distA = Phaser.Math.Distance.Between(pPos.x, pPos.y, posA.x, posA.y);
        const distB = Phaser.Math.Distance.Between(pPos.x, pPos.y, posB.x, posB.y);

        // Group into 50-pixel rings to prioritize proximity over angle
        const ringA = Math.floor(distA / (50));
        const ringB = Math.floor(distB / (50));

        if (ringA !== ringB) {
            return ringA - ringB;
        }

        // Within same ring, sort Clockwise
        const angleA = Math.atan2(posA.y - pPos.y, posA.x - pPos.x);
        const angleB = Math.atan2(posB.y - pPos.y, posB.x - pPos.x);

        return angleA - angleB;
    });

    state.potentialTargets = validTargets.map(t => t.id);

    // 4. Ring Buffer Cycling
    if (inputManager.getAction('NEXT_TARGET')) {
        state.targetIndex++;
    }

    if (state.potentialTargets.length > 0) {
        state.targetIndex = state.targetIndex % state.potentialTargets.length;
        state.currentTargetId = state.potentialTargets[state.targetIndex];
    } else {
        state.currentTargetId = null;
    }
};