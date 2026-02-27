import Phaser from 'phaser';
import { getImmediateGfx } from '../../utils/RenderUtils';

/**
 * WebRenderSystem
 * Renders web tethers and connections with dynamic visuals based on endpoint properties.
 */
export const WebRenderSystem = (entities, scene, delta, interpAlpha = 1.0) => {
    // 1. Determine target layer (favoring explicit auxiliary layer)
    let targetLayer = scene.webLayer || scene.playground;
    if (scene.webLayerName && scene.auxLayers && scene.auxLayers[scene.webLayerName]) {
        targetLayer = scene.auxLayers[scene.webLayerName];
    }

    const gfx = getImmediateGfx(scene, 'webGfx', 1100, targetLayer);
    
    // 2. Determine blend mode
    const blendMode = scene.webBlendMode !== undefined ? scene.webBlendMode : Phaser.BlendModes.DIFFERENCE;
    gfx.setBlendMode(blendMode);
    
    const cam = scene.cameras.main;
    
    const getInterpPos = (pos) => ({
        x: pos.prevX !== undefined ? pos.prevX + (pos.x - pos.prevX) * interpAlpha : pos.x,
        y: pos.prevY !== undefined ? pos.prevY + (pos.y - pos.prevY) * interpAlpha : pos.y
    });

    gfx.clear();

    /**
     * Internal helper to draw a specific portion of the web path (from tStart to tEnd)
     */
    const drawPathSegment = (x1, y1, x2, y2, targetLen, dist, tStart, tEnd, thickness, color, alpha) => {
        const segments = 20;
        const slack = (targetLen > dist) ? (targetLen - dist) * 0.5 : 0;

        gfx.lineStyle(thickness, color, alpha);
        gfx.beginPath();

        let first = true;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            if (t < tStart || t > tEnd) {
                if (!first) {
                    gfx.strokePath();
                    gfx.beginPath();
                    first = true;
                }
                continue;
            }

            const cx = x1 + (x2 - x1) * t;
            const cy = y1 + (y2 - y1) * t;
            const dip = (targetLen > dist) ? 4 * t * (1 - t) * slack : 0;
            const px = cx;
            const py = cy + dip;

            if (first) {
                gfx.moveTo(px, py);
                first = false;
            } else {
                gfx.lineTo(px, py);
            }
        }
        gfx.strokePath();
    };

    /**
     * Renders a dynamic web with properties derived from connected entities.
     */
    const drawDynamicPath = (x1, y1, x2, y2, targetLen, tension, properties) => {
        const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
        const { scale = 1.0 } = properties;

        // Single thin white line for COLOR_BURN
        drawPathSegment(x1, y1, x2, y2, targetLen, dist, 0, 1, (1.0 * scale) / cam.zoom, 0xffffff, 1.0);
    };

    const getEntityColor = (entity) => {
        const rend = entity.components.Renderable;
        if (rend && rend.definitions['BASE']) {
            return rend.definitions['BASE'].color || 0xffffff;
        }
        return 0xffffff;
    };

    // --- PART 1: COMPLETED CONNECTIONS (Platform A <-> Platform B) ---
    entities.forEach(e => {
        const conn = e.components.WebConnection;
        if (conn) {
            const entA = entities.find(ent => ent.id === conn.fromId);
            const entB = entities.find(ent => ent.id === conn.toId);

            if (entA && entB && entA.components.Position && entB.components.Position) {
                const posA = getInterpPos(entA.components.Position);
                const posB = getInterpPos(entB.components.Position);

                const rotA = entA.components.Rotation?.angle || 0;
                const rotB = entB.components.Rotation?.angle || 0;

                const ax = conn.fromOffset.x * Math.cos(rotA) - conn.fromOffset.y * Math.sin(rotA);
                const ay = conn.fromOffset.x * Math.sin(rotA) + conn.fromOffset.y * Math.cos(rotA);
                const bx = conn.toOffset.x * Math.cos(rotB) - conn.toOffset.y * Math.sin(rotB);
                const by = conn.toOffset.x * Math.sin(rotB) + conn.toOffset.y * Math.cos(rotB);

                const x1 = posA.x + ax;
                const y1 = posA.y + ay;
                const x2 = posB.x + bx;
                const y2 = posB.y + by;

                // Energy Flow Logic
                const egoA = entA.components.Ego?.value ?? 0;
                const egoB = entB.components.Ego?.value ?? 0;
                
                // Direction: Higher Ego flows to Lower Ego
                const reverse = egoB > egoA;
                const source = reverse ? entB : entA;
                const baseColor = getEntityColor(source);

                const scale = 0.8 + (Math.max(egoA, egoB) / 255);

                drawDynamicPath(x1, y1, x2, y2, conn.fixedLength, conn.tension, {
                    baseColor,
                    scale
                });
            }
        }
    });

    // --- PART 2: ACTIVE PLAYER TETHER ---
    const player = entities.find(e => e.components.PlayerTag);
    if (player) {
        const tether = player.components.WebTether;
        const pPosComp = player.components.Position;

        if (tether && pPosComp) {
            const platform = entities.find(e => e.id === tether.platformId);
            if (platform && platform.components.Position) {
                const pPos = getInterpPos(pPosComp);
                const platPos = getInterpPos(platform.components.Position);
                const platRot = platform.components.Rotation?.angle || 0;

                const ax = tether.anchorOffset.x * Math.cos(platRot) - tether.anchorOffset.y * Math.sin(platRot);
                const ay = tether.anchorOffset.x * Math.sin(platRot) + tether.anchorOffset.y * Math.cos(platRot);

                const worldAX = platPos.x + ax;
                const worldAY = platPos.y + ay;

                const baseColor = getEntityColor(platform);

                drawDynamicPath(worldAX, worldAY, pPos.x, pPos.y, tether.maxLength, tether.tension, {
                    baseColor,
                    scale: 1.0
                });
            }
        }
    }
};
