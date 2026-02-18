import Phaser from 'phaser';
import { WebTether, WebConnection, Parent } from '../components/index';

export const WebSystem = (entities, inputManager) => {
    const player = entities.find(e => e.components.PlayerTag);
    if (!player) return;

    // Input check
    const kX = inputManager.keys.x;
    const xJustPressed = Phaser.Input.Keyboard.JustDown(kX) || inputManager.isButtonPressed('X');

    if (!xJustPressed) return;

    const tether = player.components.WebTether;
    const currentParent = player.components.Parent;
    const pPos = player.components.Position;

    // --- SCENARIO 1: LANDING & BRIDGING ---
    if (tether) {
        // Collision Check: Find which platform we are hovering over
        const platforms = entities.filter(e => e.components.PlatformTag && e.components.Collider);
        let landingPlatform = null;

        for (const plat of platforms) {
            const platPos = plat.components.Position;
            const col = plat.components.Collider;
            let isOver = false;

            if (col.type === 'circle') {
                const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, platPos.x, platPos.y);
                isOver = dist <= col.radius;
            } else {
                isOver = (pPos.x >= platPos.x - col.width / 2 && pPos.x <= platPos.x + col.width / 2 &&
                    pPos.y >= platPos.y - col.height / 2 && pPos.y <= platPos.y + col.height / 2);
            }

            if (isOver) {
                landingPlatform = plat;
                break;
            }
        }

        if (landingPlatform) {
            // Prevent bridging to the start point
            if (landingPlatform.id !== tether.platformId) {

                // CHECK: Does a connection already exist?
                const startId = tether.platformId;
                const endId = landingPlatform.id;

                const connectionExists = entities.some(e => {
                    const c = e.components.WebConnection;
                    if (!c) return false;
                    // Check both directions (A->B or B->A)
                    return (c.fromId === startId && c.toId === endId) ||
                        (c.fromId === endId && c.toId === startId);
                });

                if (!connectionExists) {
                    console.log("Creating New Web Bridge (Center-to-Center)!");
                    const newWeb = {
                        id: crypto.randomUUID(),
                        components: {
                            WebConnection: WebConnection(
                                startId, tether.anchorOffset, // Start (Already 0,0 from launch)
                                endId, { x: 0, y: 0 }         // End: Force Center
                            )
                        }
                    };
                    entities.push(newWeb);
                } else {
                    console.log("Connection exists. Landing without bridging.");
                }

                // ATTACH PLAYER (Parent them to the new platform)
                // We calculate offset based on current position so player doesn't teleport to center,
                // even though the web snaps to center.
                player.components.Parent = Parent(landingPlatform.id, {
                    x: pPos.x - landingPlatform.components.Position.x,
                    y: pPos.y - landingPlatform.components.Position.y
                });

                // Clear the Tether
                delete player.components.WebTether;

            } else {
                console.log("Cannot bridge to the same platform!");
            }
        }
    }

    // --- SCENARIO 2: LAUNCHING ---
    // We are on a platform (Parented), no tether. Start one.
    else if (currentParent) {
        console.log("LAUNCHING from Center!");

        // 1. Create the Tether (Anchored to CENTER 0,0)
        player.components.WebTether = WebTether(currentParent.id, { x: 0, y: 0 });

        // 2. DETACH PLAYER (Allow free flight)
        delete player.components.Parent;
    }
};