import Phaser from 'phaser';

export const BugAISystem = (entities, dt) => {
    const bugs = entities.filter(e => e.components.BugTag && e.components.BugAI);
    const webs = entities.filter(e => e.components.WebConnection);
    const player = entities.find(e => e.components.PlayerTag);
    const tether = player?.components.WebTether;

    const COLLISION_THRESHOLD = 15;

    bugs.forEach(bug => {
        const ai = bug.components.BugAI;
        const pos = bug.components.Position;
        const vel = bug.components.Velocity;

        if (!pos || !vel) return;

        // 1. RANDOM MOVEMENT
        ai.timer -= dt * 1000;
        if (ai.timer <= 0) {
            ai.timer = ai.changeInterval + (Math.random() * 500);
            const angle = Math.random() * Math.PI * 2;
            vel.x = Math.cos(angle) * ai.speed;
            vel.y = Math.sin(angle) * ai.speed;
        }

        // 2. WEB COLLISION CHECK
        // Helper: distance from point (px, py) to line segment (x1, y1) -> (x2, y2)
        const pointToSegmentDist = (px, py, x1, y1, x2, y2) => {
            const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
            if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
            let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
            t = Math.max(0, Math.min(1, t));
            return Math.sqrt((px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2);
        };

        let hit = false;

        // Check WebConnections
        for (const web of webs) {
            const conn = web.components.WebConnection;
            const fromEnt = entities.find(ent => ent.id === conn.fromId);
            const toEnt = entities.find(ent => ent.id === conn.toId);
            
            if (fromEnt && toEnt && fromEnt.components.Position && toEnt.components.Position) {
                const x1 = fromEnt.components.Position.x + conn.fromOffset.x;
                const y1 = fromEnt.components.Position.y + conn.fromOffset.y;
                const x2 = toEnt.components.Position.x + conn.toOffset.x;
                const y2 = toEnt.components.Position.y + conn.toOffset.y;
                
                if (pointToSegmentDist(pos.x, pos.y, x1, y1, x2, y2) < COLLISION_THRESHOLD) {
                    hit = true;
                    break;
                }
            }
        }

        // Check Player Tether
        if (!hit && tether && player) {
            const plat = entities.find(e => e.id === tether.platformId);
            if (plat && plat.components.Position) {
                const x1 = player.components.Position.x;
                const y1 = player.components.Position.y;
                const x2 = plat.components.Position.x + tether.anchorOffset.x;
                const y2 = plat.components.Position.y + tether.anchorOffset.y;
                if (pointToSegmentDist(pos.x, pos.y, x1, y1, x2, y2) < COLLISION_THRESHOLD) {
                    hit = true;
                }
            }
        }

        if (hit) {
            bug.toDestroy = true;
        }
    });
};
