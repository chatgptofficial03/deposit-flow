'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface NetworkGraph3DProps {
  nodeCount?: number;
  label?: string;
  sublabel?: string;
  accentColor?: number;
}

/**
 * NetworkGraph3D — An animated 3D network graph showing interconnected nodes
 * with glowing edges, pulsing data flow, and mouse parallax.
 * Used as a header visual for the FDR Registry view.
 */
export const NetworkGraph3D: React.FC<NetworkGraph3DProps> = ({
  nodeCount = 18,
  label = 'FDR Instrument Network',
  sublabel = 'All registered deposit instruments across scheduled banks',
  accentColor = 0x06b6d4,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth || 600;
    const H = container.clientHeight || 200;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07080f, 0.04);

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Create nodes ──
    const nodes: THREE.Mesh[] = [];
    const nodePositions: THREE.Vector3[] = [];
    const nodeColors = [accentColor, 0x6366f1, 0x10b981, 0xf59e0b, 0xf43f5e, 0x8b5cf6];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const r = 5 + Math.random() * 2.5;

      const pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.6,
        r * Math.cos(phi) * 0.5
      );
      nodePositions.push(pos);

      const size = 0.12 + Math.random() * 0.2;
      const geo = new THREE.SphereGeometry(size, 16, 16);
      const color = nodeColors[i % nodeColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
        metalness: 0.5,
        roughness: 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      scene.add(mesh);
      nodes.push(mesh);
    }

    // ── Edges (connecting lines between nearby nodes) ──
    const edgeGroup = new THREE.Group();
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist < 5.5) {
          const points = [nodePositions[i], nodePositions[j]];
          const geo = new THREE.BufferGeometry().setFromPoints(points);
          const mat = new THREE.LineBasicMaterial({
            color: accentColor,
            transparent: true,
            opacity: 0.12 + Math.random() * 0.12,
          });
          edgeGroup.add(new THREE.Line(geo, mat));
        }
      }
    }
    scene.add(edgeGroup);

    // ── Data flow particles along edges ──
    const flowParticles: { mesh: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; t: number; speed: number }[] = [];
    for (let i = 0; i < 20; i++) {
      const fromIdx = Math.floor(Math.random() * nodeCount);
      const toIdx = Math.floor(Math.random() * nodeCount);
      if (fromIdx === toIdx) continue;

      const geo = new THREE.SphereGeometry(0.07, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      flowParticles.push({
        mesh,
        from: nodePositions[fromIdx].clone(),
        to: nodePositions[toIdx].clone(),
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.006,
      });
    }

    // ── Background star field ──
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(300 * 3);
    for (let i = 0; i < 300 * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 40;
      starPos[i + 1] = (Math.random() - 0.5) * 20;
      starPos[i + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.04, color: 0x818cf8, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending })));

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const p1 = new THREE.PointLight(accentColor, 5, 25);
    p1.position.set(0, 5, 8);
    scene.add(p1);
    const p2 = new THREE.PointLight(0x6366f1, 4, 20);
    p2.position.set(-6, -3, 5);
    scene.add(p2);

    // ── Mouse parallax ──
    let mx = 0, my = 0;
    const onMouse = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    };
    window.addEventListener('mousemove', onMouse);

    // ── Animation using Timer ──
    const timer = new THREE.Timer();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();

      // Rotate entire network
      edgeGroup.rotation.y = t * 0.08 + mx * 0.4;
      edgeGroup.rotation.x = -my * 0.3 + Math.sin(t * 0.15) * 0.1;

      // Pulse nodes
      nodes.forEach((node, i) => {
        const s = 1 + Math.sin(t * 1.5 + i * 0.8) * 0.25;
        node.scale.setScalar(s);
        node.rotation.y = t * 0.3 + i;
        const mat = node.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.5 + Math.sin(t * 2 + i) * 0.4;

        // Sync node positions with edge group rotation
        node.position.copy(nodePositions[i]);
        node.position.applyEuler(new THREE.Euler(
          -my * 0.3 + Math.sin(t * 0.15) * 0.1,
          t * 0.08 + mx * 0.4,
          0
        ));
      });

      // Flow particles
      flowParticles.forEach((fp) => {
        fp.t += fp.speed;
        if (fp.t > 1) fp.t = 0;
        fp.mesh.position.lerpVectors(fp.from, fp.to, fp.t);
        fp.mesh.position.applyEuler(new THREE.Euler(
          -my * 0.3 + Math.sin(t * 0.15) * 0.1,
          t * 0.08 + mx * 0.4,
          0
        ));
        const mat = fp.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.sin(fp.t * Math.PI) * 0.9;
      });

      // Pulse point light
      p1.intensity = 4 + Math.sin(t * 2.5) * 1.5;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
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
  }, [accentColor, nodeCount]);

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
        style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(13,17,23,0.65) 100%)' }} />

      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <p className="text-[9px] uppercase tracking-wider data-mono" style={{ color: '#484f58' }}>{sublabel}</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: '#e6edf3' }}>{label}</p>
      </div>
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 status-live" />
        <span className="text-[9px] data-mono uppercase tracking-wider" style={{ color: '#60a5fa' }}>Live Network · {nodeCount} Nodes</span>
      </div>
    </div>
  );
};
