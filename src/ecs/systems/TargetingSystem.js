import Phaser from 'phaser';
import { GRID } from '../../core/Constants';

export const AbilityTargetingSystem = (entities, inputManager) => {
    const player = entities.find(e => e.components.PlayerTag);
    if (!player || !player.components.AbilityState) return;

    const state = player.components.AbilityState;
    const pPos = player.components.Position;

    // 1. Handle Hold State
    const holdX = inputManager.isButtonDown('X');
    const holdY = inputManager.isButtonDown('Y');
    const prevArmed = state.armed;

    if (holdX && holdY) state.armed = null;
    else if (holdX) state.armed = 'X';
    else if (holdY) state.armed = 'Y';
    else state.armed = null;

    if (prevArmed !== state.armed) {
        state.targetIndex = 0;
        state.currentTargetId = null;
    }

    if (!state.armed) return;

    // 2. Configuration for Mode
    const config = {
        'X': { types: ['A', 'B'], range: 400 * GRID.UNIT },
        'Y': { types: ['C'], range: 1000 * GRID.UNIT }
    }[state.armed];

    // 3. The Spiral Sort (Radial + Angular)
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

        // Normalize distance into "rings" (e.g., every 50 units is a new priority tier)
        const ringA = Math.floor(distA / (50 * GRID.UNIT));
        const ringB = Math.floor(distB / (50 * GRID.UNIT));

        if (ringA !== ringB) {
            return ringA - ringB; // Closest ring first
        }

        // Within the same ring, sort by clockwise angle
        // atan2 returns -PI to PI. Adding PI makes it 0 to 2PI (Clockwise)
        const angleA = Math.atan2(posA.y - pPos.y, posA.x - pPos.x) + Math.PI;
        const angleB = Math.atan2(posB.y - pPos.y, posB.x - pPos.x) + Math.PI;

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