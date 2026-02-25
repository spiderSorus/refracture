export const GRID = {
    UNIT: 10,        // 1 Grid Unit = 10px
    PLAYER_SIZE: 1,  // 1 Unit wide/high
    SPEED: 10,       // CHANGED: 10 Units per second (was 5)
};

export const PHYSICS = {
    FPS: 60,
    STEP: 1000 / 60, // ~16.66ms per tick
    GRAVITY: 980,
    SLINGSHOT_FORCE: 5000,
    GROUND_FRICTION: 0.85,
    AIR_RESISTANCE_X: 0.94,
    AIR_RESISTANCE_Y: 0.99,
    TETHER_AIR_RESISTANCE_X: 1.0,
    TETHER_AIR_RESISTANCE_Y: 1.0,
    WEB_MAX_LENGTH: 2000,
    WEB_MIN_LENGTH: 100,
    WEB_INITIAL_LENGTH: 750,
    WEB_WINCH_SPEED: 8,
};

export const PLAYER = {
    WALK_SPEED: 600,      // Pixels per second
    GROUND_ACCEL: 2000,   // Force applied when walking on ground
};