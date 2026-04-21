"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import {
  AMBIENT_INTENSITY,
  BG_COLOR,
  BG_PARTICLE_COUNT,
  BG_PARTICLE_DEPTH_RANGE,
  BG_PARTICLE_SIZE,
  BG_PARTICLE_SPEED_MAX,
  BG_PARTICLE_SPEED_MIN,
  BG_PARTICLE_SPREAD_X,
  BG_PARTICLE_SPREAD_Y,
  BLOOM_RADIUS,
  BLOOM_STRENGTH,
  BLOOM_THRESHOLD,
  CAMERA_FOV,
  CAMERA_Z,
  FILL_LIGHT_COLOR,
  FILL_LIGHT_INTENSITY,
  FILL_LIGHT_POSITION,
  FLOAT_AMPLITUDE,
  FLOAT_FREQUENCY,
  IMMERSION_BG_SPEED_MULT,
  IMMERSION_BLOOM_END,
  IMMERSION_BLOOM_START,
  IMMERSION_CAMERA_Z_END,
  IMMERSION_CAMERA_Z_START,
  IMMERSION_SCALE_END,
  IMMERSION_SCALE_START,
  JELLYFISH_SCALE,
  JELLYFISH_SCALE_MOBILE,
  KEY_LIGHT_COLOR,
  KEY_LIGHT_INTENSITY,
  KEY_LIGHT_POSITION,
  MOBILE_BREAKPOINT,
  PULSE_AMPLITUDE,
  PULSE_FREQUENCY,
  RIM_LIGHT_COLOR,
  RIM_LIGHT_INTENSITY,
  RIM_LIGHT_POSITION,
  RING_CONFIGS,
  ROTATION_SPEED,
  SWAY_AMPLITUDE_X,
  SWAY_AMPLITUDE_Z,
  SWAY_FREQUENCY_X,
  SWAY_FREQUENCY_Z,
} from "./constants";

interface Props {
  scrollProgress: number; // 0–1
  activeRingIndex: number; // which ring is currently active (-1 = none)
}

// Build ellipse point from angle, radii, and inclination (tilt around X axis)
function ellipsePoint(
  angle: number,
  radiusX: number,
  radiusZ: number,
  inclination: number
): THREE.Vector3 {
  const x = Math.cos(angle) * radiusX;
  const z = Math.sin(angle) * radiusZ;
  const y = z * Math.sin(inclination);
  const zFinal = z * Math.cos(inclination);
  return new THREE.Vector3(x, y, zFinal);
}

export default function JellyfishCanvas({ scrollProgress, activeRingIndex }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(scrollProgress);
  const activeRingRef = useRef(activeRingIndex);

  useEffect(() => { scrollRef.current = scrollProgress; }, [scrollProgress]);
  useEffect(() => { activeRingRef.current = activeRingIndex; }, [activeRingIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // ── Scene / Camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG_COLOR);

    const camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, CAMERA_Z);

    // ── Lighting ──────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, AMBIENT_INTENSITY));

    const keyLight = new THREE.DirectionalLight(KEY_LIGHT_COLOR, KEY_LIGHT_INTENSITY);
    keyLight.position.set(KEY_LIGHT_POSITION.x, KEY_LIGHT_POSITION.y, KEY_LIGHT_POSITION.z);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(FILL_LIGHT_COLOR, FILL_LIGHT_INTENSITY, 30);
    fillLight.position.set(FILL_LIGHT_POSITION.x, FILL_LIGHT_POSITION.y, FILL_LIGHT_POSITION.z);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(RIM_LIGHT_COLOR, RIM_LIGHT_INTENSITY);
    rimLight.position.set(RIM_LIGHT_POSITION.x, RIM_LIGHT_POSITION.y, RIM_LIGHT_POSITION.z);
    scene.add(rimLight);

    const jellyfishGlow = new THREE.PointLight(0x00d4ff, 2.5, 8);
    scene.add(jellyfishGlow);

    // ── Background ambient particles ──────────────────────────────────────
    const makeBgLayer = (color: number, opacity: number) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(BG_PARTICLE_COUNT * 3);
      const spd = new Float32Array(BG_PARTICLE_COUNT);
      for (let i = 0; i < BG_PARTICLE_COUNT; i++) {
        pos[i * 3 + 0] = (Math.random() - 0.5) * BG_PARTICLE_SPREAD_X;
        pos[i * 3 + 1] = (Math.random() - 0.5) * BG_PARTICLE_SPREAD_Y;
        pos[i * 3 + 2] = -(Math.random() * BG_PARTICLE_DEPTH_RANGE + 2);
        spd[i] = BG_PARTICLE_SPEED_MIN + Math.random() * (BG_PARTICLE_SPEED_MAX - BG_PARTICLE_SPEED_MIN);
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color,
        size: BG_PARTICLE_SIZE,
        transparent: true,
        opacity,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });
      return { points: new THREE.Points(geo, mat), speeds: spd };
    };

    const bg1 = makeBgLayer(0xadd8ff, 0.14);
    const bg2 = makeBgLayer(0xffffff, 0.09);
    scene.add(bg1.points);
    scene.add(bg2.points);

    // ── Post-processing ───────────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      BLOOM_STRENGTH,
      BLOOM_RADIUS,
      BLOOM_THRESHOLD
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // ── Orbital ring particles ────────────────────────────────────────────
    interface RingState {
      particles: THREE.Points;
      material: THREE.PointsMaterial;
      activeMaterial: THREE.PointsMaterial;
      angles: Float32Array;
      orbitOffset: number;
      config: typeof RING_CONFIGS[number];
    }

    const ringStates: RingState[] = RING_CONFIGS.map((cfg) => {
      const count = cfg.particleCount;
      const angles = new Float32Array(count);
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        angles[i] = (i / count) * Math.PI * 2;
        const pt = ellipsePoint(angles[i], cfg.radiusX, cfg.radiusZ, cfg.inclination);
        positions[i * 3 + 0] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        color: cfg.particleColor,
        size: cfg.particleSize,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });

      const activeMat = new THREE.PointsMaterial({
        color: cfg.particleColorActive,
        size: cfg.particleSize * 1.6,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });

      const pts = new THREE.Points(geo, mat);
      scene.add(pts);

      return { particles: pts, material: mat, activeMaterial: activeMat, angles, orbitOffset: Math.random() * Math.PI * 2, config: cfg };
    });

    // ── Jellyfish model ───────────────────────────────────────────────────
    let jellyfish: THREE.Group | null = null;

    const loader = new GLTFLoader();
    loader.load("/models/exotic_blue_jellyfish.glb", (gltf) => {
      jellyfish = gltf.scene;
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      jellyfish.scale.setScalar(isMobile ? JELLYFISH_SCALE_MOBILE : JELLYFISH_SCALE);
      jellyfish.position.set(0, 0, 0);

      jellyfish.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            const mat = m as THREE.MeshStandardMaterial;
            if (mat.isMeshStandardMaterial) {
              mat.emissive = new THREE.Color(0x003366);
              mat.emissiveIntensity = 0.4;
            }
          });
        }
      });

      scene.add(jellyfish);
    });

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);
      if (jellyfish) {
        jellyfish.scale.setScalar(w < MOBILE_BREAKPOINT ? JELLYFISH_SCALE_MOBILE : JELLYFISH_SCALE);
      }
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────────────────────
    const timer = new THREE.Timer();
    timer.connect(document);
    let animId: number;

    const halfY = BG_PARTICLE_SPREAD_Y / 2;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.05);
      const t = timer.getElapsed();
      const activeIdx = activeRingRef.current;

      // Scroll-driven immersion — lerp each property toward its target
      const scroll = scrollRef.current;
      const targetCamZ  = IMMERSION_CAMERA_Z_START + (IMMERSION_CAMERA_Z_END - IMMERSION_CAMERA_Z_START) * scroll;
      const immersionScale = IMMERSION_SCALE_START + (IMMERSION_SCALE_END - IMMERSION_SCALE_START) * scroll;
      const targetBloom = IMMERSION_BLOOM_START + (IMMERSION_BLOOM_END - IMMERSION_BLOOM_START) * scroll;
      const bgSpeedMult = 1 + (IMMERSION_BG_SPEED_MULT - 1) * scroll;

      camera.position.z += (targetCamZ - camera.position.z) * 0.04;
      bloomPass.strength += (targetBloom - bloomPass.strength) * 0.04;

      // Jellyfish procedural animation
      if (jellyfish) {
        jellyfish.position.y = Math.sin(t * FLOAT_FREQUENCY * Math.PI * 2) * FLOAT_AMPLITUDE;
        jellyfish.rotation.y += ROTATION_SPEED * dt;
        jellyfish.rotation.x = Math.sin(t * SWAY_FREQUENCY_X * Math.PI * 2) * SWAY_AMPLITUDE_X;
        jellyfish.rotation.z = Math.sin(t * SWAY_FREQUENCY_Z * Math.PI * 2) * SWAY_AMPLITUDE_Z;
        const pulse = 1 + Math.sin(t * PULSE_FREQUENCY * Math.PI * 2) * PULSE_AMPLITUDE;
        const baseScale = (window.innerWidth < MOBILE_BREAKPOINT ? JELLYFISH_SCALE_MOBILE : JELLYFISH_SCALE) * immersionScale;
        jellyfish.scale.set(baseScale, baseScale * pulse, baseScale);
        jellyfishGlow.intensity = 2.0 + Math.sin(t * PULSE_FREQUENCY * Math.PI * 2) * 0.8;
      }

      // Background particles drift upward (faster as user dives deeper)
      const attr1 = bg1.points.geometry.attributes.position as THREE.BufferAttribute;
      const attr2 = bg2.points.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < BG_PARTICLE_COUNT; i++) {
        const y1 = attr1.getY(i) + bg1.speeds[i] * bgSpeedMult * dt;
        attr1.setY(i, y1 > halfY ? -halfY : y1);
        const y2 = attr2.getY(i) + bg2.speeds[i] * bgSpeedMult * dt;
        attr2.setY(i, y2 > halfY ? -halfY : y2);
      }
      attr1.needsUpdate = true;
      attr2.needsUpdate = true;

      // Ring particles
      ringStates.forEach((rs, i) => {
        const isActive = i === activeIdx;

        if (isActive && rs.particles.material !== rs.activeMaterial) {
          rs.particles.material = rs.activeMaterial;
        } else if (!isActive && rs.particles.material !== rs.material) {
          rs.particles.material = rs.material;
        }

        const targetOpacity = isActive ? 0.95 : 0.4;
        const currentMat = rs.particles.material as THREE.PointsMaterial;
        currentMat.opacity += (targetOpacity - currentMat.opacity) * 0.04;

        rs.orbitOffset += rs.config.speed * dt;

        const posAttr = rs.particles.geometry.attributes.position as THREE.BufferAttribute;
        for (let p = 0; p < rs.config.particleCount; p++) {
          const angle = rs.angles[p] + rs.orbitOffset;
          const pt = ellipsePoint(angle, rs.config.radiusX, rs.config.radiusZ, rs.config.inclination);
          posAttr.setXYZ(p, pt.x, pt.y, pt.z);
        }
        posAttr.needsUpdate = true;
      });

      composer.render();
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      timer.disconnect();
      window.removeEventListener("resize", onResize);
      bg1.points.geometry.dispose();
      bg2.points.geometry.dispose();
      ringStates.forEach((rs) => {
        rs.particles.geometry.dispose();
        rs.material.dispose();
        rs.activeMaterial.dispose();
      });
      composer.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
