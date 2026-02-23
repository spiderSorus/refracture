import { SpriteGraphic } from '../../graphics/SpriteGraphic';
import { RectGraphic } from '../../graphics/RectGraphic';
import { CircleGraphic } from '../../graphics/CircleGraphic';
import { GlowGraphic } from '../../graphics/GlowGraphic';
import { BubbleGraphic } from '../../graphics/BubbleGraphic';
import { FairyGlowGraphic } from '../../graphics/FairyGlowGraphic';
import { ChaosEmitterGraphic } from '../../graphics/ChaosEmitterGraphic';
import { TriangleGraphic } from '../../graphics/TriangleGraphic';
import { SpiderGraphic } from '../../graphics/SpiderGraphic';

const REGISTRY = {
    'sprite': SpriteGraphic,
    'rect': RectGraphic,
    'circle': CircleGraphic,
    'glow': GlowGraphic,
    'bubble': BubbleGraphic,
    'fairy_glow': FairyGlowGraphic,
    'chaos_emitter': ChaosEmitterGraphic,
    'triangle': TriangleGraphic,
    'spider': SpiderGraphic
};

export const RenderFactory = {
    createGraphic: (scene, config) => {
        const GraphicClass = REGISTRY[config.type];
        // If config.type is 'triangle' but REGISTRY['triangle'] is undefined, 
        // you get this purple circle fallback:
        if (!GraphicClass) return new CircleGraphic(scene, { radius: 10, color: 0xff00ff });
        return new GraphicClass(scene, config);
    }
};