export const ZLayerSystem = (entities) => {
    entities.forEach(entity => {
        const zlayer = entity.components.ZLayer;
        const rend = entity.components.Renderable;

        if (zlayer && rend) {
            let depth = 0;

            if (zlayer.type === 'PLAY') {
                // Play layers: Top is 1000, each index is 1 unit behind
                depth = 1000 - zlayer.index;
            } else if (zlayer.type === 'BACK') {
                // Back layers: Top is 90, each index is 1 unit behind
                depth = 90 - zlayer.index;
            }

            // Sync to all renderable definitions
            Object.values(rend.definitions).forEach(def => {
                def.depth = depth;
            });
        }
    });
};
