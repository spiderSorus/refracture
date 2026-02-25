import Phaser from 'phaser';

const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
uniform float uTime;
uniform float uVelocity;

// Simple pseudo-random noise
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = outTexCoord;
    
    // Wavy distortion
    float wave = sin(uv.y * 20.0 + uTime * 2.0) * 0.005 * uVelocity;
    float wave2 = cos(uv.x * 20.0 + uTime * 1.5) * 0.005 * uVelocity;
    
    // Chromatic aberration
    float r = texture2D(uMainSampler, uv + wave * uVelocity).r;
    float g = texture2D(uMainSampler, uv + wave2 * uVelocity).g;
    float b = texture2D(uMainSampler, uv - wave * uVelocity).b;
    
    vec3 color = vec3(r, g, b);
    
    gl_FragColor = vec4(color, 1.0);
}
`;

export class OldGlassPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            game,
            renderTarget: true,
            fragShader,
            uniforms: [
                'uMainSampler',
                'uTime',
                'uVelocity'
            ]
        });
        this.velocity = 0;
    }

    onPreRender() {
        this.set1f('uTime', this.game.loop.time * 0.001);

        const scenes = this.game.scene.getScenes(true);
        if (scenes.length > 0) {
            const scene = scenes[0];
            const player = scene.entities ? scene.entities.find(e => e.components.PlayerTag) : null;
            
            let targetVelocity = 0;
            if (player && player.components.Velocity) {
                const vel = player.components.Velocity;
                const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
                targetVelocity = Math.min(1.0, speed / 500); // Normalize speed
            }

            // Smooth transition
            this.velocity += (targetVelocity - this.velocity) * 0.1;
            this.set1f('uVelocity', this.velocity);
        } else {
            this.set1f('uVelocity', 0);
        }
    }
}
