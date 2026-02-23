// src/ecs/systems/index.js
export * from './MovementSystem';
export * from './PhysicsSystem';
export * from './LayeredRenderSystem';
export * from './CameraSystem';
export * from './AttachmentSystem';
export * from './WebRenderSystem';
export * from './WebSystem';
export * from './BugAISystem';
export * from './MeditationSystem';
export * from './EnergySystem';

// Explicitly export these to resolve the "Conflicting Star Exports" error
export { SlingshotSystem } from './SlingshotSystem';
export { SlingshotRenderSystem } from './SlingshotRenderSystem';
