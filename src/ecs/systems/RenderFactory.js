import { SpriteGraphic } from '../../graphics/SpriteGraphic';
import { RectGraphic } from '../../graphics/RectGraphic';
import { CircleGraphic } from '../../graphics/CircleGraphic';
import { GlowGraphic } from '../../graphics/GlowGraphic';
import { BubbleGraphic } from '../../graphics/BubbleGraphic';
import { FairyGlowGraphic } from '../../graphics/FairyGlowGraphic';
import { FairyEmitterGraphic } from '../../graphics/FairyEmitterGraphic';
import { ChaosEmitterGraphic } from '../../graphics/ChaosEmitterGraphic';
import { TriangleGraphic } from '../../graphics/TriangleGraphic';
import { SpiderGraphic } from '../../graphics/SpiderGraphic';
import { WatercolorGraphic } from '../../graphics/WatercolorGraphic';
import { EllipseGraphic } from '../../graphics/EllipseGraphic';
import { HardShapeGraphic } from '../../graphics/HardShapeGraphic';
import { AmorphousBlobGraphic } from '../../graphics/AmorphousBlobGraphic';
import { LsdGraphic } from '../../graphics/LsdGraphic';
import { StemGraphic } from '../../graphics/StemGraphic';
import { DebugStemGraphic } from '../../graphics/DebugStemGraphic';
import { DebugPlayerGraphic } from '../../graphics/DebugPlayerGraphic';
import { WatercolorTextGraphic } from '../../graphics/WatercolorTextGraphic';
import { CellPolygonGraphic } from '../../graphics/CellPolygonGraphic';
import { GraphOverlayGraphic } from '../../graphics/GraphOverlayGraphic';

const REGISTRY = {
    'sprite': SpriteGraphic,
    'rect': RectGraphic,
    'circle': CircleGraphic,
    'glow': GlowGraphic,
    'bubble': BubbleGraphic,
    'fairy_glow': FairyGlowGraphic,
    'fairy_emitter': FairyEmitterGraphic,
    'chaos_emitter': ChaosEmitterGraphic,
    'triangle': TriangleGraphic,
    'spider': SpiderGraphic,
    'watercolor': WatercolorGraphic,
    'ellipse': EllipseGraphic,
    'hard_shape': HardShapeGraphic,
    'amorphous_blob': AmorphousBlobGraphic,
    'lsd': LsdGraphic,
    'stem': StemGraphic,
    'debug_stem': DebugStemGraphic,
    'debug_player': DebugPlayerGraphic,
    'watercolor_text': WatercolorTextGraphic,
    'cell_polygon': CellPolygonGraphic,
    'graph_overlay': GraphOverlayGraphic
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