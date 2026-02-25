import {
    Position, Velocity, Rotation, Renderable,
    PlayerTag, InputControlled, CameraTarget, ViewLayers,
    Mass, Destructible, SlingshotJump, Parent
} from '../components/index';

export const createPlayer = (x, y) => [
    Position(x, y),
    Velocity(0, 0),
    Rotation(0),
    Renderable({
        'BASE': {
            type: 'spider',
            color: 0x222222,
            size: 1.0,
            alpha: 1.0,
            depth: 0
        },
        'FAIRY': {
            type: 'fairy_emitter',
            tints: [0x00ffff, 0xffffff, 0x4444ff],
            intensity: 1.5,
            alpha: 0.05,
            depth: -10
        }
    }),
    PlayerTag(),
    Mass(1.5),
    InputControlled(),
    CameraTarget(),
    Destructible(),
    ViewLayers(['BASE', 'FAIRY'])
];

export const spawnPlayer = (scene, spawnPoint) => {
    if (!spawnPoint) return null;

    const player = scene.addEntity([
        ...createPlayer(spawnPoint.components.Position.x, spawnPoint.components.Position.y),
        SlingshotJump(3500),
        Parent(spawnPoint.id, { x: 0, y: 0 })
    ]);

    // Reset Slingshot
    if (player.components.SlingshotJump) {
        player.components.SlingshotJump.canJump = true;
        player.components.SlingshotJump.lastPlatformId = spawnPoint.id;
    }

    console.log(`[PLAYER] Spawned and attached to ${spawnPoint.id}`);
    return player;
};

export const findPlayer = (entities) => entities.find(e => e.components.PlayerTag);