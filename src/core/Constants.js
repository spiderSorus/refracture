export const GRID = {
    UNIT: 10,        // 1 Grid Unit = 10px
    PLAYER_SIZE: 1,  // 1 Unit wide/high
    SPEED: 10,       // CHANGED: 10 Units per second (was 5)
};

export const PHYSICS = {
    FPS: 60,
    STEP: 1000 / 60, // ~16.66ms per tick
    GRAVITY: 980,
    SLINGSHOT_FORCE: 3500,
    GROUND_FRICTION: 0.85,
    AIR_RESISTANCE_X: 0.95,
    AIR_RESISTANCE_Y: 0.99,
    TETHER_AIR_RESISTANCE_X: 0.999,
    TETHER_AIR_RESISTANCE_Y: 0.999,
};