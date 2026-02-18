import { GRID } from '../../core/Constants';

export const MovementSystem = (entities, inputManager) => {
    if (!inputManager) return;

    const speed = GRID.SPEED * GRID.UNIT;
    const move = inputManager.getMovement();

    entities.forEach(entity => {
        const {
            Position: pos,
            Velocity: vel,
            Rotation: rot,
            Parent: parent,
            InputControlled: input,
            WebTether: tether // Check if we have a web
        } = entity.components;

        if (input && pos) {
            // 1. Heading Rotation
            if (rot && (move.x !== 0 || move.y !== 0)) {
                rot.angle = Math.atan2(move.y, move.x);
            }

            // 2. Attached Movement
            if (parent) {
                const plat = entities.find(e => e.id === parent.id);
                const col = plat?.components.Collider;

                if (col) {
                    let nextX = parent.offset.x + (move.x * speed * 0.016);
                    let nextY = parent.offset.y + (move.y * speed * 0.016);

                    // --- CONSTRAINT LOGIC ---
                    // ONLY restrict movement if we DO NOT have a tether.
                    // If attached via web, we can walk into the void.
                    if (!tether) {
                        if (col.type === 'circle') {
                            const dist = Math.sqrt(nextX * nextX + nextY * nextY);
                            if (dist > col.radius) {
                                const angle = Math.atan2(nextY, nextX);
                                nextX = Math.cos(angle) * col.radius;
                                nextY = Math.sin(angle) * col.radius;
                            }
                        } else {
                            const halfW = col.width / 2;
                            const halfH = col.height / 2;
                            nextX = Math.max(-halfW, Math.min(halfW, nextX));
                            nextY = Math.max(-halfH, Math.min(halfH, nextY));
                        }
                    }

                    parent.offset.x = nextX;
                    parent.offset.y = nextY;
                }

                if (vel) { vel.x = 0; vel.y = 0; }
            }
            // 3. Free Movement
            else if (vel) {
                vel.x = move.x * speed;
                vel.y = move.y * speed;
            }
        }
    });
};