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
    AIR_RESISTANCE_X: 0.97,
    AIR_RESISTANCE_Y: 0.998,
    DRAG_COEFF: 0.0008,
    TETHER_AIR_RESISTANCE_X: 1.0,
    TETHER_AIR_RESISTANCE_Y: 1.0,
    WIND_RESISTANCE: 0.001,
    WEB_MAX_LENGTH: 2000,
    WEB_MIN_LENGTH: 100,
    WEB_INITIAL_LENGTH: 750,
    WEB_WINCH_SPEED: 20,
    WEB_STRENGTH_MULT: 100.0,
    WEB_STIFFNESS: 1.00,
    JUMP_MAX_DISTANCE: 1000,
    JUMP_BASE_DURATION: 0.8,
};

export const PLAYER = {
    WALK_SPEED: 600,      // Pixels per second
    GROUND_ACCEL: 2000,   // Force applied when walking on ground
};