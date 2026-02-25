import Phaser from 'phaser';
import { getImmediateGfx } from '../../utils/RenderUtils';

/**
 * WebRenderSystem
 * Renders web tethers and connections with dynamic visuals based on endpoint properties.
 */
export const WebRenderSystem = (entities, scene, delta, interpAlpha = 1.0) => {
    const targetLayer = scene.fgLayer;
    const gfx = getImmediateGfx(scene, 'webGfx', 1100, targetLayer);
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
        const { travelerSpeed = 0.8, travelerWidth = 0.06, travelerColor = 0xff0000, 
                baseColor = 0xffffff, reverse = false, scale = 1.0 } = properties;

        // Tension-based coloring for base line
        const tensionAlpha = Phaser.Math.Clamp(tension / 5000, 0, 1);
        const interpolatedBase = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(baseColor),
            Phaser.Display.Color.ValueToColor(0xff88ff),
            1, tensionAlpha
        );
        const baseHex = Phaser.Display.Color.GetColor(interpolatedBase.r, interpolatedBase.g, interpolatedBase.b);

        const time = scene.time.now * 0.001;
        // Use a base speed in pixels per second, then convert to normalized progress (0.0 to 1.0)
        const speedInPixelsPerSecond = travelerSpeed * 200; 
        const cycle = (time * (speedInPixelsPerSecond / Math.max(1, dist))) % 1.4 - 0.2;
        
        const tStartRaw = reverse ? 1.0 - (cycle + travelerWidth) : cycle;
        const tEndRaw = reverse ? 1.0 - cycle : cycle + travelerWidth;
        
        const tStart = Math.min(tStartRaw, tEndRaw);
        const tEnd = Math.max(tStartRaw, tEndRaw);

        const layers = 2;
        
        // 1. Base Diffused Layers
        for (let i = layers; i >= 1; i--) {
            const alpha = (0.12 / i);
            const thickness = (i * 2 * scale) / cam.zoom;
            drawPathSegment(x1, y1, x2, y2, targetLen, dist, 0, 1, thickness, baseHex, alpha);
        }

        // 2. Core Web Line
        drawPathSegment(x1, y1, x2, y2, targetLen, dist, 0, 1, (1.0 * scale) / cam.zoom, baseHex, 0.8);

        // 3. Traveling Segment (Color March) - Drawn last to be on top
        if (tEnd > 0 && tStart < 1) {
            for (let i = layers; i >= 1; i--) {
                const alpha = (0.5 / i);
                const thickness = (i * 3.5 * scale) / cam.zoom;
                drawPathSegment(x1, y1, x2, y2, targetLen, dist, Math.max(0, tStart), Math.min(1, tEnd), thickness, travelerColor, alpha);
            }
            // Traveler Core
            drawPathSegment(x1, y1, x2, y2, targetLen, dist, Math.max(0, tStart), Math.min(1, tEnd), (1.8 * scale) / cam.zoom, travelerColor, 1.0);
        }
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
                const travelerColor = 0xff0000;
                const baseColor = getEntityColor(source);

                // Speed and size based on Ego transfer rate/values
                const diff = Math.abs(egoA - egoB);
                const travelerSpeed = 0.2 + (diff * 0.01);
                const scale = 0.8 + (Math.max(egoA, egoB) / 255);

                drawDynamicPath(x1, y1, x2, y2, conn.fixedLength, conn.tension, {
                    travelerSpeed,
                    travelerColor,
                    baseColor,
                    reverse,
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

                // Player properties affect the tether
                const pVel = player.components.Velocity || { x: 0, y: 0 };
                const speedMag = Math.sqrt(pVel.x * pVel.x + pVel.y * pVel.y);
                
                // Traveler flows AWAY from player if moving fast, or TOWARDS player if charging?
                // Let's make it flow towards the player (pulling energy)
                const reverse = true; 
                const travelerSpeed = 0.4 + (speedMag * 0.0002);
                const scale = 1.0;
                const baseColor = getEntityColor(platform);

                drawDynamicPath(worldAX, worldAY, pPos.x, pPos.y, tether.maxLength, tether.tension, {
                    travelerSpeed,
                    travelerColor: 0xff0000,
                    baseColor,
                    reverse,
                    scale
                });
            }
        }
    }
};
