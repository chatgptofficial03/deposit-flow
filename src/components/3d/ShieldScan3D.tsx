'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ShieldScan3DProps {
  scanProgress?: number; // 0-100
  verifiedCount?: number;
  pendingCount?: number;
}

/**
 * ShieldScan3D — A 3D animated security shield with scanning laser beam,
 * orbiting security rings, pulsing core, and holographic HUD.
 * Used as the hero visual for the Verification Workspace view.
 */
export const ShieldScan3D: React.FC<ShieldScan3DProps> = ({
  scanProgress = 72,
  verifiedCount = 4,
  pendingCount = 2,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth || 500;
    const H = container.clientHeight || 200;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040510, 0.035);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Master group ──
    const group = new THREE.Group();
    scene.add(group);

    // ── Shield outer hexagon shape (approximated with icosahedron) ──
    const shieldGeo = new THREE.IcosahedronGeometry(2.5, 1);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x3730a3,
      metalness: 0.95,
      roughness: 0.2,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.6,
      wireframe: false,
      transparent: true,
      opacity: 0.5,
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    group.add(shield);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.15 });
    group.add(new THREE.Mesh(shieldGeo.clone(), wireMat));

    // ── Outer scanning rings ──
    const rings: { mesh: THREE.Mesh; speed: number; axis: 'x' | 'y' | 'z' }[] = [];
    const ringConfigs = [
      { r: 3.0, tube: 0.025, color: 0x6366f1, speed: 0.5, axis: 'y' as const },
      { r: 2.7, tube: 0.02, color: 0x06b6d4, speed: -0.8, axis: 'x' as const },
      { r: 3.3, tube: 0.018, color: 0xf59e0b, speed: 0.35, axis: 'z' as const },
    ];
    ringConfigs.forEach(({ r, tube, color, speed, axis }) => {
      const geo = new THREE.TorusGeometry(r, tube, 16, 120);
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, metalness: 0.7, roughness: 0.1 });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      rings.push({ mesh, speed, axis });
    });

    // ── Central glowing core ──
    const coreGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x4f46e5,
      emissiveIntensity: 1.2,
      metalness: 0.6,
      roughness: 0.1,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // ── Scan beam (rotating plane) ──
    const beamGeo = new THREE.PlaneGeometry(6, 0.06);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    group.add(beam);

    // ── Orbiting security dots ──
    const dots: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; yOffset: number }[] = [];
    const dotColors = [0x22d3ee, 0x6366f1, 0xfbbf24, 0x10b981, 0xf43f5e, 0xa78bfa];
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.SphereGeometry(0.1, 12, 12);
      const mat = new THREE.MeshStandardMaterial({ color: dotColors[i % dotColors.length], emissive: dotColors[i % dotColors.length], emissiveIntensity: 1, roughness: 0.1 });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      dots.push({ mesh, angle: (i / 8) * Math.PI * 2, radius: 4 + (i % 3) * 0.5, speed: 0.3 + i * 0.05, yOffset: Math.sin(i * 0.9) * 1.5 });
    }

    // ── Particle field ──
    const pCount = 150;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 16;
      pPos[i + 1] = (Math.random() - 0.5) * 10;
      pPos[i + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.05, color: 0x6366f1, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })));

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const violetLight = new THREE.PointLight(0x6366f1, 6, 20);
    violetLight.position.set(0, 0, 8);
    scene.add(violetLight);
    const cyanLight = new THREE.PointLight(0x06b6d4, 4, 15);
    cyanLight.position.set(5, 3, 4);
    scene.add(cyanLight);

    // ── Mouse parallax ──
    let mx = 0, my = 0;
    const onMouse = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    };
    window.addEventListener('mousemove', onMouse);

    const timer = new THREE.Timer();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();

      // Shield subtle breathe
      const breathe = 1 + Math.sin(t * 1.2) * 0.04;
      shield.scale.setScalar(breathe);
      shieldMat.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.3;

      // Rings spin
      rings.forEach(({ mesh, speed, axis }) => {
        mesh.rotation[axis] += speed * 0.012;
      });

      // Scan beam rotate
      beam.rotation.z = t * 1.5;
      beamMat.opacity = 0.4 + Math.sin(t * 3) * 0.35;

      // Core pulse
      const cp = 1 + Math.sin(t * 3) * 0.08;
      core.scale.setScalar(cp);
      coreMat.emissiveIntensity = 1 + Math.sin(t * 3) * 0.5;

      // Orbiting dots
      dots.forEach((d) => {
        d.angle += d.speed * 0.012;
        d.mesh.position.set(
          Math.cos(d.angle) * d.radius,
          d.yOffset + Math.sin(t * 0.4 + d.angle) * 0.5,
          Math.sin(d.angle) * d.radius * 0.5
        );
        const s = 0.7 + Math.sin(t * 2 + d.angle) * 0.4;
        d.mesh.scale.setScalar(s);
      });

      // Group parallax tilt
      group.rotation.y += (mx * 0.6 - group.rotation.y) * 0.06;
      group.rotation.x += (-my * 0.4 - group.rotation.x) * 0.06;
      group.position.y = Math.sin(t * 0.5) * 0.15;

      violetLight.intensity = 5 + Math.sin(t * 2) * 2;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = container.clientWidth, nh = container.clientHeight;
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      timer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="relative w-full h-[160px] rounded-lg overflow-hidden scene-container"
      style={{
        border: hovered ? '1px solid #3b82f6' : '1px solid #30363d',
        boxShadow: hovered ? '0 0 20px rgba(59,130,246,0.12)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={mountRef} className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 90% at 50% 50%, transparent 35%, rgba(13,17,23,0.6) 100%)' }} />

      <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 status-live" />
        <span className="text-[9px] data-mono uppercase tracking-wider" style={{ color: '#60a5fa' }}>Verification &amp; Scrutiny Engine · Active</span>
      </div>

      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[8px] uppercase tracking-wider" style={{ color: '#484f58' }}>Verified</p>
            <p className="text-lg font-bold data-mono leading-none" style={{ color: '#22c55e' }}>{verifiedCount}</p>
          </div>
          <div className="w-px h-8" style={{ background: '#30363d' }} />
          <div>
            <p className="text-[8px] uppercase tracking-wider" style={{ color: '#484f58' }}>Pending</p>
            <p className="text-lg font-bold data-mono leading-none" style={{ color: '#fbbf24' }}>{pendingCount}</p>
          </div>
          <div className="w-px h-8" style={{ background: '#30363d' }} />
          <div>
            <p className="text-[8px] uppercase tracking-wider" style={{ color: '#484f58' }}>Verified %</p>
            <p className="text-lg font-bold data-mono leading-none" style={{ color: '#60a5fa' }}>{scanProgress}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
