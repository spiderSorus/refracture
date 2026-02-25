import Phaser from 'phaser';

const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

// Function to convert HSL to RGB
vec3 hslToRgb(vec3 hsl) {
    vec3 rgb;
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;
    
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c / 2.0;
    
    if (h < 1.0/6.0) {
        rgb = vec3(c, x, 0.0);
    } else if (h < 2.0/6.0) {
        rgb = vec3(x, c, 0.0);
    } else if (h < 3.0/6.0) {
        rgb = vec3(0.0, c, x);
    } else if (h < 4.0/6.0) {
        rgb = vec3(0.0, x, c);
    } else if (h < 5.0/6.0) {
        rgb = vec3(x, 0.0, c);
    } else {
        rgb = vec3(c, 0.0, x);
    }
    
    return rgb + m;
}

void main() {
    vec4 color = texture2D(uMainSampler, outTexCoord);
    
    // Horizontal gradient: outTexCoord.x ranges from 0.0 (left) to 1.0 (right)
    // We map this to the hue value (0.0 to 1.0)
    float hue = outTexCoord.x;
    
    // Create the rainbow color
    vec3 rainbowColor = hslToRgb(vec3(hue, 1.0, 0.5));
    
    // Multiply the original color by the rainbow color to tint it
    gl_FragColor = vec4(color.rgb * rainbowColor, color.a);
}
`;

export class RainbowPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            game,
            renderTarget: true,
            fragShader,
            uniforms: [
                'uMainSampler'
            ]
        });
    }
}
