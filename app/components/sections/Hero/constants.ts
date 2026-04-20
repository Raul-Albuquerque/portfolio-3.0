export const SHARK_SCALE = 0.38;
export const SHARK_SCALE_MOBILE = 0.24;
export const MOBILE_BREAKPOINT = 768;
export const CAMERA_FOV = 60;
export const CAMERA_Z = 12;

// Bioluminescent particles
export const PARTICLE_COUNT = 180;
export const PARTICLE_SPREAD_X = 22;
export const PARTICLE_SPREAD_Y = 14;
export const PARTICLE_DEPTH_RANGE = 8; // z spread behind the shark
export const PARTICLE_SPEED_MIN = 0.04;
export const PARTICLE_SPEED_MAX = 0.18;
export const PARTICLE_SIZE = 0.055;

// How fast the shark accelerates toward the target (world units/s²)
export const SHARK_CHASE_STIFFNESS = 2.2;
// Velocity damping per second (0 = no friction, 1 = instant stop)
export const SHARK_DAMPING = 0.88;
// How fast the heading angle lerps toward velocity direction (0–1 per frame at 60fps)
export const SHARK_HEADING_LERP = 0.055;
// timeScale range for the swim animation
export const SWIM_TIMESCALE_MIN = 0.4;
export const SWIM_TIMESCALE_MAX = 2.2;
// Speed (world units/s) that maps to SWIM_TIMESCALE_MAX
export const SWIM_SPEED_REF = 4.0;

// Ocean deep background
export const OCEAN_BG_COLOR = 0x020d1a;
export const OCEAN_FOG_COLOR = 0x020d1a;
export const OCEAN_FOG_DENSITY = 0.045;

export const AMBIENT_LIGHT_INTENSITY = 0.4;
export const KEY_LIGHT_INTENSITY = 3.5;
export const KEY_LIGHT_POSITION = { x: 4, y: 6, z: 5 };
export const KEY_LIGHT_COLOR = 0x60b8ff;

export const RIM_LIGHT_INTENSITY = 1.8;
export const RIM_LIGHT_POSITION = { x: -5, y: 2, z: -4 };
export const RIM_LIGHT_COLOR = 0x0032aa;

export const FILL_LIGHT_INTENSITY = 0.9;
export const FILL_LIGHT_POSITION = { x: 0, y: -3, z: 3 };
export const FILL_LIGHT_COLOR = 0x1a3a6a;
