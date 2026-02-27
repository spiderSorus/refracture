import { 
    Position, Velocity, Rotation, Renderable, Collider,
    PlatformTag, EntityType, Mass, ZLayer, Parallax, BackgroundTag,
    GravityExempt
} from '../ecs/components/index';
import Phaser from 'phaser';

/**
 * Unified Background Generator
 * 
 * Provides a standardized way to generate background elements (rectangles, columns, etc.)
 * with support for parallax, physics, and overlap.
 */
export const generateBackgroundRectangles = (scene, config, layerConfig) => {
    const worldW = config.worldWidth || config.worldSize || 8000;
    const worldH = config.worldHeight || config.worldSize || 8000;
    const minX = config.minX ?? 0;
    const minY = config.minY ?? -worldH;

    // Apply 10% overlap on each side as requested
    const paddingX = worldW * 0.1;
    const paddingY = worldH * 0.1;
    const drawMinX = minX - paddingX;
    const drawMinY = minY - paddingY;
    const drawWidth = worldW + 2 * paddingX;
    const drawHeight = worldH + 2 * paddingY;

    const {
        count = 100,
        parallax = 0.5,
        zIndex = 0,
        layerName = null,
        widthRange = [50, 150],
        heightRange = [1000, 3000],
        color = 0x442266,
        alpha = 0.2,
        renderType = 'watercolor', // 'watercolor', 'rect', 'hard_shape'
        hasPhysics = false,
        isGrid = false,
        cols = 10,
        rows = 10,
        entityType = 'BACKGROUND_RECT',
        velocityRange = [-40, 40]
    } = layerConfig;

    console.log(`[BGGEN] Generating ${isGrid ? cols*rows : count} objects on layer ${layerName}. Area: (${drawMinX}, ${drawMinY}) ${drawWidth}x${drawHeight}`);

    const createEntity = (x, y, w, h, entityColor) => {
        const components = [
            Position(x, y),
            Rotation(0),
            BackgroundTag(),
            Parallax(parallax),
            ZLayer('BACKGROUND', zIndex, layerName),
            GravityExempt()
        ];

        if (hasPhysics) {
            components.push(PlatformTag());
            components.push(Velocity(
                Phaser.Math.Between(velocityRange[0], velocityRange[1]),
                Phaser.Math.Between(velocityRange[0], velocityRange[1])
            ));
            components.push(EntityType(entityType === 'BACKGROUND_RECT' ? 'GREY_BOX' : entityType));
            components.push(Mass((w * h) / 1000));
            components.push(Collider('rect', w / 2, w, h));
        } else {
            components.push(EntityType(entityType));
        }

        const renderConfig = {
            'BASE': {
                type: renderType,
                width: w,
                height: h,
                color: entityColor,
                alpha: alpha
            }
        };

        if (renderType === 'watercolor') {
            renderConfig.BASE.shape = 'rect';
            renderConfig.BASE.layers = 6;
        } else if (renderType === 'rect') {
            renderConfig.BASE.strokeColor = 0x888888;
            renderConfig.BASE.strokeWidth = 1;
        } else if (renderType === 'hard_shape') {
            renderConfig.BASE.shape = 'rect';
        }

        components.push(Renderable(renderConfig));
        scene.addEntity(components);
    };

    if (isGrid) {
        const cellW = drawWidth / cols;
        const cellH = drawHeight / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = drawMinX + (c + 0.5) * cellW;
                const y = drawMinY + (r + 0.5) * cellH;
                
                // For grid, widthRange/heightRange are multipliers of cell size (0-1)
                const wMult = widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]);
                const hMult = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
                
                const w = cellW * wMult;
                const h = cellH * hMult;
                
                const finalColor = typeof color === 'function' ? color(x, y, drawMinX, drawWidth) : color;
                createEntity(x, y, w, h, finalColor);
            }
        }
    } else {
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(drawMinX, drawMinX + drawWidth);
            const y = Phaser.Math.Between(drawMinY, drawMinY + drawHeight);
            const w = Phaser.Math.Between(widthRange[0], widthRange[1]);
            const h = Phaser.Math.Between(heightRange[0], heightRange[1]);
            
            const finalColor = typeof color === 'function' ? color(x, y, drawMinX, drawWidth) : color;
            createEntity(x, y, w, h, finalColor);
        }
    }
};
