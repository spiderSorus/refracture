/**
 * Utility to resolve the world position of a web anchor.
 * Supports platforms (with Position) and webs (calculates midpoint).
 */
export const getAnchorWorldPos = (entities, entityId, offset) => {
    const ent = entities.find(e => e.id === entityId);
    if (!ent) return null;

    if (ent.components.Position) {
        return {
            x: ent.components.Position.x + offset.x,
            y: ent.components.Position.y + offset.y
        };
    } else if (ent.components.WebConnection) {
        const conn = ent.components.WebConnection;
        // Recursive call to handle web-on-web
        const p1 = getAnchorWorldPos(entities, conn.fromId, conn.fromOffset);
        const p2 = getAnchorWorldPos(entities, conn.toId, conn.toOffset);
        if (p1 && p2) {
            return {
                x: (p1.x + p2.x) / 2,
                y: (p1.y + p2.y) / 2
            };
        }
    }
    return null;
};
