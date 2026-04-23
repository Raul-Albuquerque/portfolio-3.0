"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Milestone } from "./index";
import {
  MOBILE_BREAKPOINT,
  BG_COLOR,
  CAMERA_FOV_WIDE,
  CAMERA_FOV_NARROW,
  CAM_Z_BEHIND,
  CAM_Y_ABOVE,
  CAM_LERP,
  FOG_NEAR,
  FOG_FAR,
  AMBIENT_INTENSITY,
  KEY_LIGHT_COLOR,
  KEY_LIGHT_INTENSITY,
  KEY_LIGHT_POSITION,
  FILL_LIGHT_COLOR,
  FILL_LIGHT_INTENSITY,
  FILL_LIGHT_POSITION,
  TRAIL_GHOST_COLOR,
  TRAIL_GHOST_OPACITY,
  TRAIL_TRAVELED_COLOR,
  TRAIL_TRAVELED_OPACITY,
  TRAIL_DASH_SIZE,
  TRAIL_GAP_SIZE,
  WP_DOT_RADIUS,
  WP_DOT_COLOR,
  WP_DOT_OPACITY,
  BG_PARTICLE_COUNT,
  BG_SPREAD_X,
  BG_SPREAD_Y,
  BG_PARTICLE_SIZE,
  BG_SPEED_MIN,
  BG_SPEED_MAX,
  CARD_BEFORE,
  CARD_AFTER,
  CARD_RAMP,
} from "./constants";

// ─── 9 waypoints — serpentine dive, 6 units apart on Z ───────────────────────
const WAYPOINTS = [
  new THREE.Vector3(-2.5,  1.5,   0),
  new THREE.Vector3( 2.5,  0.2,  -6),
  new THREE.Vector3(-2.8, -1.2, -12),
  new THREE.Vector3( 2.8, -2.6, -18),
  new THREE.Vector3(-2.5, -4.0, -24),
  new THREE.Vector3( 2.8, -5.4, -30),
  new THREE.Vector3(-2.8, -6.8, -36),
  new THREE.Vector3( 2.5, -8.2, -42),
  new THREE.Vector3(-1.0, -9.6, -48),
];

const CURVE_SEGMENTS = 500;

function buildCurve() {
  return new THREE.CatmullRomCurve3(WAYPOINTS, false, "catmullrom", 0.5);
}

function waypointT(index: number, curve: THREE.CatmullRomCurve3): number {
  const target = WAYPOINTS[index];
  let bestT = index / (WAYPOINTS.length - 1);
  let bestDist = Infinity;
  for (let i = 0; i <= 500; i++) {
    const t = i / 500;
    const d = curve.getPointAt(t).distanceTo(target);
    if (d < bestDist) { bestDist = d; bestT = t; }
  }
  return bestT;
}

// Build a simple procedural propeller with N blades
function buildPropeller(blades = 4): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    metalness: 0.7,
    roughness: 0.3,
    transparent: true,
    opacity: 0.85,
  });

  for (let i = 0; i < blades; i++) {
    const geo = new THREE.BoxGeometry(0.04, 0.28, 0.06);
    const mesh = new THREE.Mesh(geo, mat);
    const angle = (i / blades) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * 0.14, Math.sin(angle) * 0.14, 0);
    mesh.rotation.z = angle + Math.PI / 2;
    group.add(mesh);
  }

  // Hub
  const hubGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8);
  hubGeo.rotateX(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, mat);
  group.add(hub);

  return group;
}

interface CardState {
  el: HTMLDivElement;
  t: number;
  opacity: number;
  isLeft: boolean;
  wpPos: THREE.Vector3;
  // text nodes updated on language change without rebuilding the DOM
  badgeEl: HTMLElement;
  titleEl: HTMLElement;
  descEl: HTMLElement;
  regionEl: HTMLElement | null;
}

interface Props {
  milestones: Milestone[];
  progressRef: React.RefObject<number>;
}

export default function OceanCanvas({ milestones, progressRef }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<CardState[]>([]);

  useEffect(() => {
    const canvas  = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const isMobNow = () => window.innerWidth < MOBILE_BREAKPOINT;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // ── Scene & fog ───────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG_COLOR);
    scene.fog = new THREE.Fog(BG_COLOR, FOG_NEAR, FOG_FAR);

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      CAMERA_FOV_WIDE,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      80,
    );
    const wp0 = WAYPOINTS[0];
    camera.position.set(0, wp0.y + CAM_Y_ABOVE, wp0.z + CAM_Z_BEHIND);

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, AMBIENT_INTENSITY));

    const keyLight = new THREE.DirectionalLight(KEY_LIGHT_COLOR, KEY_LIGHT_INTENSITY);
    keyLight.position.set(KEY_LIGHT_POSITION.x, KEY_LIGHT_POSITION.y, KEY_LIGHT_POSITION.z);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(FILL_LIGHT_COLOR, FILL_LIGHT_INTENSITY, 25);
    fillLight.position.set(FILL_LIGHT_POSITION.x, FILL_LIGHT_POSITION.y, FILL_LIGHT_POSITION.z);
    scene.add(fillLight);

    // ── Curve ─────────────────────────────────────────────────────────────────
    const curve       = buildCurve();
    const curvePoints = curve.getPoints(CURVE_SEGMENTS);

    const fullPosArr = new Float32Array(curvePoints.length * 3);
    curvePoints.forEach((p, i) => {
      fullPosArr[i * 3]     = p.x;
      fullPosArr[i * 3 + 1] = p.y;
      fullPosArr[i * 3 + 2] = p.z;
    });

    // ── Ghost line ───────────────────────────────────────────────────────────
    const ghostGeo = new THREE.BufferGeometry();
    ghostGeo.setAttribute("position", new THREE.BufferAttribute(fullPosArr.slice(), 3));
    const ghostMat = new THREE.LineDashedMaterial({
      color:       TRAIL_GHOST_COLOR,
      opacity:     TRAIL_GHOST_OPACITY,
      transparent: true,
      dashSize:    TRAIL_DASH_SIZE,
      gapSize:     TRAIL_GAP_SIZE,
      linewidth:   1,
    });
    const ghostLine = new THREE.Line(ghostGeo, ghostMat);
    ghostLine.computeLineDistances();
    scene.add(ghostLine);

    // ── Traveled line ────────────────────────────────────────────────────────
    const traveledPosArr = new Float32Array(curvePoints.length * 3);
    traveledPosArr.set(fullPosArr);
    const traveledGeo = new THREE.BufferGeometry();
    traveledGeo.setAttribute("position", new THREE.BufferAttribute(traveledPosArr, 3));
    const traveledMat = new THREE.LineBasicMaterial({
      color:       TRAIL_TRAVELED_COLOR,
      opacity:     TRAIL_TRAVELED_OPACITY,
      transparent: true,
      linewidth:   1,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });
    const traveledLine = new THREE.Line(traveledGeo, traveledMat);
    traveledGeo.setDrawRange(0, 0);
    scene.add(traveledLine);

    const haloMat = new THREE.LineBasicMaterial({
      color:       0xaaeeff,
      opacity:     0.22,
      transparent: true,
      linewidth:   1,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });
    const haloGeo  = new THREE.BufferGeometry();
    haloGeo.setAttribute("position", new THREE.BufferAttribute(traveledPosArr, 3));
    const haloLine = new THREE.Line(haloGeo, haloMat);
    haloGeo.setDrawRange(0, 0);
    scene.add(haloLine);

    // ── Waypoint dots ─────────────────────────────────────────────────────────
    const dotGeo = new THREE.SphereGeometry(WP_DOT_RADIUS, 10, 10);
    const dotMeshes = WAYPOINTS.map((wp) => {
      const mat = new THREE.MeshBasicMaterial({
        color: WP_DOT_COLOR, transparent: true, opacity: WP_DOT_OPACITY,
      });
      const m = new THREE.Mesh(dotGeo, mat);
      m.position.copy(wp);
      scene.add(m);
      return m;
    });

    // ── Submarine group ───────────────────────────────────────────────────────
    // Pivot group: we rotate this to orient along the curve tangent
    const submarinePivot = new THREE.Group();
    scene.add(submarinePivot);

    // Propeller at the rear of the submarine (z ≈ +0.54 in local space)
    const propeller = buildPropeller(4);
    propeller.position.set(0, 0, 0.54);
    submarinePivot.add(propeller);

    // Point light that rides with the submarine
    const subLight = new THREE.PointLight(0x00d4ff, 3.0, 6);
    submarinePivot.add(subLight);

    // Bioluminescent trail — tube of points behind the submarine
    const TRAIL_POINTS = 40;
    const trailPositions = new Float32Array(TRAIL_POINTS * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color:       0x00ffdd,
      opacity:     0.55,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      linewidth:   1,
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(trailLine);

    // Ring history for the bio trail
    const trailHistory: THREE.Vector3[] = Array.from(
      { length: TRAIL_POINTS },
      () => new THREE.Vector3(),
    );
    let trailFilled = false;

    // Placeholder placeholder mesh so submarine renders immediately while GLB loads
    const placeholderGeo = new THREE.CapsuleGeometry(0.18, 0.9, 6, 8);
    placeholderGeo.rotateX(Math.PI / 2);
    const placeholderMat = new THREE.MeshStandardMaterial({
      color: 0x226688,
      metalness: 0.5,
      roughness: 0.5,
      transparent: true,
      opacity: 0.0,
    });
    const placeholderMesh = new THREE.Mesh(placeholderGeo, placeholderMat);
    submarinePivot.add(placeholderMesh);

    // Load the GLB
    const loader = new GLTFLoader();
    loader.load(
      "/models/submarine.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(0.55);
        // Model's +X is its nose; rotate -90° around Y so +X maps to -Z (forward in Three.js)
        model.rotation.y = -Math.PI / 2;
        submarinePivot.add(model);
        submarinePivot.remove(placeholderMesh);
        placeholderGeo.dispose();
      },
      undefined,
      () => {
        placeholderMat.opacity = 0.7;
      },
    );

    // ── Background bioluminescent particles ───────────────────────────────────
    const makeBgLayer = (color: number, opacity: number) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(BG_PARTICLE_COUNT * 3);
      const spd = new Float32Array(BG_PARTICLE_COUNT);
      for (let i = 0; i < BG_PARTICLE_COUNT; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * BG_SPREAD_X;
        pos[i * 3 + 1] = (Math.random() - 0.5) * BG_SPREAD_Y;
        pos[i * 3 + 2] = -(Math.random() * 52);
        spd[i] = BG_SPEED_MIN + Math.random() * (BG_SPEED_MAX - BG_SPEED_MIN);
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color, size: BG_PARTICLE_SIZE, transparent: true, opacity,
        depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending,
      });
      return { pts: new THREE.Points(geo, mat), spd };
    };

    const bg1 = makeBgLayer(0x3ab0ff, 0.18);
    const bg2 = makeBgLayer(0xffffff, 0.08);
    scene.add(bg1.pts);
    scene.add(bg2.pts);

    // ── Milestone t-values ────────────────────────────────────────────────────
    const milestoneTs = milestones.map((_, i) => waypointT(i, curve));

    // ── Card DOM overlays ─────────────────────────────────────────────────────
    const isMobInit = isMobNow();

    const CARD_WIDTH = 260; // px

    const cards: CardState[] = milestones.map((ms, i) => {
      const isLeft = WAYPOINTS[i].x <= 0;

      const card = document.createElement("div");

      const mobileStyle = isMobInit
        ? `left:50%; bottom:8%; width:min(300px,86vw); text-align:center; transform:translateX(-50%);`
        : `top:0; left:0; width:${CARD_WIDTH}px; text-align:${isLeft ? "left" : "right"};`;

      card.style.cssText = `
        position:absolute;
        ${mobileStyle}
        opacity:0;
        pointer-events:none;
        border-radius:20px;
        border:1px solid rgba(0,180,255,0.20);
        background:rgba(1,8,18,0.94);
        backdrop-filter:blur(18px);
        -webkit-backdrop-filter:blur(18px);
        box-shadow:0 0 0 1px rgba(96,239,255,0.05), 0 8px 48px rgba(0,80,200,0.22);
        padding:${isMobInit ? "14px 16px" : "20px 24px"};
        color:#e2e8f0;
        font-family:inherit;
        will-change:opacity,transform;
      `;

      const accent = document.createElement("div");
      if (!isMobInit) {
        // Accent on the inner edge (the side facing the track)
        accent.style.cssText = `
          position:absolute; ${isLeft ? "right:-1px" : "left:-1px"};
          top:18%; bottom:18%; width:2px; border-radius:1px;
          background:linear-gradient(to bottom,transparent,#0061ff 40%,#60efff 60%,transparent);
          opacity:0.8;
        `;
      } else {
        accent.style.cssText = `
          position:absolute; top:-1px; left:18%; right:18%;
          height:2px; border-radius:1px;
          background:linear-gradient(to right,transparent,#0061ff 40%,#60efff 60%,transparent);
          opacity:0.8;
        `;
      }
      card.appendChild(accent);

      const badge = document.createElement("span");
      badge.style.cssText = `
        display:inline-block; border-radius:9999px;
        background:rgba(0,97,255,0.22); color:#60efff;
        font-size:11px; font-weight:700;
        padding:3px 11px; letter-spacing:0.08em; text-transform:uppercase;
      `;
      badge.textContent = ms.time;

      const title = document.createElement("h4");
      title.style.cssText = `
        margin:8px 0 6px; font-size:${isMobInit ? "13px" : "14.5px"};
        font-weight:700; color:#f0f9ff; line-height:1.3; letter-spacing:0.01em;
      `;
      title.textContent = ms.title;

      const desc = document.createElement("p");
      desc.style.cssText = `
        margin:0; font-size:11.5px;
        color:rgba(148,163,184,0.85); line-height:1.7;
      `;
      desc.textContent = ms.description;

      let regionEl: HTMLElement | null = null;
      if (ms.region) {
        regionEl = document.createElement("div");
        regionEl.style.cssText = `
          margin-top:8px; font-size:10px;
          color:rgba(96,239,255,0.4); letter-spacing:0.09em;
        `;
        regionEl.textContent = `◎ ${ms.region}`;
        card.append(badge, title, desc, regionEl);
      } else {
        card.append(badge, title, desc);
      }

      overlay.appendChild(card);
      return {
        el: card, t: milestoneTs[i], opacity: 0, isLeft, wpPos: WAYPOINTS[i].clone(),
        badgeEl: badge, titleEl: title, descEl: desc, regionEl,
      };
    });

    cardsRef.current = cards;

    // ── Animation state ───────────────────────────────────────────────────────
    let smoothT = 0;
    let isFirst  = true;
    let prevT    = 0;

    // Reusable vectors for orientation
    const tangent  = new THREE.Vector3();
    const up       = new THREE.Vector3(0, 1, 0);
    const quatTarget = new THREE.Quaternion();
    const rotMat   = new THREE.Matrix4();
    const projVec  = new THREE.Vector3(); // reused for card projection each frame

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Animate ───────────────────────────────────────────────────────────────
    const timer = new THREE.Timer();
    timer.connect(document);
    let rafId: number;

    const halfBgY = BG_SPREAD_Y / 2;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      timer.update();
      const dt      = Math.min(timer.getDelta(), 0.05);
      const elapsed = timer.getElapsed();

      const rawT = progressRef.current ?? 0;
      if (isFirst) { smoothT = rawT; isFirst = false; }
      else { smoothT += (rawT - smoothT) * 0.06; }

      const t      = Math.max(0.001, Math.min(0.999, smoothT));
      const curPos = curve.getPointAt(t);

      // Signed delta: positive = moving forward, negative = reversing
      const tDelta = t - prevT;
      const scrollVelocity = Math.abs(tDelta) / dt;
      const movingForward = tDelta >= 0;
      prevT = t;

      // ── Traveled line ────────────────────────────────────────────────────
      const vertexCount = Math.floor(t * CURVE_SEGMENTS) + 2;
      traveledGeo.setDrawRange(0, Math.min(vertexCount, CURVE_SEGMENTS + 1));
      haloGeo.setDrawRange(0, Math.min(vertexCount, CURVE_SEGMENTS + 1));

      // ── Submarine position & orientation ─────────────────────────────────
      // Bobbing: sinusoidal oscillation on Y
      const bobbing = Math.sin(elapsed * 1.8) * 0.06;
      submarinePivot.position.set(curPos.x, curPos.y + bobbing, curPos.z);

      // Orient along the actual direction of travel (forward or reverse)
      // tangent always points in the +t direction of the curve;
      // flip it when the user is scrolling back so the nose follows the motion.
      const tSample = Math.min(t + 0.002, 0.999);
      curve.getPointAt(tSample, tangent);
      tangent.sub(curPos).normalize();
      if (!movingForward) tangent.negate();

      if (tangent.lengthSq() > 0.0001) {
        // model +X is the nose; after the -90° Y rotation baked into the GLB child,
        // the pivot's -Z becomes the effective nose direction in world space.
        // So we want pivot's -Z = tangent, i.e. forward column = -tangent.
        const forward = tangent.clone().negate();
        const right   = new THREE.Vector3().crossVectors(up, forward).normalize();
        const localUp = new THREE.Vector3().crossVectors(forward, right).normalize();
        rotMat.makeBasis(right, localUp, forward);
        quatTarget.setFromRotationMatrix(rotMat);
        submarinePivot.quaternion.slerp(quatTarget, 0.08);
      }

      subLight.intensity = 2.8 + Math.sin(elapsed * 4.5) * 0.8;

      // ── Propeller spin — speed proportional to scroll velocity ───────────
      const propSpeed = 6.0 + scrollVelocity * 80;
      propeller.rotation.z += propSpeed * dt;

      // ── Bioluminescent trail ──────────────────────────────────────────────
      // Shift history and insert current position at front
      for (let i = TRAIL_POINTS - 1; i > 0; i--) {
        trailHistory[i].copy(trailHistory[i - 1]);
      }
      trailHistory[0].copy(submarinePivot.position);

      if (!trailFilled) {
        trailFilled = trailHistory.every((v) => v.lengthSq() > 0);
      }

      const ta = trailGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < TRAIL_POINTS; i++) {
        ta.setXYZ(i, trailHistory[i].x, trailHistory[i].y, trailHistory[i].z);
      }
      ta.needsUpdate = true;
      trailGeo.setDrawRange(0, TRAIL_POINTS);
      // Fade trail opacity by age
      trailMat.opacity = 0.45 + Math.sin(elapsed * 3.0) * 0.1;

      // ── Waypoint dot pulse ────────────────────────────────────────────────
      const dotPulse = 0.82 + Math.sin(elapsed * 2.2) * 0.18;
      dotMeshes.forEach((d, i) => {
        const passed = milestoneTs[i] <= t;
        const mat = d.material as THREE.MeshBasicMaterial;
        mat.opacity = passed
          ? Math.min(WP_DOT_OPACITY + 0.2, 1.0)
          : WP_DOT_OPACITY * 0.6;
        d.scale.setScalar(passed ? dotPulse * 1.2 : dotPulse);
      });

      // ── Camera: overview position that follows progress down the path ─────
      const isMob = isMobNow();
      camera.position.y += (curPos.y + CAM_Y_ABOVE  - camera.position.y) * CAM_LERP;
      camera.position.z += (curPos.z + CAM_Z_BEHIND - camera.position.z) * CAM_LERP;
      camera.position.x += (curPos.x * 0.25         - camera.position.x) * CAM_LERP;

      camera.fov += ((isMob ? CAMERA_FOV_NARROW : CAMERA_FOV_WIDE) - camera.fov) * 0.05;
      camera.updateProjectionMatrix();

      camera.lookAt(curPos.x * 0.3, curPos.y - 0.5, curPos.z - 3);

      // ── Background particles drift upward ─────────────────────────────────
      const a1 = bg1.pts.geometry.attributes.position as THREE.BufferAttribute;
      const a2 = bg2.pts.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < BG_PARTICLE_COUNT; i++) {
        const y1 = a1.getY(i) + bg1.spd[i] * dt;
        a1.setY(i, y1 > halfBgY ? -halfBgY : y1);
        const y2 = a2.getY(i) + bg2.spd[i] * dt;
        a2.setY(i, y2 > halfBgY ? -halfBgY : y2);
      }
      a1.needsUpdate = true;
      a2.needsUpdate = true;

      // ── Cards — one at a time ─────────────────────────────────────────────
      let activeIdx = -1;
      for (let i = 0; i < cards.length; i++) {
        const dist = t - cards[i].t;
        if (dist >= -CARD_BEFORE && dist < CARD_AFTER) { activeIdx = i; break; }
      }

      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;

      for (let i = 0; i < cards.length; i++) {
        const cd = cards[i];
        let target = 0;

        if (i === activeIdx) {
          const dist = t - cd.t;
          if (dist < -CARD_BEFORE + CARD_RAMP) {
            target = Math.max(0, (dist + CARD_BEFORE) / CARD_RAMP);
          } else if (dist > CARD_AFTER - CARD_RAMP) {
            target = Math.max(0, (CARD_AFTER - dist) / CARD_RAMP);
          } else {
            target = 1;
          }
        }

        cd.opacity += (target - cd.opacity) * 0.14;
        const op     = Math.round(cd.opacity * 1000) / 1000;
        const prevOp = parseFloat(cd.el.style.opacity || "0");

        if (Math.abs(op - prevOp) > 0.004) {
          cd.el.style.opacity = String(op);

          if (isMobInit) {
            cd.el.style.transform = `translateX(-50%) translateY(${(1 - op) * 20}px)`;
          } else {
            // Project the waypoint world position to screen space
            projVec.copy(cd.wpPos).project(camera);
            const screenX = (projVec.x * 0.5 + 0.5) * cw;
            const screenY = (1 - (projVec.y * 0.5 + 0.5)) * ch;

            const GAP = 16; // px gap between dot and card edge
            let cardX: number;
            if (cd.isLeft) {
              // Card sits to the LEFT of the projected dot
              cardX = screenX - GAP - CARD_WIDTH;
            } else {
              // Card sits to the RIGHT of the projected dot
              cardX = screenX + GAP;
            }
            // Clamp so it never overflows the viewport
            cardX = Math.max(4, Math.min(cw - CARD_WIDTH - 4, cardX));

            const slideY = (1 - op) * 20;
            cd.el.style.transform = `translate(${cardX}px, calc(${screenY}px - 50% + ${slideY}px))`;
            // Reset top/left since we use transform for everything
            cd.el.style.top  = "0";
            cd.el.style.left = "0";
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      timer.disconnect();
      window.removeEventListener("resize", onResize);
      cards.forEach((cd) => { if (overlay.contains(cd.el)) overlay.removeChild(cd.el); });
      ghostGeo.dispose();
      traveledGeo.dispose();
      haloGeo.dispose();
      dotGeo.dispose();
      trailGeo.dispose();
      bg1.pts.geometry.dispose();
      bg2.pts.geometry.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update only the text nodes when the language changes — no need to rebuild the 3D scene
  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;
    milestones.forEach((ms, i) => {
      const cd = cards[i];
      if (!cd) return;
      cd.badgeEl.textContent = ms.time;
      cd.titleEl.textContent = ms.title;
      cd.descEl.textContent  = ms.description;
      if (cd.regionEl) cd.regionEl.textContent = ms.region ? `◎ ${ms.region}` : "";
    });
  }, [milestones]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none overflow-hidden" />
    </div>
  );
}
