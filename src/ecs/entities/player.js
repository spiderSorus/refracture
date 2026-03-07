import {
    Position, Velocity, Rotation, Renderable, Collider,
    PlayerTag, InputControlled, CameraTarget,
    Mass, Destructible, SlingshotJump, Parent, ZLayer
} from '../components/index';
import { PHYSICS } from '../../core/Constants';

export const createPlayer = (x, y) => [
    Position(x, y),
    Velocity(0, 0),
    Rotation(0),
    ZLayer('PLAY', 0),
    Renderable({
        'BASE': {
            type: 'circle',
            radius: 10,
            color: 0x000000,
            alpha: 1.0,
            depth: 0
        }
        /*
        'BASE': {
            type: 'spider',
            color: 0x222222,
            size: 1.0,
            alpha: 1.0,
            depth: 0
        }
        */
    }),
    PlayerTag(),
    Collider('circle', 10),
    Mass(1.5),
    InputControlled(),
    CameraTarget(),
    Destructible()
];

export const spawnPlayer = (scene, spawnPoint) => {
    if (!spawnPoint) return null;

    const player = scene.addEntity([
        ...createPlayer(spawnPoint.components.Position.x, spawnPoint.components.Position.y),
        SlingshotJump(PHYSICS.SLINGSHOT_FORCE),
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