import { Position, Renderable, ZLayer, PathFollower, GravityExempt } from '../components/index';
import Phaser from 'phaser';

export const PathSystem = (entities, dtSeconds, scene) => {
    // 1. Initialize persistent state on scene if missing
    if (!scene._pathTracker) {
        scene._pathTracker = {
            current: [],
            history: [],
            lastPlayerId: null,
            lastCaptureTime: 0,
            lastParticleTime: 0,
            maxDist: 0,
            maxDistPoint: { x: 0, y: 0 }
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
        const age = (totalHist - 1) - histIdx;
        return PATH_COLORS[Math.min(age, PATH_COLORS.length - 1)];
    };

    // Helper to calculate cumulative distance for a path
    const computePathDistances = (path) => {
        if (!path || path.length < 2) return [0];
        const dists = [0];
        let total = 0;
        for (let i = 1; i < path.length; i++) {
            total += Phaser.Math.Distance.Between(path[i-1].x, path[i-1].y, path[i].x, path[i].y);
            dists.push(total);
        }
        return dists;
    };

    // 2. DETECT RESPAWN (Player ID Change)
    if (player) {
        if (tracker.lastPlayerId !== null && tracker.lastPlayerId !== player.id) {
            if (tracker.current.length > 0) {
                tracker.history.push({
                    points: [...tracker.current],
                    distances: computePathDistances(tracker.current)
                });
                tracker.current = [];
            }

            if (tracker.lastMemory && player.components.PlayerMemory) {
                player.components.PlayerMemory.entities = [...tracker.lastMemory.entities];
            }
        }
        tracker.lastPlayerId = player.id;
        tracker.lastMemory = player.components.PlayerMemory;

        // 3. SAMPLE POSITION (Every 100ms)
        const pos = player.components.Position;
        const now = Date.now();
        if (pos && (now - tracker.lastCaptureTime >= 100)) {
            tracker.current.push({ x: pos.x, y: pos.y });
            tracker.lastCaptureTime = now;

            const distSq = pos.x * pos.x + pos.y * pos.y;
            if (distSq > tracker.maxDist * tracker.maxDist) {
                tracker.maxDist = Math.sqrt(distSq);
                tracker.maxDistPoint = { x: pos.x, y: pos.y };
            }
        }

        // 4. SPAWN PARTICLES (Disabled unless explicitly enabled via scene.enablePathDots)
        if (scene.enablePathDots && (now - tracker.lastParticleTime >= 500)) {
            scene.addEntity([
                Position(tracker.current[0]?.x || pos.x, tracker.current[0]?.y || pos.y),
                GravityExempt(),
                ZLayer('PLAY', -10),
                PathFollower(-1, 0), // Start at 0 distance
                Renderable({
                    'BASE': {
                        type: 'glow',
                        color: 0xffffff,
                        radius: 3,
                        alpha: 0.6
                    }
                })
            ]);
            tracker.lastParticleTime = now;
        }
    } else if (tracker.lastPlayerId !== null) {
        if (tracker.current.length > 0) {
            tracker.history.push({
                points: [...tracker.current],
                distances: computePathDistances(tracker.current)
            });
            tracker.current = [];
        }
        tracker.lastPlayerId = null;
    }

    // 5. UPDATE ALL PATH FOLLOWERS (or clean them up if disabled)
    if (!scene.enablePathDots) {
        entities.forEach(entity => {
            if (entity.components.PathFollower) {
                entity.toDestroy = true;
            }
        });
        return;
    }

    entities.forEach(entity => {
        const follower = entity.components.PathFollower;
        const pos = entity.components.Position;
        const renderable = entity.components.Renderable;
        if (!follower || !pos || !renderable) return;

        let pathPoints = null;
        let pathDists = null;
        let color = 0xffffff;

        if (follower.pathIndex === -1) {
            // Current path: compute distances on the fly or keep simple
            if (tracker.current.length === 0 && tracker.history.length > 0) {
                follower.pathIndex = tracker.history.length - 1;
                const hist = tracker.history[follower.pathIndex];
                pathPoints = hist.points;
                pathDists = hist.distances;
            } else {
                pathPoints = tracker.current;
                pathDists = computePathDistances(pathPoints);
            }
        } else {
            const hist = tracker.history[follower.pathIndex];
            if (hist) {
                pathPoints = hist.points;
                pathDists = hist.distances;
                color = getPathColor(follower.pathIndex, tracker.history.length);
            }
        }

        if (!pathPoints || pathPoints.length < 2) return;

        const totalDist = pathDists[pathDists.length - 1];
        if (totalDist <= 0) return;

        // Move along path at constant speed (e.g. 250 px/sec)
        follower.distanceTraveled += dtSeconds * 250;
        if (follower.distanceTraveled > totalDist) {
            follower.distanceTraveled = 0;
        }

        // Interpolate position based on distance
        let idx = 0;
        for (let i = 0; i < pathDists.length - 1; i++) {
            if (follower.distanceTraveled >= pathDists[i] && follower.distanceTraveled <= pathDists[i+1]) {
                idx = i;
                break;
            }
        }

        const d1 = pathDists[idx];
        const d2 = pathDists[idx + 1];
        const t = (follower.distanceTraveled - d1) / (d2 - d1);

        const p1 = pathPoints[idx];
        const p2 = pathPoints[idx + 1];
        pos.x = p1.x + (p2.x - p1.x) * t;
        pos.y = p1.y + (p2.y - p1.y) * t;

        if (renderable.definitions['BASE']) {
            renderable.definitions['BASE'].color = color;
        }
    });
};
