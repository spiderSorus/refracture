import { Position, Renderable, ZLayer, PathFollower, GravityExempt } from '../components/index';

export const PathSystem = (entities, dtSeconds, scene) => {
    // 1. Initialize persistent state on scene if missing
    if (!scene._pathTracker) {
        scene._pathTracker = {
            current: [],
            history: [],
            lastPlayerId: null,
            lastCaptureTime: 0,
            lastParticleTime: 0
        };
    }

    const tracker = scene._pathTracker;
    const player = entities.find(e => e.components.PlayerTag && !e.toDestroy);

    const PATH_COLORS = [
        0xff0000, // Red (Youngest history)
        0xffa500, // Orange
        0xffff00, // Yellow
        0x00ff00, // Green
        0x0000ff, // Blue
        0x800080  // Purple (Oldest)
    ];

    const getPathColor = (histIdx, totalHist) => {
        // histIdx is 0 (oldest) to totalHist-1 (youngest)
        // We want newest to be red, oldest to be purple
        const age = (totalHist - 1) - histIdx;
        return PATH_COLORS[Math.min(age, PATH_COLORS.length - 1)];
    };

    // 2. DETECT RESPAWN (Player ID Change)
    if (player) {
        if (tracker.lastPlayerId !== null && tracker.lastPlayerId !== player.id) {
            // New player entity (Respawn happened)
            if (tracker.current.length > 0) {
                tracker.history.push([...tracker.current]);
                tracker.current = [];
                // Particles will find their new pathIndex in update loop
            }

            // --- PRESERVE MEMORY ---
            if (tracker.lastMemory && player.components.PlayerMemory) {
                console.log(`[PATH] Restoring player memory of ${tracker.lastMemory.entities.length} entities.`);
                player.components.PlayerMemory.entities = [...tracker.lastMemory.entities];
            }
        }
        tracker.lastPlayerId = player.id;
        tracker.lastMemory = player.components.PlayerMemory; // Keep track for next respawn

        // 3. SAMPLE POSITION (Every 100ms)
        const pos = player.components.Position;
        const now = Date.now();
        if (pos && (now - tracker.lastCaptureTime >= 100)) {
            tracker.current.push({ x: pos.x, y: pos.y });
            tracker.lastCaptureTime = now;
        }

        // 4. SPAWN PARTICLES (Every 500ms)
        if (now - tracker.lastParticleTime >= 500) {
            scene.addEntity([
                Position(tracker.current[0]?.x || pos.x, tracker.current[0]?.y || pos.y),
                GravityExempt(),
                ZLayer('PLAY', -10), // Behind player
                PathFollower(-1, 0), // -1 is current path
                Renderable({
                    'BASE': {
                        type: 'glow',
                        color: 0xffffff, // Current path is white
                        radius: 3,
                        alpha: 0.6
                    }
                })
            ]);
            tracker.lastParticleTime = now;
        }
    } else if (tracker.lastPlayerId !== null) {
        // Player just disappeared
        if (tracker.current.length > 0) {
            tracker.history.push([...tracker.current]);
            tracker.current = [];
        }
        tracker.lastPlayerId = null;
    }

    // 5. UPDATE ALL PATH FOLLOWERS
    entities.forEach(entity => {
        const follower = entity.components.PathFollower;
        const pos = entity.components.Position;
        const renderable = entity.components.Renderable;
        if (!follower || !pos || !renderable) return;

        // Determine target path
        let path = null;
        let color = 0xffffff;

        if (follower.pathIndex === -1) {
            path = tracker.current;
            color = 0xffffff;
            
            // If path was archived while this particle was current, move it to history
            if (path.length === 0 && tracker.history.length > 0) {
                follower.pathIndex = tracker.history.length - 1;
                path = tracker.history[follower.pathIndex];
            }
        } else {
            path = tracker.history[follower.pathIndex];
            color = getPathColor(follower.pathIndex, tracker.history.length);
        }

        if (!path || path.length < 2) return;

        // Move along path
        follower.progress += dtSeconds * 0.5; // Complete path in 2 seconds (adjustable)
        if (follower.progress > 1.0) follower.progress = 0;

        // Interpolate position
        const floatIdx = follower.progress * (path.length - 1);
        const idx = Math.floor(floatIdx);
        const nextIdx = Math.min(idx + 1, path.length - 1);
        const t = floatIdx - idx;

        const p1 = path[idx];
        const p2 = path[nextIdx];
        pos.x = p1.x + (p2.x - p1.x) * t;
        pos.y = p1.y + (p2.y - p1.y) * t;

        // Update color
        if (renderable.definitions['BASE']) {
            renderable.definitions['BASE'].color = color;
        }
    });
};
