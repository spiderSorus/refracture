import Phaser from 'phaser';
import { GRID } from '../../core/Constants';

export const AbilityTargetingSystem = (entities, inputManager) => {
    const player = entities.find(e => e.components.PlayerTag);
    if (!player || !player.components.AbilityState || !player.components.Rotation) return;

    const state = player.components.AbilityState;
    const pPos = player.components.Position;
    const pRot = player.components.Rotation.angle;

    // --- CHANGED: Removed X button logic ---
    const holdY = inputManager.isButtonDown('Y');
    const prevArmed = state.armed;

    if (holdY) state.armed = 'Y';
    else state.armed = null;

    if (prevArmed !== state.armed) {
        state.targetIndex = 0;
        state.currentTargetId = null;
    }

    if (!state.armed) return;

    // 2. Filter Configuration
    const config = {
        'Y': { types: ['C'], range: 1000 * GRID.UNIT }
    }[state.armed];

    if (!config) return;

    // 3. The 90-Degree Cone Filter
    const FOV = Math.PI / 2;
    const HALF_FOV = FOV / 2;

    const validTargets = entities.filter(e => {
        if (e === player || !e.components.EntityType) return false;

        const typeMatch = config.types.includes(e.components.EntityType.value);
        const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, e.components.Position.x, e.components.Position.y);

        if (!typeMatch || dist > config.range) return false;

        const angleToTarget = Phaser.Math.Angle.Between(pPos.x, pPos.y, e.components.Position.x, e.components.Position.y);
        const angleDiff = Phaser.Math.Angle.Wrap(angleToTarget - pRot);

        return Math.abs(angleDiff) <= HALF_FOV;
    }).sort((a, b) => {
        const d1 = Phaser.Math.Distance.Between(pPos.x, pPos.y, a.components.Position.x, a.components.Position.y);
        const d2 = Phaser.Math.Distance.Between(pPos.x, pPos.y, b.components.Position.x, b.components.Position.y);
        const r1 = Math.floor(d1 / 50);
        const r2 = Math.floor(d2 / 50);
        if (r1 !== r2) return r1 - r2;
        const a1 = Math.atan2(a.components.Position.y - pPos.y, a.components.Position.x - pPos.x);
        const a2 = Math.atan2(b.components.Position.y - pPos.y, b.components.Position.x - pPos.x);
        return a1 - a2;
    });

    state.potentialTargets = validTargets.map(t => t.id);
    const count = state.potentialTargets.length;

    // 4. Cycling Logic
    if (count > 0) {
        if (inputManager.getAction('NEXT_TARGET')) {
            state.targetIndex = (state.targetIndex + 1) % count;
        } else if (inputManager.getAction('PREV_TARGET')) {
            state.targetIndex = (state.targetIndex - 1 + count) % count;
        }
        state.currentTargetId = state.potentialTargets[state.targetIndex];
    } else {
        state.currentTargetId = null;
    }
};