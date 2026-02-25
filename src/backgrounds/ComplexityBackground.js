import { createCathedralColumn } from '../ecs/entities/cathedral';
import Phaser from 'phaser';

/**
 * Complexity Background
 * Combines two layers of cathedral columns with different camera effects.
 */
export const ComplexityBackground = (scene, config = {}) => {
    const worldW = config.worldWidth || config.worldSize || 8000;
    const worldH = config.worldHeight || config.worldSize || 8000;
    
    // 1. WATERCOLOR LAYER (Aura/Background)
    for (let i = 0; i < 150; i++) {
        const x = Phaser.Math.Between(-worldW / 2, worldW / 2);
        const y = Phaser.Math.Between(-worldH / 2, worldH / 2);
        
        scene.addEntity(createCathedralColumn(x, y, {
            width: Phaser.Math.Between(50, 150),
            height: Phaser.Math.Between(1000, 3000),
            color: 0x442266, // Deep Purple
            alpha: 0.2,
            parallax: 0.2,
            zType: 'BACK',
            zIndex: 30,
            layerName: 'bg_watercolor'
        }));
    }

    // 2. OLD GLASS LAYER (Crisp/Foreground of the background)
    for (let i = 0; i < 100; i++) {
        const x = Phaser.Math.Between(-worldW / 2, worldW / 2);
        const y = Phaser.Math.Between(-worldH / 2, worldH / 2);
        
        scene.addEntity(createCathedralColumn(x, y, {
            width: Phaser.Math.Between(30, 80),
            height: Phaser.Math.Between(500, 1500),
            color: 0x2288aa, // Teal
            alpha: 0.4,
            parallax: 0.5,
            zType: 'BACK',
            zIndex: 10,
            layerName: 'bg_glass'
        }));
    }

    console.log(`[BACKGROUND] Complexity Loaded.`);

    return {
        backgroundColor: 0xffffff,
        enableAtmosphere: true,
        atmosphereIntensity: 0.8
    };
};
