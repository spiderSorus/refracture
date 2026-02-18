import Phaser from 'phaser';
import { WebTether, WebConnection, Parent } from '../components/index';

export const WebSystem = (entities, inputManager) => {
    const player = entities.find(e => e.components.PlayerTag);
    if (!player) return;

    // --- INPUTS ---
    // Change to isButtonDown so "Holding" the extend button 
    // automatically grabs the platform when you enter it.
    const attachHeld = inputManager.isButtonDown('LENGTHEN'); // E or RB

    // Detach (B Button)
    const bJustPressed = Phaser.Input.Keyboard.JustDown(inputManager.keys.esc) || inputManager.isButtonPressed('B');

    const tether = player.components.WebTether;
    const currentParent = player.components.Parent;
    const pPos = player.components.Position;

    // 1. MID-AIR DETACH
    if (bJustPressed && tether && !currentParent) {
        console.log("Mid-Air Detach!");
        delete player.components.WebTether;
        return;
    }

    // 2. LANDING & BRIDGING
    if (attachHeld && tether && !currentParent) {
        const platforms = entities.filter(e => e.components.PlatformTag && e.components.Collider);
        let landingPlatform = null;

        // Check intersection
        for (const plat of platforms) {
            const platPos = plat.components.Position;
            const col = plat.components.Collider;
            let isOver = false;

            if (col.type === 'circle') {
                const dist = Phaser.Math.Distance.Between(pPos.x, pPos.y, platPos.x, platPos.y);
                isOver = dist <= col.radius;
            } else {
                // Rect check
                const w = col.width, h = col.height;
                isOver = (pPos.x >= platPos.x - w / 2 && pPos.x <= platPos.x + w / 2 &&
                    pPos.y >= platPos.y - h / 2 && pPos.y <= platPos.y + h / 2);
            }

            if (isOver) {
                landingPlatform = plat;
                break;
            }
        }

        if (landingPlatform) {
            // A. BRIDGING LOGIC (Only if different platform)
            if (landingPlatform.id !== tether.platformId) {
                const startId = tether.platformId;
                const endId = landingPlatform.id;

                // Check if connection already exists
                const connectionExists = entities.some(e => {
                    const c = e.components.WebConnection;
                    if (!c) return false;
                    return (c.fromId === startId && c.toId === endId) ||
                        (c.fromId === endId && c.toId === startId);
                });

                if (!connectionExists) {
                    console.log("Bridging!");
                    const newWeb = {
                        id: crypto.randomUUID(),
                        components: {
                            WebConnection: WebConnection(
                                startId, tether.anchorOffset,
                                endId, { x: 0, y: 0 }
                            )
                        }
                    };
                    entities.push(newWeb);
                }
            }
            else {
                console.log("Manual Re-entry to Start Platform");
            }

            // B. SNAP TO PLATFORM (Always happens if we have a valid platform + button held)
            // This fixes the "Can't re-enter" bug.
            player.components.Parent = Parent(landingPlatform.id, {
                x: pPos.x - landingPlatform.components.Position.x,
                y: pPos.y - landingPlatform.components.Position.y
            });
            delete player.components.WebTether;
        }
    }

    // 3. LAUNCHING (Only on fresh press to avoid accidental immediate detach)
    // We check JustDown here specifically so you don't detach immediately after attaching if you hold the button.
    else if (currentParent && !tether) {
        // We need to re-check JustDown for the specific key because we used isButtonDown above
        const kE = inputManager.keys.lengthen;
        let launchJustPressed = Phaser.Input.Keyboard.JustDown(kE) || inputManager.isButtonPressed('R1');

        if (launchJustPressed) {
            console.log("Anchor Dropped! Move to edge to jump.");
            player.components.WebTether = WebTether(currentParent.id, { x: 0, y: 0 });
        }
    }
};