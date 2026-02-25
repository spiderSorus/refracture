// src/ecs/systems/index.js
export * from './MovementSystem';
export * from './PhysicsSystem';
export * from './CameraSystem';
export * from './RenderSystem';
export * from './AttachmentSystem';
export * from './WebRenderSystem';
export * from './WebSystem';
export * from './BugAISystem';
export * from './EnergySystem';
export * from './LifecycleSystem';
export * from './BackgroundSystem';
export * from './ParallaxSystem';
export * from './ZLayerSystem';

// Explicitly export these to resolve the "Conflicting Star Exports" error
export { SlingshotSystem } from './SlingshotSystem';
export { SlingshotRenderSystem } from './SlingshotRenderSystem';
