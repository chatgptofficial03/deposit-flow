'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface MaturityTimeline3DProps {
  urgentCount?: number;
  expiring30?: number;
  activeCount?: number;
}

/**
 * MaturityTimeline3D — A 3D animated timeline tunnel with floating date markers,
 * glowing countdown orbs, and a pulsing "NOW" cursor.
 * Used as the hero visual for the Maturity Monitor view.
 */
export const MaturityTimeline3D: React.FC<MaturityTimeline3DProps> = ({
  urgentCount = 2,
  expiring30 = 3,
  activeCount = 6,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth || 600;
    const H = container.clientHeight || 200;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x040510, 15, 35);

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.set(0, 0.5, 8);
    camera.lookAt(0, 0, -10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Timeline rail (two parallel tubes going into the distance) ──
    const railMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3, emissive: 0x0f172a, emissiveIntensity: 0.5 });
    for (let side of [-0.5, 0.5]) {
      const points = [];
      for (let z = 8; z > -30; z -= 2) {
        points.push(new THREE.Vector3(side * 2.5, 0, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(curve, 40, 0.04, 8, false);
      scene.add(new THREE.Mesh(geo, railMat));
    }

    // ── Milestone orbs floating above the timeline ──
    const milestones: { mesh: THREE.Mesh; light: THREE.PointLight; z: number; phase: number }[] = [];
    const milestoneData = [
      { z: 0, color: 0xf43f5e, label: 'NOW — Matured', size: 0.35 },
      { z: -4, color: 0xfbbf24, label: '7 Days', size: 0.28 },
      { z: -8, color: 0xf59e0b, label: '15 Days', size: 0.26 },
      { z: -13, color: 0x06b6d4, label: '30 Days', size: 0.22 },
      { z: -18, color: 0x10b981, label: '60 Days', size: 0.20 },
      { z: -24, color: 0x6366f1, label: '90 Days', size: 0.18 },
    ];

    milestoneData.forEach(({ z, color, size }, i) => {
      const geo = new THREE.SphereGeometry(size, 24, 24);
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2, metalness: 0.5, roughness: 0.1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0.3, z);
      scene.add(mesh);

      // Glow halo ring
      const haloGeo = new THREE.TorusGeometry(size * 2.2, 0.02, 8, 48);
      const haloMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(mesh.position);
      scene.add(halo);

      // Point light
      const light = new THREE.PointLight(color, 2.5, 8);
      light.position.copy(mesh.position);
      scene.add(light);

      milestones.push({ mesh, light, z, phase: i * 0.9 });
    });

    // ── Connector line (central timeline axis) ──
    const axisPts = [new THREE.Vector3(0, 0, 8), new THREE.Vector3(0, 0, -28)];
    const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPts);
    scene.add(new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.5 })));

    // ── "NOW" cursor plane ──
    const nowGeo = new THREE.PlaneGeometry(5, 0.04);
    const nowMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const nowLine = new THREE.Mesh(nowGeo, nowMat);
    nowLine.position.set(0, 0, 0.1);
    scene.add(nowLine);

    // ── Floating data particles ──
    const fpCount = 80;
    const fpGeo = new THREE.BufferGeometry();
    const fpPos = new Float32Array(fpCount * 3);
    for (let i = 0; i < fpCount * 3; i += 3) {
      fpPos[i] = (Math.random() - 0.5) * 8;
      fpPos[i + 1] = (Math.random() - 0.5) * 3;
      fpPos[i + 2] = Math.random() * -28;
    }
    fpGeo.setAttribute('position', new THREE.BufferAttribute(fpPos, 3));
    scene.add(new THREE.Points(fpGeo, new THREE.PointsMaterial({ size: 0.05, color: 0x38bdf8, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending })));

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const mainLight = new THREE.DirectionalLight(0xfef3c7, 1.5);
    mainLight.position.set(3, 5, 5);
    scene.add(mainLight);

    // ── Mouse ──
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

      // Scroll camera forward (time-travel effect)
      camera.position.z = 8 - (t * 0.3) % 8;

      // Milestones pulse
      milestones.forEach(({ mesh, light, phase }) => {
        const s = 1 + Math.sin(t * 2 + phase) * 0.2;
        mesh.scale.setScalar(s);
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.8 + Math.sin(t * 3 + phase) * 0.6;
        light.intensity = 2 + Math.sin(t * 2.5 + phase) * 1.2;
      });

      // NOW line flicker
      nowMat.opacity = 0.5 + Math.sin(t * 6) * 0.35;

      // Camera subtle tilt from mouse
      camera.rotation.y += (mx * -0.15 - camera.rotation.y) * 0.05;
      camera.rotation.x += (my * 0.08 - camera.rotation.x) * 0.05;

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
        border: hovered ? '1px solid #d97706' : '1px solid #30363d',
        boxShadow: hovered ? '0 0 20px rgba(217,119,6,0.12)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={mountRef} className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 90% 100% at 50% 50%, transparent 30%, rgba(13,17,23,0.65) 100%)' }} />

      <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full status-live" style={{ background: '#f59e0b' }} />
        <span className="text-[9px] data-mono uppercase tracking-wider" style={{ color: '#fbbf24' }}>Maturity Timeline · Real-time</span>
      </div>
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none flex items-center gap-3">
        <div>
          <p className="text-[8px] uppercase tracking-wider" style={{ color: '#484f58' }}>Urgent ≤7d</p>
          <p className="text-lg font-bold data-mono leading-none" style={{ color: '#f87171' }}>{urgentCount}</p>
        </div>
        <div className="w-px h-8" style={{ background: '#30363d' }} />
        <div>
          <p className="text-[8px] uppercase tracking-wider" style={{ color: '#484f58' }}>Expiring ≤30d</p>
          <p className="text-lg font-bold data-mono leading-none" style={{ color: '#fbbf24' }}>{expiring30}</p>
        </div>
        <div className="w-px h-8" style={{ background: '#30363d' }} />
        <div>
          <p className="text-[8px] uppercase tracking-wider" style={{ color: '#484f58' }}>Active</p>
          <p className="text-lg font-bold data-mono leading-none" style={{ color: '#22c55e' }}>{activeCount}</p>
        </div>
      </div>
    </div>
  );
};
