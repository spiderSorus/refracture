export const ZLayerSystem = (entities) => {
    entities.forEach(entity => {
        const zlayer = entity.components.ZLayer;
        const rend = entity.components.Renderable;

        if (rend) {
            let depth = 0;

            if (zlayer) {
                if (zlayer.type === 'PLAY') {
                    depth = 120 - zlayer.index;
                } else if (zlayer.type === 'BACKGROUND') {
                    depth = 90 - zlayer.index;
                } else if (zlayer.type === 'FOREGROUND') {
                    depth = 150 - zlayer.index;
                } else if (zlayer.type === 'UI') {
                    depth = 300 - zlayer.index;
                }
            }

            // Sync to all renderable definitions
            Object.values(rend.definitions).forEach(def => {
                def.depth = depth;
            });
        }
    });
};
