'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface VaultCanvas3DProps {
  totalAmount?: string;
  instrumentsCount?: number;
}

export const VaultCanvas3D: React.FC<VaultCanvas3DProps> = ({ 
  totalAmount = '₹18.45 Cr', 
  instrumentsCount = 6 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 300;

    // ── Scene & Camera ──
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d1117, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 8);
    camera.lookAt(0, 0, 0);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ── Vault Assembly Group ──
    const vaultGroup = new THREE.Group();
    scene.add(vaultGroup);

    // 1. Outer Bezel Ring (deep indigo-gold)
    const bezelGeo = new THREE.TorusGeometry(2.4, 0.16, 24, 100);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xc89b3c,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x7c5c1e,
      emissiveIntensity: 0.3
    });
    const bezel = new THREE.Mesh(bezelGeo, goldMat);
    vaultGroup.add(bezel);

    // 2. Decorative bolts around the rim
    const boltGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.9, roughness: 0.2, emissive: 0x1e40af, emissiveIntensity: 0.3 });
    const boltGroup = new THREE.Group();
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.x = Math.cos(angle) * 2.4;
      bolt.position.y = Math.sin(angle) * 2.4;
      bolt.position.z = 0.12;
      boltGroup.add(bolt);
    }
    vaultGroup.add(boltGroup);

    // 3. Deep Steel Door Plate
    const doorGeo = new THREE.CylinderGeometry(2.22, 2.22, 0.18, 64);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c1a,
      metalness: 0.95,
      roughness: 0.3,
    });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.rotation.x = Math.PI / 2;
    vaultGroup.add(door);

    // 4. Inner Ring (glowing cyan)
    const innerRingGeo = new THREE.TorusGeometry(1.72, 0.06, 16, 80);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.5
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    vaultGroup.add(innerRing);

    // 5. Wheel Spokes (cross mechanism)
    const wheelGroup = new THREE.Group();
    const spokeGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.2, 12);
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95, roughness: 0.2 });
    for (let i = 0; i < 4; i++) {
      const spoke = new THREE.Mesh(spokeGeo, spokeMat);
      spoke.rotation.z = (i * Math.PI) / 4;
      wheelGroup.add(spoke);
    }
    // Wheel hub ring
    const hubGeo = new THREE.TorusGeometry(0.95, 0.07, 16, 48);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xc89b3c, metalness: 0.9, roughness: 0.2, emissive: 0x7c5c1e, emissiveIntensity: 0.3 });
    wheelGroup.add(new THREE.Mesh(hubGeo, hubMat));
    vaultGroup.add(wheelGroup);

    // 6. Central Security Core Coin (indigo glowing)
    const coreGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.22, 48);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x1e40af,
      emissiveIntensity: 0.4
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.rotation.x = Math.PI / 2;
    core.position.z = 0.25;
    vaultGroup.add(core);

    // 6b. Core accent ring
    const coreRingGeo = new THREE.TorusGeometry(0.68, 0.025, 12, 40);
    const coreRingMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 1, roughness: 0.05, emissive: 0xd97706, emissiveIntensity: 0.5 });
    const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
    coreRing.rotation.x = Math.PI / 2;
    coreRing.position.z = 0.35;
    vaultGroup.add(coreRing);

    // 7. Holographic data rings (orbiting)
    const makeHoloRing = (radius: number, color: number, speed: number, tilt: number) => {
      const geo = new THREE.TorusGeometry(radius, 0.018, 10, 80);
      const mat = new THREE.MeshBasicMaterial({ color, wireframe: false, transparent: true, opacity: 0.55 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = tilt;
      return { mesh, speed };
    };
    const holoRings = [
      makeHoloRing(1.35, 0x3b82f6, 0.7, 0.3),
      makeHoloRing(1.55, 0x64748b, -0.5, -0.2),
      makeHoloRing(1.15, 0xc89b3c, 0.4, 0.8),
    ];
    holoRings.forEach(({ mesh }) => vaultGroup.add(mesh));

    // 8. Floating data nodes (small glowing orbs orbiting vault)
    const nodeCount = 8;
    const nodes: THREE.Mesh[] = [];
    const nodeColors = [0x3b82f6, 0x14b8a6, 0xc89b3c, 0x22c55e, 0xef4444, 0x60a5fa, 0x2dd4bf, 0xfbbf24];
    for (let i = 0; i < nodeCount; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColors[i],
        emissive: nodeColors[i],
        emissiveIntensity: 0.9,
        metalness: 0.5,
        roughness: 0.1
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      nodes.push(node);
      scene.add(node);
    }

    // 9. Ambient particle field
    const particleCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 3.5 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pPos[i] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i + 2] = (Math.random() - 0.5) * 5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.04, color: 0x3b82f6, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    const goldLight = new THREE.DirectionalLight(0xddb060, 1.8);
    goldLight.position.set(5, 6, 7);
    scene.add(goldLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 3, 12);
    blueLight.position.set(-4, -2, 4);
    scene.add(blueLight);

    const tealLight = new THREE.PointLight(0x14b8a6, 2, 10);
    tealLight.position.set(3, -3, 3);
    scene.add(tealLight);

    const ambientBloom = new THREE.PointLight(0x2563eb, 1.5, 8);
    ambientBloom.position.set(0, 0, 5);
    scene.add(ambientBloom);

    // ── Mouse parallax ──
    let mouseX = 0, mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── Animation ──
    let animId: number;
    const timer = new THREE.Timer();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();

      // Vault mechanical rotations
      wheelGroup.rotation.z = t * 0.35;
      boltGroup.rotation.z = -t * 0.12;

      // Holo rings spin
      holoRings.forEach(({ mesh, speed }) => {
        mesh.rotation.z += speed * 0.008;
        mesh.rotation.y = Math.sin(t * 0.3) * 0.1;
      });

      // Core pulsing
      const corePulse = 1 + Math.sin(t * 3) * 0.04;
      core.scale.set(corePulse, corePulse, 1);
      coreRing.rotation.z = t * 1.2;

      // Floating node orbits
      nodes.forEach((node, i) => {
        const baseAngle = (i / nodeCount) * Math.PI * 2;
        const orbitRadius = 3.4;
        const phaseOffset = t * (0.18 + i * 0.03);
        node.position.x = Math.cos(baseAngle + phaseOffset) * orbitRadius;
        node.position.y = Math.sin(baseAngle + phaseOffset) * orbitRadius * 0.6;
        node.position.z = Math.sin(t * 0.7 + i) * 0.8;
        // Pulsing scale
        const s = 0.8 + Math.sin(t * 2 + i) * 0.3;
        node.scale.setScalar(s);
      });

      // Mouse parallax
      const targetRotY = mouseX * 0.75;
      const targetRotX = -mouseY * 0.55;
      vaultGroup.rotation.y += (targetRotY - vaultGroup.rotation.y) * 0.06;
      vaultGroup.rotation.x += (targetRotX - vaultGroup.rotation.x) * 0.06;

      // Gentle vault drift
      vaultGroup.position.y = Math.sin(t * 0.6) * 0.12;

      // Particle rotation
      particles.rotation.y = t * 0.03;
      particles.rotation.x = t * 0.01;

      // Ambient light pulse
      ambientBloom.intensity = 1.5 + Math.sin(t * 2) * 0.5;
      blueLight.intensity = 3 + Math.sin(t * 1.3 + 1) * 0.8;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      timer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden cursor-pointer"
      style={{
        height: 280,
        background: '#0d1117',
        border: isHovered ? '1px solid #3b82f6' : '1px solid #30363d',
        boxShadow: isHovered ? '0 0 20px rgba(59,130,246,0.15)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setClickCount(p => p + 1)}
      title="Interactive 3D vault — move mouse to rotate"
    >
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Subtle radial fade */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 65% 55% at 50% 50%, transparent 35%, rgba(13,17,23,0.55) 100%)' }} />

      {/* Status — top left */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-live" />
        <span className="text-[9px] font-semibold uppercase tracking-wider data-mono" style={{ color: '#22c55e' }}>
          AICTE Lien Vault · Active
        </span>
      </div>

      {/* Security badge — top right */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <span className="badge-blue text-[9px] font-semibold px-1.5 py-0.5 rounded">
          🔐 Joint Lien
        </span>
      </div>

      {/* Financials — bottom left */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: '#484f58' }}>
          Secured Capital Under Lien
        </p>
        <p className="text-xl font-bold data-mono" style={{ color: '#e6edf3' }}>
          {totalAmount}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: '#8b949e' }}>
          across <strong style={{ color: '#e6edf3' }}>{instrumentsCount}</strong> verified instruments
        </p>
      </div>

      {/* Hint — bottom right */}
      <div className="absolute bottom-3 right-3 z-10 text-right pointer-events-none">
        <p className="text-[9px] data-mono" style={{ color: '#60a5fa' }}>
          {isHovered ? 'Drag to rotate' : '3D Interactive'}
        </p>
        {clickCount > 0 && (
          <p className="text-[9px] mt-0.5 data-mono" style={{ color: '#484f58' }}>
            Inspected ×{clickCount}
          </p>
        )}
      </div>
    </div>
  );
};
