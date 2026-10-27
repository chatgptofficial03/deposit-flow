'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * AmbientOrb3D — A subtle floating 3D particle field rendered behind the dashboard.
 * Provides ambient depth without distracting from content.
 */
export const AmbientOrb3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // ── Floating orbs (large glow spheres) ──
    const orbData: { mesh: THREE.Mesh; vx: number; vy: number; phase: number }[] = [];
    const orbColors = [0x6366f1, 0x06b6d4, 0xf59e0b, 0x10b981, 0x8b5cf6];
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.SphereGeometry(0.35 + Math.random() * 0.5, 24, 24);
      const mat = new THREE.MeshBasicMaterial({
        color: orbColors[i % orbColors.length],
        transparent: true,
        opacity: 0.06 + Math.random() * 0.05
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 3
      );
      scene.add(mesh);
      orbData.push({ mesh, vx: (Math.random() - 0.5) * 0.003, vy: (Math.random() - 0.5) * 0.003, phase: Math.random() * Math.PI * 2 });
    }

    // ── Particle stars ──
    const starCount = 200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 20;
      starPos[i + 1] = (Math.random() - 0.5) * 12;
      starPos[i + 2] = (Math.random() - 0.5) * 5;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.04, color: 0x818cf8, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
    scene.add(new THREE.Points(starGeo, starMat));

    let animId: number;
    const timer = new THREE.Timer();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();

      orbData.forEach(({ mesh, vx, vy, phase }, i) => {
        mesh.position.x += vx;
        mesh.position.y += vy + Math.sin(t * 0.3 + phase) * 0.004;

        // Wrap around
        if (Math.abs(mesh.position.x) > 9) (mesh as any).vx = -(vx);
        if (Math.abs(mesh.position.y) > 5) (mesh as any).vy = -(vy);

        // Slow pulse
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.04 + Math.sin(t * 0.5 + phase) * 0.025;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      timer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
