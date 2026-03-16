'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

// Tank nozzle positions in ship-local space (after rotation to +X axis).
// The ship is built along +Y then rotated -90° on Z, so:
//   ship +Y → local +X (forward), ship +X → local -Y, ship +Z stays +Z
// Nozzle Y in build space = -tankHeight/2 - 0.1 = -0.55
// After rotation: nozzle X = -(-0.55) = doesn't work simply — we need the
// actual offset values as the model renders them (post-rotation).
// Build-space nozzle positions: (tx, -0.55, tz) with tankOffset=0.22, angle = i/3*2PI + PI/6
// After group.rotation.z = -PI/2: (x,y,z) → (y, -x, z)
// So nozzle at build (tx, -0.55, tz) → local (-0.55, -tx, tz)
const TANK_OFFSET = 0.22;
const NOZZLE_Y_BUILD = -0.55; // -tankHeight/2 - 0.1

export const HAIL_MARY_NOZZLE_OFFSETS = [0, 1, 2].map(i => {
  const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
  const tx = Math.cos(angle) * TANK_OFFSET;
  const tz = Math.sin(angle) * TANK_OFFSET;
  // After rotation.z = -PI/2: (x,y,z) → (y, -x, z)
  return { x: NOZZLE_Y_BUILD, y: -tx, z: tz };
});

/**
 * Procedural 3D model of the Hail Mary spacecraft from Project Hail Mary.
 * Structure (nose to tail):
 *   1. Pointed nose cone
 *   2. Narrow cylindrical crew module with band details
 *   3. Tapered transition section widening toward fuel tanks
 *   4. Three large cylindrical Astrophage fuel tanks with rounded caps
 */
export default function HailMaryShip({ scale = 1 }: { scale?: number }) {
  const shipGroup = useMemo(() => {
    const group = new THREE.Group();

    // Shared materials — light silver-gray hull
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xc8c8c8,
      metalness: 0.5,
      roughness: 0.35,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x8a8a8a,
      metalness: 0.6,
      roughness: 0.3,
    });
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x999999,
      metalness: 0.7,
      roughness: 0.2,
    });

    // ── 1. Nose Cone (pointed tip) ──
    const noseGeo = new THREE.ConeGeometry(0.12, 0.35, 16);
    const nose = new THREE.Mesh(noseGeo, hullMat);
    nose.position.set(0, 2.05, 0);
    group.add(nose);

    // Small spherical tip
    const tipGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const tip = new THREE.Mesh(tipGeo, darkMat);
    tip.position.set(0, 2.23, 0);
    group.add(tip);

    // ── 2. Upper Crew Module (narrow cylinder) ──
    const crewGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.7, 16);
    const crew = new THREE.Mesh(crewGeo, hullMat);
    crew.position.set(0, 1.53, 0);
    group.add(crew);

    // Band detail at top of crew module
    const band1Geo = new THREE.CylinderGeometry(0.155, 0.155, 0.04, 16);
    const band1 = new THREE.Mesh(band1Geo, bandMat);
    band1.position.set(0, 1.85, 0);
    group.add(band1);

    // Band detail at bottom of crew module
    const band2Geo = new THREE.CylinderGeometry(0.165, 0.165, 0.04, 16);
    const band2 = new THREE.Mesh(band2Geo, bandMat);
    band2.position.set(0, 1.18, 0);
    group.add(band2);

    // Viewport bump (small dome on crew section)
    const viewportGeo = new THREE.SphereGeometry(0.04, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const viewport = new THREE.Mesh(viewportGeo, darkMat);
    viewport.position.set(0.13, 1.6, 0);
    viewport.rotation.set(0, 0, -Math.PI / 2);
    group.add(viewport);

    // ── 3. Mid Section (slightly wider) ──
    const midGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.35, 16);
    const mid = new THREE.Mesh(midGeo, hullMat);
    mid.position.set(0, 1.0, 0);
    group.add(mid);

    // Band at mid section
    const band3Geo = new THREE.CylinderGeometry(0.19, 0.19, 0.03, 16);
    const band3 = new THREE.Mesh(band3Geo, bandMat);
    band3.position.set(0, 0.83, 0);
    group.add(band3);

    // ── 4. Tapered Transition (widens to fuel tank cluster) ──
    const transitionGeo = new THREE.CylinderGeometry(0.18, 0.38, 0.35, 16);
    const transition = new THREE.Mesh(transitionGeo, darkMat);
    transition.position.set(0, 0.63, 0);
    group.add(transition);

    // Panel line details on transition (grooves)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const grooveGeo = new THREE.BoxGeometry(0.01, 0.2, 0.08);
      const groove = new THREE.Mesh(grooveGeo, bandMat);
      groove.position.set(
        Math.cos(angle) * 0.3,
        0.63,
        Math.sin(angle) * 0.3
      );
      groove.rotation.y = -angle;
      group.add(groove);
    }

    // ── 5. Three Astrophage Fuel Tanks ──
    const tankRadius = 0.14;
    const tankHeight = 0.9;
    const tankOffset = 0.22; // Distance from center axis

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
      const tx = Math.cos(angle) * tankOffset;
      const tz = Math.sin(angle) * tankOffset;

      // Main tank cylinder
      const tankGeo = new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 16);
      const tank = new THREE.Mesh(tankGeo, hullMat);
      tank.position.set(tx, 0.0, tz);
      group.add(tank);

      // Tank top cap (dome)
      const topCapGeo = new THREE.SphereGeometry(tankRadius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const topCap = new THREE.Mesh(topCapGeo, hullMat);
      topCap.position.set(tx, tankHeight / 2, tz);
      group.add(topCap);

      // Tank bottom cap (dome)
      const bottomCapGeo = new THREE.SphereGeometry(tankRadius, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      const bottomCap = new THREE.Mesh(bottomCapGeo, hullMat);
      bottomCap.position.set(tx, -tankHeight / 2, tz);
      group.add(bottomCap);

      // Tank band details (3 bands per tank)
      for (let b = 0; b < 3; b++) {
        const bandY = -0.3 + b * 0.3;
        const tbGeo = new THREE.CylinderGeometry(tankRadius + 0.008, tankRadius + 0.008, 0.025, 16);
        const tb = new THREE.Mesh(tbGeo, bandMat);
        tb.position.set(tx, bandY, tz);
        group.add(tb);
      }

      // Vertical strut detail on each tank
      const strutGeo = new THREE.BoxGeometry(0.015, tankHeight * 0.8, 0.015);
      const strut = new THREE.Mesh(strutGeo, bandMat);
      strut.position.set(
        tx + Math.cos(angle) * (tankRadius + 0.005),
        0.0,
        tz + Math.sin(angle) * (tankRadius + 0.005)
      );
      group.add(strut);

      // Second strut rotated 90 degrees on tank
      const strut2Geo = new THREE.BoxGeometry(0.015, tankHeight * 0.8, 0.015);
      const strut2 = new THREE.Mesh(strut2Geo, bandMat);
      strut2.position.set(
        tx + Math.cos(angle + Math.PI / 2) * (tankRadius + 0.005),
        0.0,
        tz + Math.sin(angle + Math.PI / 2) * (tankRadius + 0.005)
      );
      group.add(strut2);

      // Nozzle ring at bottom of each tank
      const nozzleGeo = new THREE.TorusGeometry(tankRadius * 0.7, 0.02, 8, 16);
      const nozzle = new THREE.Mesh(nozzleGeo, darkMat);
      nozzle.position.set(tx, -tankHeight / 2 - 0.1, tz);
      nozzle.rotation.x = Math.PI / 2;
      group.add(nozzle);
    }

    // ── 6. Central connector between tanks and body ──
    const connectorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12);
    const connector = new THREE.Mesh(connectorGeo, darkMat);
    connector.position.set(0, 0.38, 0);
    group.add(connector);

    // Rotate the whole ship so it points along +X axis (to match existing ship orientation)
    // The ship is built along Y axis, so rotate -90° on Z to point along +X
    group.rotation.z = -Math.PI / 2;

    return group;
  }, []);

  return (
    <primitive
      object={shipGroup.clone()}
      scale={scale}
    />
  );
}
