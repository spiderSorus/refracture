#!/bin/zsh

# 1. FIX MOVEMENT SYSTEM
# Stop applying Velocity if the entity is Parented.
# When attached, you move relative to the parent, not via global velocity.
cat > src/ecs/systems/movement.js << 'EOF'
const { defineQuery, hasComponent } = require('bitecs');
const { Position, Velocity, Parent } = require('../components');

const movementQuery = defineQuery([Position, Velocity]);

module.exports = function createMovementSystem() {
    return (world, elapsedMS) => {
        const ents = movementQuery(world);
        const dt = elapsedMS / 1000;

        for (let i = 0; i < ents.length; i++) {
            const eid = ents[i];
            
            // If parented, Velocity is ignored for position updates
            // (Velocity might still be tracked for momentum, but doesn't drive Position)
            if (hasComponent(world, Parent, eid)) continue;

            Position.x[eid] += Velocity.x[eid] * dt;
            Position.y[eid] += Velocity.y[eid] * dt;
        }
    };
};
EOF

# 2. FIX PLATFORM SYSTEM
# Ensure it only clamps, never "teleports" unless detaching.
cat > src/ecs/systems/platform.js << 'EOF'
const { defineQuery, addComponent, removeComponent, hasComponent } = require('bitecs');
const { Position, Platform, Input, Parent, WorldSpace } = require('../components');

const platformQuery = defineQuery([WorldSpace, Platform]);
const playerQuery = defineQuery([WorldSpace, Input]);

module.exports = function createPlatformSystem() {
    return (world) => {
        const platforms = platformQuery(world);
        const players = playerQuery(world);

        for (let i = 0; i < players.length; i++) {
            const eid = players[i];
            
            if (hasComponent(world, Parent, eid)) {
                const pid = Parent.eid[eid];
                const halfW = Platform.width[pid] / 2;
                const halfH = Platform.height[pid] / 2;
                const topThreshold = -halfH - 20; 

                // CLAMPING (Only limits position, doesn't jitter it)
                if (Input.r2[eid] > 0.1) {
                    if (Position.x[eid] < -halfW) Position.x[eid] = -halfW;
                    if (Position.x[eid] > halfW) Position.x[eid] = halfW;
                    if (Position.y[eid] < -halfH) Position.y[eid] = -halfH;
                    if (Position.y[eid] > halfH) Position.y[eid] = halfH;
                } 
                // DETACH CHECK
                else if (Math.abs(Position.x[eid]) > halfW || 
                           Position.y[eid] > halfH || 
                           Position.y[eid] < topThreshold) {
                    
                    const wx = WorldSpace.x[eid];
                    const wy = WorldSpace.y[eid];
                    
                    removeComponent(world, Parent, eid);
                    
                    Position.x[eid] = wx;
                    Position.y[eid] = wy;
                    Parent.eid[eid] = 0;
                }
            } else {
                // ATTACH CHECK
                for (let j = 0; j < platforms.length; j++) {
                    const pid = platforms[j];
                    const dx = Math.abs(WorldSpace.x[eid] - WorldSpace.x[pid]);
                    const dy = Math.abs(WorldSpace.y[eid] - WorldSpace.y[pid]);
                    
                    if (dx < Platform.width[pid] / 2 && dy < Platform.height[pid] / 2) {
                        addComponent(world, Parent, eid);
                        Parent.eid[eid] = pid;
                        Position.x[eid] = WorldSpace.x[eid] - WorldSpace.x[pid];
                        Position.y[eid] = WorldSpace.y[eid] - WorldSpace.y[pid];
                        break;
                    }
                }
            }
        }
    };
};
EOF

# 3. FIX INPUT SYSTEM
# Ensure input moves Local Position when attached, World Velocity when detached.
cat > src/ecs/systems/input.js << 'EOF'
const { defineQuery, hasComponent } = require('bitecs');
const { Velocity, Position, Input, Parent } = require('../components');
const { PLAYER_SPEED } = require('../../constants');

const inputQuery = defineQuery([Input]);

module.exports = function createInputSystem() {
    return (world, dt) => {
        const ents = inputQuery(world);
        const gamepads = navigator.getGamepads();

        for (let i = 0; i < ents.length; i++) {
            const eid = ents[i];
            const gp = gamepads[Input.index[eid]];

            if (gp) {
                const threshold = 0.15;
                const lx = gp.axes[0];
                const ly = gp.axes[1];
                
                const moveX = Math.abs(lx) > threshold ? lx * PLAYER_SPEED : 0;
                const moveY = Math.abs(ly) > threshold ? ly * PLAYER_SPEED : 0;

                // TRIGGER
                const r2 = gp.buttons[7] ? gp.buttons[7].value : 0;
                Input.r2[eid] = r2;

                if (hasComponent(world, Parent, eid)) {
                    // ATTACHED: Input directly modifies Position (Crawling)
                    // We multiply by a smaller factor for precision
                    Position.x[eid] += moveX * 0.1; 
                    Position.y[eid] += moveY * 0.1;
                } else {
                    // DETACHED: Input sets Velocity
                    Velocity.x[eid] = moveX;
                    Velocity.y[eid] = moveY;
                }
            }
        }
    };
};
EOF