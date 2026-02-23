import { findPlayer } from '../entities/player';

export const MeditationSystem = (entities, inputManager, dt) => {
    const player = findPlayer(entities);
    if (!player || !player.components.MeditationState) return;

    const state = player.components.MeditationState;

    // --- INSTANT SHIFT LOGIC ---
    
    // Check for 'ELEVATE' action (Right Trigger or 'E')
    const curElevate = inputManager.isButtonDown('ELEVATE');
    if (curElevate && !state.lastElevate) {
        state.currentLevel = Math.min(64, state.currentLevel + 1);
        console.log(`[MEDITATION] Elevated to Level: ${state.currentLevel}`);
    }
    state.lastElevate = curElevate;

    // Check for 'DECLINE' action (Left Trigger or 'Q')
    const curDecline = inputManager.isButtonDown('DECLINE');
    if (curDecline && !state.lastDecline) {
        state.currentLevel = Math.max(0, state.currentLevel - 1);
        console.log(`[MEDITATION] Declined to Level: ${state.currentLevel}`);
    }
    state.lastDecline = curDecline;
};
