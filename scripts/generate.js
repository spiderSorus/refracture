const fs = require('fs');
const path = require('path');

const ARGS = process.argv.slice(2);
const TYPE = ARGS[0];
const NAME = ARGS[1];

if (!TYPE || !NAME) {
    console.error("Usage: npm run gen <component|system|entity|scene|test-scene> <Name>");
    process.exit(1);
}

const toPascalCase = (str) => str.replace(/(^\w|-\w)/g, (m) => m.replace('-', '').toUpperCase());
const toCamelCase = (str) => str.replace(/-\w/g, (m) => m[1].toUpperCase());

const TEMPLATES = {
    component: (name) => `const { defineComponent, Types } = require('bitecs');

const ${toPascalCase(name)} = defineComponent({
    // value: Types.f32
});

module.exports = { ${toPascalCase(name)} };`,

    system: (name) => `const { defineQuery } = require('bitecs');
// const { ComponentName } = require('../components');
// const query = defineQuery([ComponentName]);

module.exports = function create${toPascalCase(name)}System() {
    return (world) => {
        // const ents = query(world);
        // for (let i = 0; i < ents.length; i++) {
        //    const eid = ents[i];
        // }
    };
};`,

    entity: (name) => `const { addEntity, addComponent } = require('bitecs');
const { Position } = require('../components');

module.exports = function create${toPascalCase(name)}(world, x, y) {
    const eid = addEntity(world);
    addComponent(world, Position, eid);
    Position.x[eid] = x;
    Position.y[eid] = y;
    return eid;
};`,

    scene: (name) => `const { createWorld } = require('bitecs');
const MenuScene = require('../MenuScene');

module.exports = class ${toPascalCase(name)} {
    constructor(app, manager) { this.app = app; this.manager = manager; this.world = createWorld(); }
    async init() {
        console.log("SCENE: ${toPascalCase(name)}");
        this._onExit = (e) => { if (e.code === 'Backspace') this.manager.loadScene(MenuScene); };
        window.addEventListener('keydown', this._onExit);
    }
    update() {}
    destroy() { window.removeEventListener('keydown', this._onExit); this.app.stage.removeChildren(); }
};`,
};

const paths = {
    component: 'src/ecs/components',
    system: 'src/ecs/systems',
    entity: 'src/ecs/entities',
    scene: 'src/scenes',
    'test-scene': 'src/scenes/test'
};

const fullDir = path.join(process.cwd(), paths[TYPE]);
if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });

let fileName = `${toCamelCase(NAME)}.js`;
let content = TEMPLATES[TYPE.replace('test-', '')] ? TEMPLATES[TYPE.replace('test-', '')](NAME) : '';

if (TYPE === 'component') fileName = `${toPascalCase(NAME)}.js`;
if (TYPE === 'test-scene') {
    const files = fs.readdirSync(fullDir);
    const count = files.filter(f => /^\d+_/.test(f)).length;
    fileName = `${String(count).padStart(2, '0')}_${toPascalCase(NAME)}.js`;
}

const filePath = path.join(fullDir, fileName);
if (fs.existsSync(filePath)) { console.error("File exists."); process.exit(1); }

fs.writeFileSync(filePath, content);
console.log(`✅ Created ${filePath}`);

// Auto-Wiring
if (TYPE === 'component') {
    const idx = path.join(process.cwd(), 'src/ecs/components/index.js');
    if (fs.existsSync(idx)) {
        let c = fs.readFileSync(idx, 'utf8');
        let lastBrace = c.lastIndexOf('}');
        fs.writeFileSync(idx, c.slice(0, lastBrace) + `    ...require('./${fileName.replace('.js', '')}'),\n` + c.slice(lastBrace));
        console.log("🔗 Linked to components/index.js");
    }
}
if (TYPE === 'test-scene') {
    const idx = path.join(process.cwd(), 'src/scenes/test/index.js');
    if (fs.existsSync(idx)) {
        let c = fs.readFileSync(idx, 'utf8');
        let pt = c.lastIndexOf('];');
        if (pt !== -1) {
            fs.writeFileSync(idx, c.slice(0, pt) + `    { label: "${toPascalCase(NAME)}", SceneClass: require('./${fileName.replace('.js', '')}') },\n` + c.slice(pt));
            console.log("🔗 Linked to Test Menu");
        }
    }
}
