import { GRID } from '../../core/Constants';

export const MovementSystem = (entities, inputManager) => {
    if (!inputManager) return;

    const speed = GRID.SPEED * GRID.UNIT;
    const move = inputManager.getMovement();

    entities.forEach(entity => {
        const { Position: pos, Velocity: vel, Rotation: rot, Parent: parent, InputControlled: input } = entity.components;

        if (input && pos) {
            // 1. Heading Rotation
            if (rot && (move.x !== 0 || move.y !== 0)) {
                rot.angle = Math.atan2(move.y, move.x);
            }

            // 2. Attached Movement (Locked to Bounds)
            if (parent) {
                const plat = entities.find(e => e.id === parent.id);
                const col = plat?.components.Collider;

                if (col) {
                    // Calculate potential new offset
                    let nextX = parent.offset.x + (move.x * speed * 0.016);
                    let nextY = parent.offset.y + (move.y * speed * 0.016);

                    // Clamp to Circular Platform
                    if (col.type === 'circle') {
                        const dist = Math.sqrt(nextX * nextX + nextY * nextY);
                        if (dist > col.radius) {
                            // Normalize the vector and multiply by radius to snap to edge
                            const angle = Math.atan2(nextY, nextX);
                            nextX = Math.cos(angle) * col.radius;
                            nextY = Math.sin(angle) * col.radius;
                        }
                    }
                    // Clamp to Rectangular Platform
                    else {
                        const halfW = col.width / 2;
                        const halfH = col.height / 2;
                        nextX = Math.max(-halfW, Math.min(halfW, nextX));
                        nextY = Math.max(-halfH, Math.min(halfH, nextY));
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