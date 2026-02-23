import Phaser from 'phaser';
import { BaseGraphic } from './BaseGraphic';

export class SpiderGraphic extends BaseGraphic {
    constructor(scene, config) {
        super(scene, config);
        this.setupSpider(config);
    }

    create(config) {
        return this.scene.add.container(0, 0);
    }

    setupSpider(config) {
        const color = config.color || 0x222222;
        
        // 1. Body (Small Oval, 12x16)
        this.body = this.scene.add.ellipse(0, 0, 12, 16, color);
        this.gameObject.add(this.body);

        // 2. Leg Layout Data
        const legConfigs = [
            { side: 'Left',  spread: -25,  id: 1 },
            { side: 'Left',  spread: -65,  id: 2 },
            { side: 'Left',  spread: -115, id: 3 },
            { side: 'Left',  spread: -165, id: 4 },
            { side: 'Right', spread: 25,   id: 1 },
            { side: 'Right', spread: 65,   id: 2 },
            { side: 'Right', spread: 115,  id: 3 },
            { side: 'Right', spread: 165,  id: 4 }
        ];

        // Specific Bends from request
        const bends = [5, 5, 25, 55, 30, 40, 15]; 
        
        // Segment lengths
        const lengths = [3, 2, 8, 3, 7, 6, 4];    
        const widths = [2.0, 1.8, 1.5, 1.5, 1.2, 0.8, 0.5]; 

        this.legs = legConfigs.map(cfg => {
            const isLeft = cfg.side === 'Left';
            const sideMult = isLeft ? -1 : 1;
            
            // "Top 4" (ID 1, 2) and "Bottom 4" (ID 3, 4)
            // Adjusting groupMult for ID 1 and 4 which were "180 degrees wrong"
            let groupMult = (cfg.id <= 2) ? -1 : 1;
            if (cfg.id === 1 || cfg.id === 4) {
                groupMult *= -1;
            }
            
            // Map Spread relative to UP (-90 degrees)
            const baseAngleRad = Phaser.Math.DegToRad(cfg.spread - 90);
            
            let curAngle = baseAngleRad;
            let curX = Math.cos(baseAngleRad) * 5; 
            let curY = Math.sin(baseAngleRad) * 7;

            const legSegments = [];

            for (let i = 0; i < 7; i++) {
                const segW = widths[i];
                const segL = lengths[i];
                const bendRad = Phaser.Math.DegToRad(bends[i]);

                curAngle += (bendRad * sideMult * groupMult);

                const seg = this.scene.add.rectangle(curX, curY, segW, segL, color);
                seg.setOrigin(0.5, 0);
                seg.setRotation(curAngle - Math.PI / 2);
                this.gameObject.add(seg);
                legSegments.push(seg);

                curX += Math.cos(curAngle) * segL;
                curY += Math.sin(curAngle) * segL;
            }

            return legSegments;
        });
    }

    onUpdate(config) {
        // Static
    }
}
