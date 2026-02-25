export const BackgroundSystem = (entities) => {
    entities.forEach(entity => {
        const bg = entity.components.BackgroundShape;
        const renderable = entity.components.Renderable;

        if (bg && renderable) {
            // Find the layer used for background (usually 'BG' or 'BASE')
            // For simplicity, we sync into all layers that have a matching type
            Object.keys(renderable.definitions).forEach(layerKey => {
                const config = renderable.definitions[layerKey];
                
                // Only sync if the type matches what we expect from BackgroundShape
                // (rectangle -> rect, oval -> ellipse)
                const expectedType = bg.shapeType === 'oval' ? 'ellipse' : 'rect';
                
                if (config.type === expectedType) {
                    config.width = bg.width;
                    config.height = bg.height;
                    config.color = bg.color;
                    config.alpha = bg.alpha;
                    config.depth = bg.depth;
                }
            });
        }
    });
};
