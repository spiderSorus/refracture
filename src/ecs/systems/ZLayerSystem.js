export const ZLayerSystem = (entities) => {
    entities.forEach(entity => {
        const zlayer = entity.components.ZLayer;
        const rend = entity.components.Renderable;

        if (rend) {
            let depth = 0;

            if (zlayer) {
                if (zlayer.type === 'PLAY') {
                    depth = 120 - zlayer.index;
                } else if (zlayer.type === 'BACK') {
                    depth = 90 - zlayer.index;
                }
            }

            // Sync to all renderable definitions
            Object.values(rend.definitions).forEach(def => {
                def.depth = depth;
            });
        }
    });
};
