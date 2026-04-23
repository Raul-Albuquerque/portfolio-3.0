export const MOBILE_BREAKPOINT = 768;

// Scene background (deep ocean black-blue)
export const BG_COLOR = 0x010810;

// Camera — pulled back to see more of the path
export const CAMERA_FOV_WIDE   = 60;
export const CAMERA_FOV_NARROW = 70;
export const CAM_Z_BEHIND = 8;   // units behind the current position on the curve
export const CAM_Y_ABOVE  = 3;   // units above
export const CAM_LERP     = 0.04;

// Fog — relaxed so the full visible serpentine fits in frame; still fades far end
export const FOG_NEAR = 10;
export const FOG_FAR  = 38;

// Lighting
export const AMBIENT_INTENSITY    = 0.22;
export const KEY_LIGHT_COLOR      = 0x40c8ff;
export const KEY_LIGHT_INTENSITY  = 2.6;
export const KEY_LIGHT_POSITION   = { x: 3, y: 5, z: 6 };
export const FILL_LIGHT_COLOR     = 0x003fa8;
export const FILL_LIGHT_INTENSITY = 0.7;
export const FILL_LIGHT_POSITION  = { x: -4, y: -2, z: 3 };

// Trail — ghost (full future path) + traveled (draws in with scroll)
export const TRAIL_GHOST_COLOR    = 0x00aadd;  // dim cyan — full path, always visible
export const TRAIL_GHOST_OPACITY  = 0.22;
export const TRAIL_TRAVELED_COLOR = 0x60efff;  // bright bioluminescent cyan — visited path
export const TRAIL_TRAVELED_OPACITY = 0.90;
export const TRAIL_DASH_SIZE  = 0.4;
export const TRAIL_GAP_SIZE   = 0.22;

// Waypoint dot
export const WP_DOT_RADIUS  = 0.10;
export const WP_DOT_COLOR   = 0x60efff;
export const WP_DOT_OPACITY = 0.75;

// Background bioluminescent particles
export const BG_PARTICLE_COUNT = 300;
export const BG_SPREAD_X    = 20;
export const BG_SPREAD_Y    = 14;
export const BG_PARTICLE_SIZE = 0.05;
export const BG_SPEED_MIN   = 0.04;
export const BG_SPEED_MAX   = 0.18;

// Card fade — one card at a time
// Each milestone spans ≈ 0.111 progress units (500vh / 9 milestones)
export const CARD_BEFORE = 0.030;
export const CARD_AFTER  = 0.068;
export const CARD_RAMP   = 0.020;
