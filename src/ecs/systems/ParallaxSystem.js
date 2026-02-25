export const ParallaxSystem = (entities, scene) => {
    const cam = scene.cameras.main;
    const scrollX = cam.scrollX + cam.width / 2;
    const scrollY = cam.scrollY + cam.height / 2;

    entities.forEach(entity => {
        const para = entity.components.Parallax;
        const pos = entity.components.Position;

        if (para && pos) {
            // 1. Initialize origin on first run
            if (para.originX === null) {
                para.originX = pos.x;
                para.originY = pos.y;
            }

            // 2. Apply Offset
            // Factor 1.0 = No relative movement to world
            // Factor < 1.0 = Moves slower (far background)
            // Factor > 1.0 = Moves faster (foreground)
            
            const dx = scrollX * (1 - para.factor);
            const dy = scrollY * (1 - para.factor);

            pos.x = para.originX + dx;
            pos.y = para.originY + dy;
        }
    });
};
