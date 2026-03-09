import { isPointInside } from '../../utils/CollisionUtils';
import { 
    Position, Velocity, Renderable, ZLayer, 
    FollowPlayer, Lifespan 
} from '../components/index';

export const TargetSystem = (entities, scene) => {
    const player = entities.find(e => e.components.PlayerTag);
    if (!player) return;

    const playerPos = player.components.Position;
    if (!playerPos) return;

    entities.forEach(entity => {
        const target = entity.components.TargetTag;
        const pos = entity.components.Position;
        const col = entity.components.Collider;
        const renderable = entity.components.Renderable;

        if (target && pos && col && renderable) {
            const rot = entity.components.Rotation?.angle || 0;
            const isInside = isPointInside(playerPos, pos, col, 0, rot);

            if (isInside && !target.isTriggered) {
                target.isTriggered = true;
                
                if (renderable.definitions['OFF']) {
                    const offConfig = renderable.definitions['OFF'];
                    renderable.definitions['ON'] = {
                        ...offConfig,
                        color: 0x00ff00, // Green
                        alpha: 0.8
                    };
                    delete renderable.definitions['OFF'];
                }

                // --- SPAWN PARTICLES ---
                const colors = [
                    0xff0000, // Red
                    0xffa500, // Orange
                    0xffff00, // Yellow
                    0x00ff00, // Green
                    0x0000ff, // Blue
                    0x800080  // Purple
                ];

                colors.forEach((color, i) => {
                    const angle = (i / colors.length) * Math.PI * 2;
                    const speed = 50 + Math.random() * 100;
                    const vx = Math.cos(angle) * speed;
                    const vy = Math.sin(angle) * speed;

                    scene.addEntity([
                        Position(pos.x, pos.y),
                        Velocity(vx, vy),
                        ZLayer('PLAY', 50), // Above everything
                        Renderable({
                            'BASE': {
                                type: 'glow',
                                color: color,
                                radius: 4,
                                alpha: 0.8
                            }
                        }),
                        FollowPlayer(150 + Math.random() * 50),
                        Lifespan(2000 + Math.random() * 1000)
                    ]);
                });
            }
        }
    });
};
