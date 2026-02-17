import { SpriteGraphic } from '../../graphics/SpriteGraphic';
import { RectGraphic } from '../../graphics/RectGraphic';
import { CircleGraphic } from '../../graphics/CircleGraphic';
import { GlowGraphic } from '../../graphics/GlowGraphic';
import { BubbleGraphic } from '../../graphics/BubbleGraphic';
import { FairyGlowGraphic } from '../../graphics/FairyGlowGraphic';
import { ChaosEmitterGraphic } from '../../graphics/ChaosEmitterGraphic';

const REGISTRY = {
    'sprite': SpriteGraphic,
    'rect': RectGraphic,
    'circle': CircleGraphic,
    'glow': GlowGraphic,
    'bubble': BubbleGraphic,
    'fairy_glow': FairyGlowGraphic,
    'chaos_emitter': ChaosEmitterGraphic
};

export const RenderFactory = {
    createGraphic: (scene, config) => {
        const GraphicClass = REGISTRY[config.type];
        if (!GraphicClass) return new CircleGraphic(scene, { radius: 10, color: 0xff00ff });
        return new GraphicClass(scene, config);
    }
};