import Phaser from 'phaser';

const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
uniform float uScrollX;
uniform float uScrollY;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uScale;

// Simplex 2D noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626, // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = outTexCoord;
    
    // Use camera scroll for world-space noise pinning
    vec2 worldUV = uv + vec2(uScrollX, uScrollY) * 0.0001;
    
    // Displacement based on noise tied to WORLD UV
    float n = snoise(worldUV * uFrequency) * 3.14159;
    vec2 offset = vec2(cos(n), sin(n)) * uAmplitude * uScale;
    
    // Multiple octaves of noise for the "bleed" edge
    float n2 = snoise(worldUV * 20.0);
    vec2 bleed = vec2(cos(n2), sin(n2)) * 0.02 * uScale;
    
    vec4 distortedColor = texture2D(uMainSampler, uv + offset + bleed);
    
    gl_FragColor = distortedColor;
}
`;

export class AquarellePipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            game,
            renderTarget: true,
            fragShader,
            uniforms: [
                'uMainSampler',
                'uScrollX',
                'uScrollY',
                'uAmplitude',
                'uFrequency',
                'uScale'
            ]
        });
        this.amplitude = 0.015;
        this.frequency = 8.0;
        this.scale = 1.0;
    }

    onPreRender() {
        const scenes = this.game.scene.getScenes(true);
        if (scenes.length > 0) {
            const cam = scenes[0].cameras.main;
            this.set1f('uScrollX', cam.scrollX);
            this.set1f('uScrollY', cam.scrollY);
        }
        this.set1f('uAmplitude', this.amplitude);
        this.set1f('uFrequency', this.frequency);
        this.set1f('uScale', this.scale);
    }
}
