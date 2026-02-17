import { createPlayer } from '../../ecs/entities/player';
import { BaseTestScene } from './BaseTestScene';
import { ViewLayers, Renderable, Position, Velocity, Rotation, InputControlled, CameraTarget, PlayerTag } from '../../ecs/components/index';
import { LayeredRenderSystem } from '../../ecs/systems/LayeredRenderSystem';

export class LayerTest extends BaseTestScene {
    constructor() {
        super('LayerTest', 'View Layers', '1: Base, 2: Thermal, 3: Ether. SPACE: Stun.');
    }

    create() {
        super.create();

        // 1. Player
        this.addEntity([
            Position(0, 0),
            Velocity(0, 0),
            Rotation(0),
            InputControlled(),
            PlayerTag(),
            CameraTarget(),
            ViewLayers(['BASE']),
            Renderable({
                'BASE': { type: 'sprite', char: '@', color: '#00ffff' }
            })
        ]);

        // 2. Enemy (Visible in Base & Thermal)
        this.addEntity([
            { id: 'enemy_1' },
            Position(200, 0),
            Renderable({
                'BASE': { type: 'rect', width: 40, height: 40, color: 0x888888 },
                'THERMAL': { type: 'circle', radius: 25, color: 0xff0000, alpha: 0.8 },
            })
        ]);

        // 3. Ghost Platform (Visible only in Ether)
        this.addEntity([
            { id: 'ghost_plat' },
            Position(-200, 0),
            Velocity(0, 100),
            Renderable({
                'ETHER': { type: 'glow', radius: 40, color: 0x00ff00 }
            })
        ]);

        this.input.keyboard.on('keydown-ONE', () => this.toggleLayer('BASE'));
        this.input.keyboard.on('keydown-TWO', () => this.toggleLayer('THERMAL'));
        this.input.keyboard.on('keydown-THREE', () => this.toggleLayer('ETHER'));

        this.cameras.main.centerOn(0, 0);
    }

    update(time, delta) {
        super.update(time, delta);
        LayeredRenderSystem(this.entities, this);
    }

    fixedUpdate(time, dt) {
        const plat = this.entities.find(e => e.id === 'ghost_plat');
        if (plat) {
            if (plat.components.Position.y > 150) plat.components.Velocity.y = -100;
            if (plat.components.Position.y < -150) plat.components.Velocity.y = 100;
        }
    }

    toggleLayer(layerName) {
        const player = this.entities.find(e => e.components.PlayerTag);
        if (!player) return;

        const layers = player.components.ViewLayers.layers;
        const idx = layers.indexOf(layerName);
        if (idx === -1) layers.push(layerName);
        else layers.splice(idx, 1);
        console.log("Current Layers:", layers);
    }
}