#!/usr/bin/env node
// scripts/build.cjs
// Multi-target build orchestrator for Refracture.
// Usage:
//   npm run build                  -> builds clean game artifact to dist/game
//   npm run build steam            -> builds clean game artifact for Steam to dist/steam
//   npm run build xbox             -> builds clean game artifact for Xbox to dist/xbox
//   npm run build windows          -> builds clean game artifact for Windows to dist/windows
//   npm run build linux            -> builds clean game artifact for Linux to dist/linux
//   npm run build mac              -> builds clean game artifact for macOS to dist/mac
//   npm run build lab              -> builds the Lab / Sandbox Suite to dist/lab

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VALID_TARGETS = {
    game:    { runtime: 'game', platform: 'standalone', description: 'Clean Standalone Game Bundle (No Lab Code)' },
    web:     { runtime: 'game', platform: 'web',        description: 'Web Game Bundle (No Lab Code)' },
    steam:   { runtime: 'game', platform: 'steam',      description: 'Steam Release Game Bundle (No Lab Code)' },
    windows: { runtime: 'game', platform: 'win32',      description: 'Windows Release Game Bundle (No Lab Code)' },
    linux:   { runtime: 'game', platform: 'linux',      description: 'Linux Release Game Bundle (No Lab Code)' },
    mac:     { runtime: 'game', platform: 'darwin',     description: 'macOS Release Game Bundle (No Lab Code)' },
    xbox:    { runtime: 'game', platform: 'xbox',       description: 'Xbox / GameCore Game Bundle (No Lab Code)' },
    lab:     { runtime: 'lab',  platform: 'lab',        description: 'Developer Lab & Sandbox Suite' }
};

const rawArg = (process.argv[2] || 'game').toLowerCase().trim();
const targetConfig = VALID_TARGETS[rawArg];

if (!targetConfig) {
    console.error(`[Refracture Build] Unknown target "${rawArg}".`);
    console.error(`Valid targets: ${Object.keys(VALID_TARGETS).join(', ')}`);
    process.exit(1);
}

const outDir = path.join('dist', rawArg);
const absOutDir = path.resolve(__dirname, '..', outDir);

console.log(`\n======================================================`);
console.log(`  REFRACTURE BUILD`);
console.log(`  Target:      ${rawArg}`);
console.log(`  Runtime:     ${targetConfig.runtime.toUpperCase()} (${targetConfig.description})`);
console.log(`  Output Dir:  ${outDir}`);
console.log(`======================================================\n`);

const viteBin = path.resolve(__dirname, '..', 'node_modules', '.bin', 'vite');

execFileSync(viteBin, ['build'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        REFRACTURE_RUNTIME: targetConfig.runtime,
        REFRACTURE_TARGET: rawArg,
        REFRACTURE_OUT_DIR: outDir,
        REFRACT_RUNTIME: targetConfig.runtime,
        REFRACT_TARGET: rawArg,
        REFRACT_OUT_DIR: outDir
    }
});

const manifest = {
    name: 'refracture',
    target: rawArg,
    runtime: targetConfig.runtime,
    platform: targetConfig.platform,
    includesLabCode: targetConfig.runtime === 'lab',
    builtAt: new Date().toISOString()
};

fs.writeFileSync(
    path.join(absOutDir, 'build-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8'
);

console.log(`\n[Refracture Build] Success! Artifact & manifest written to ${outDir}/\n`);
