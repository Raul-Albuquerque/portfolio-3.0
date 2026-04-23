"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  AMBIENT_LIGHT_INTENSITY,
  CAMERA_FOV,
  CAMERA_Z,
  FILL_LIGHT_COLOR,
  FILL_LIGHT_INTENSITY,
  FILL_LIGHT_POSITION,
  KEY_LIGHT_COLOR,
  KEY_LIGHT_INTENSITY,
  KEY_LIGHT_POSITION,
  MOBILE_BREAKPOINT,
  OCEAN_BG_COLOR,
  OCEAN_FOG_COLOR,
  OCEAN_FOG_DENSITY,
  PARTICLE_COUNT,
  PARTICLE_DEPTH_RANGE,
  PARTICLE_SIZE,
  PARTICLE_SPEED_MAX,
  PARTICLE_SPEED_MIN,
  PARTICLE_SPREAD_X,
  PARTICLE_SPREAD_Y,
  RIM_LIGHT_COLOR,
  RIM_LIGHT_INTENSITY,
  RIM_LIGHT_POSITION,
  SHARK_CHASE_STIFFNESS,
  SHARK_DAMPING,
  SHARK_HEADING_LERP,
  SHARK_SCALE,
  SHARK_SCALE_MOBILE,
  SWIM_SPEED_REF,
  SWIM_TIMESCALE_MAX,
  SWIM_TIMESCALE_MIN,
} from "./constants";

export default function SharkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(OCEAN_BG_COLOR);
    scene.fog = new THREE.FogExp2(OCEAN_FOG_COLOR, OCEAN_FOG_DENSITY);

    const camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, CAMERA_Z);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY));

    const keyLight = new THREE.DirectionalLight(KEY_LIGHT_COLOR, KEY_LIGHT_INTENSITY);
    keyLight.position.set(KEY_LIGHT_POSITION.x, KEY_LIGHT_POSITION.y, KEY_LIGHT_POSITION.z);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.setScalar(1024);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(RIM_LIGHT_COLOR, RIM_LIGHT_INTENSITY);
    rimLight.position.set(RIM_LIGHT_POSITION.x, RIM_LIGHT_POSITION.y, RIM_LIGHT_POSITION.z);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(FILL_LIGHT_COLOR, FILL_LIGHT_INTENSITY, 20);
    fillLight.position.set(FILL_LIGHT_POSITION.x, FILL_LIGHT_POSITION.y, FILL_LIGHT_POSITION.z);
    scene.add(fillLight);

    // Mouse target in world space (z=0 plane)
    const mouseNDC = { x: 0, y: 0 };
    const mouseWorld = new THREE.Vector3();
    const ndcVec = new THREE.Vector3();

    const updateMouseWorld = () => {
      ndcVec.set(mouseNDC.x, mouseNDC.y, 0.5);
      ndcVec.unproject(camera);
      const camZ = camera.position.z;
      const t = camZ / (camZ - ndcVec.z);
      mouseWorld.x = camera.position.x + (ndcVec.x - camera.position.x) * t;
      mouseWorld.y = camera.position.y + (ndcVec.y - camera.position.y) * t;
      mouseWorld.z = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Physics state — shark chases mouseWorld with spring + damping
    const pos = new THREE.Vector2(0, 0);
    const vel = new THREE.Vector2(0, 0);

    // Heading is the yaw angle the shark visually points toward (world-space)
    // glTF forward = -Z, so heading=0 means shark faces camera (straight ahead)
    let heading = 0;

    let mixer: THREE.AnimationMixer | null = null;
    let swimAction: THREE.AnimationAction | null = null;
    let shark: THREE.Group | null = null;

    // Bioluminescent particles
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const opacities = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * PARTICLE_SPREAD_X;
      positions[i * 3 + 1] = (Math.random() - 0.5) * PARTICLE_SPREAD_Y;
      positions[i * 3 + 2] = -(Math.random() * PARTICLE_DEPTH_RANGE + 1);
      speeds[i] = PARTICLE_SPEED_MIN + Math.random() * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN);
      opacities[i] = 0.08 + Math.random() * 0.22;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Alternate white/blue tint per particle via two interleaved materials
    const makeParticleMat = (color: number, opacity: number) =>
      new THREE.PointsMaterial({
        color,
        size: PARTICLE_SIZE,
        transparent: true,
        opacity,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });

    // Single Points object — colour variation is subtle enough with two layers
    const particles = new THREE.Points(particleGeo, makeParticleMat(0xadd8ff, 0.18));
    scene.add(particles);

    // Second layer shifted slightly for layered depth
    const particleGeo2 = particleGeo.clone();
    const pos2 = particleGeo2.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos2.setXYZ(
        i,
        (Math.random() - 0.5) * PARTICLE_SPREAD_X,
        (Math.random() - 0.5) * PARTICLE_SPREAD_Y,
        -(Math.random() * PARTICLE_DEPTH_RANGE + 1)
      );
    }
    const particles2 = new THREE.Points(particleGeo2, makeParticleMat(0xffffff, 0.12));
    scene.add(particles2);

    // Per-particle vertical speeds for layer 2
    const speeds2 = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      speeds2[i] = PARTICLE_SPEED_MIN + Math.random() * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN);
    }

    const loader = new GLTFLoader();
    loader.load("/models/swimming_shark.glb", (gltf) => {
      shark = gltf.scene;
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      shark.scale.setScalar(isMobile ? SHARK_SCALE_MOBILE : SHARK_SCALE);
      shark.position.set(pos.x, pos.y, 0);

      shark.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(shark);

      mixer = new THREE.AnimationMixer(shark);
      const swimClip = gltf.animations.find((a) => a.name === "swimming") ?? gltf.animations[0];
      if (swimClip) {
        swimAction = mixer.clipAction(swimClip);
        swimAction.setLoop(THREE.LoopRepeat, Infinity);
        swimAction.timeScale = SWIM_TIMESCALE_MIN;
        swimAction.play();
      }
    });

    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (shark) {
        shark.scale.setScalar(w < MOBILE_BREAKPOINT ? SHARK_SCALE_MOBILE : SHARK_SCALE);
      }
    };
    window.addEventListener("resize", onResize);

    const timer = new THREE.Timer();
    timer.connect(document);
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.05); // cap at 50 ms to avoid spiral on tab-focus

      updateMouseWorld();

      // Spring-damper: acceleration toward mouseWorld, velocity decays each frame
      const ax = (mouseWorld.x - pos.x) * SHARK_CHASE_STIFFNESS;
      const ay = (mouseWorld.y - pos.y) * SHARK_CHASE_STIFFNESS;

      vel.x += ax * dt;
      vel.y += ay * dt;
      vel.x *= Math.pow(1 - SHARK_DAMPING, dt);
      vel.y *= Math.pow(1 - SHARK_DAMPING, dt);

      pos.x += vel.x * dt;
      pos.y += vel.y * dt;

      const speed = vel.length();

      if (shark) {
        shark.position.set(pos.x, pos.y, 0);

        // Only steer when moving — avoids spinning in place while idle
        if (speed > 0.05) {
          // glTF forward is -Z. The shark lives in the XY camera plane.
          // Yaw maps lateral velocity to rotation around Y: right = +yaw, left = -yaw.
          // We blend between "facing camera" (heading=0) and a lateral lean based on vel.x.
          const velHeading = Math.atan2(vel.x, speed);
          // Shortest-path lerp on the heading angle
          let delta = velHeading - heading;
          // Wrap to [-π, π]
          while (delta > Math.PI) delta -= Math.PI * 2;
          while (delta < -Math.PI) delta += Math.PI * 2;
          heading += delta * SHARK_HEADING_LERP;

          // Pitch: nose up when moving up, nose down when moving down
          const targetPitch = -Math.atan2(vel.y, speed) * 0.45;
          shark.rotation.x += (targetPitch - shark.rotation.x) * SHARK_HEADING_LERP;

          // Bank (roll): lean into turns
          shark.rotation.z += (-delta * 0.18 - shark.rotation.z) * 0.08;
        } else {
          // Slowly return to level when idle
          shark.rotation.x *= 0.95;
          shark.rotation.z *= 0.95;
        }

        shark.rotation.y = heading;

        // Animate faster when moving faster
        if (swimAction) {
          const t = Math.min(speed / SWIM_SPEED_REF, 1);
          swimAction.timeScale = SWIM_TIMESCALE_MIN + t * (SWIM_TIMESCALE_MAX - SWIM_TIMESCALE_MIN);
        }
      }

      // Drift particles upward; wrap back to bottom when they leave the top
      const halfY = PARTICLE_SPREAD_Y / 2;
      const attr1 = particleGeo.attributes.position as THREE.BufferAttribute;
      const attr2 = particleGeo2.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const y1 = attr1.getY(i) + speeds[i] * dt;
        attr1.setY(i, y1 > halfY ? -halfY : y1);
        const y2 = attr2.getY(i) + speeds2[i] * dt;
        attr2.setY(i, y2 > halfY ? -halfY : y2);
      }
      attr1.needsUpdate = true;
      attr2.needsUpdate = true;

      if (mixer) mixer.update(dt);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      timer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      particleGeo.dispose();
      particleGeo2.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
