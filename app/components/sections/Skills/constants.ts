import type { SkillCategory } from "@/app/data/skills";

export const CAMERA_FOV = 60;
export const CAMERA_Z = 11;
export const MOBILE_BREAKPOINT = 768;

export const BG_COLOR = 0x070a17;
export const AMBIENT_INTENSITY = 0.3;

export const KEY_LIGHT_COLOR = 0x60efff;
export const KEY_LIGHT_INTENSITY = 2.8;
export const KEY_LIGHT_POSITION = { x: 2, y: 4, z: 6 };

export const FILL_LIGHT_COLOR = 0x0061ff;
export const FILL_LIGHT_INTENSITY = 1.2;
export const FILL_LIGHT_POSITION = { x: -3, y: -1, z: 4 };

export const RIM_LIGHT_COLOR = 0x00c8ff;
export const RIM_LIGHT_INTENSITY = 1.0;
export const RIM_LIGHT_POSITION = { x: 0, y: -4, z: -3 };

export const JELLYFISH_SCALE = 1.4;
export const JELLYFISH_SCALE_MOBILE = 0.9;

// Procedural animation
export const FLOAT_AMPLITUDE = 0.18;
export const FLOAT_FREQUENCY = 0.5;
export const ROTATION_SPEED = 0.08;
export const SWAY_AMPLITUDE_X = 0.04;
export const SWAY_FREQUENCY_X = 0.37;
export const SWAY_AMPLITUDE_Z = 0.03;
export const SWAY_FREQUENCY_Z = 0.53;
export const PULSE_AMPLITUDE = 0.035;
export const PULSE_FREQUENCY = 1.1;

// Background ambient particles (similar to Hero)
export const BG_PARTICLE_COUNT = 160;
export const BG_PARTICLE_SPREAD_X = 22;
export const BG_PARTICLE_SPREAD_Y = 14;
export const BG_PARTICLE_DEPTH_RANGE = 8;
export const BG_PARTICLE_SPEED_MIN = 0.03;
export const BG_PARTICLE_SPEED_MAX = 0.14;
export const BG_PARTICLE_SIZE = 0.048;

// Bloom
export const BLOOM_STRENGTH = 1.6;
export const BLOOM_RADIUS = 0.55;
export const BLOOM_THRESHOLD = 0.18;

// Immersion — scroll-driven "dive" effect
export const IMMERSION_CAMERA_Z_START = 11;   // camera Z at scroll=0
export const IMMERSION_CAMERA_Z_END   = 6.5;  // camera Z at scroll=1 (closest)
export const IMMERSION_SCALE_START    = 1.0;  // jellyfish scale multiplier at scroll=0
export const IMMERSION_SCALE_END      = 1.22; // jellyfish scale multiplier at scroll=1
export const IMMERSION_BLOOM_START    = 1.6;  // bloom strength at scroll=0
export const IMMERSION_BLOOM_END      = 2.4;  // bloom strength at scroll=1
export const IMMERSION_BG_SPEED_MULT  = 2.2;  // max bg particle speed multiplier at scroll=1

export interface RingConfig {
  categoryID: SkillCategory;
  radiusX: number;
  radiusZ: number;
  inclination: number; // radians — tilt relative to XZ plane
  speed: number;       // orbit speed multiplier
  particleCount: number;
  particleSize: number;
  particleColor: number;
  particleColorActive: number;
  cardAnchorAngle: number; // angle on the ellipse where the card anchor sits (radians)
}

export const RING_CONFIGS: RingConfig[] = [
  {
    categoryID: "frontend",
    radiusX: 5.2,
    radiusZ: 2.2,
    inclination: 0.18,
    speed: 0.18,
    particleCount: 32,
    particleSize: 0.13,
    particleColor: 0x0080cc,
    particleColorActive: 0x60efff,
    cardAnchorAngle: Math.PI * 0.25,
  },
  {
    categoryID: "backend",
    radiusX: 6.8,
    radiusZ: 2.8,
    inclination: -0.28,
    speed: 0.13,
    particleCount: 26,
    particleSize: 0.12,
    particleColor: 0x0055aa,
    particleColorActive: 0x00c8ff,
    cardAnchorAngle: Math.PI * 0.6,
  },
  {
    categoryID: "database",
    radiusX: 8.4,
    radiusZ: 3.4,
    inclination: 0.42,
    speed: 0.09,
    particleCount: 22,
    particleSize: 0.11,
    particleColor: 0x003d88,
    particleColorActive: 0x0061ff,
    cardAnchorAngle: Math.PI * 1.1,
  },
  {
    categoryID: "infra",
    radiusX: 10.2,
    radiusZ: 4.2,
    inclination: -0.52,
    speed: 0.065,
    particleCount: 28,
    particleSize: 0.1,
    particleColor: 0x002966,
    particleColorActive: 0x3388ff,
    cardAnchorAngle: Math.PI * 1.55,
  },
  {
    categoryID: "digital-marketing",
    radiusX: 12.0,
    radiusZ: 5.0,
    inclination: 0.62,
    speed: 0.045,
    particleCount: 34,
    particleSize: 0.09,
    particleColor: 0x001a44,
    particleColorActive: 0x60efff,
    cardAnchorAngle: Math.PI * 1.9,
  },
];

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  frontend: "Frontend Current",
  backend: "Backend Current",
  database: "Database Current",
  infra: "Infrastructure & Tools Current",
  "digital-marketing": "Digital Marketing Current",
};
