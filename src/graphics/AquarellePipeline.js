import Phaser from 'phaser';

const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;

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
    
    // Original color at this pixel
    vec4 baseColor = texture2D(uMainSampler, uv);

    // Target color to apply effect to (Shades of Red)
    // We check if it's "mostly red"
    bool isTarget = (baseColor.r > baseColor.g * 1.5 && baseColor.r > baseColor.b * 1.5 && baseColor.a > 0.0);

    if (isTarget) {
        // Displacement based on noise (Aquarelle style)
        float n = snoise(uv * uFrequency + uTime * 0.1) * 3.14159;
        vec2 offset = vec2(cos(n), sin(n)) * uAmplitude;
        
        // Multiple octaves of noise for the "bleed" edge
        float n2 = snoise(uv * 20.0 + uTime * 0.05);
        vec2 bleed = vec2(cos(n2), sin(n2)) * 0.02;
        
        vec4 distortedColor = texture2D(uMainSampler, uv + offset + bleed);
        
        // Only keep the distorted color if it's also red (don't bleed onto non-red)
        if (distortedColor.r > distortedColor.g * 1.2 && distortedColor.r > distortedColor.b * 1.2) {
             gl_FragColor = distortedColor;
        } else {
             gl_FragColor = baseColor;
        }
    } else {
        gl_FragColor = baseColor;
    }
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
                'uTime',
                'uAmplitude',
                'uFrequency'
            ]
        });
        this.amplitude = 0.015;
        this.frequency = 8.0;
    }

    onPreRender() {
        this.set1f('uTime', this.game.loop.time * 0.001);
        this.set1f('uAmplitude', this.amplitude);
        this.set1f('uFrequency', this.frequency);
    }
}
