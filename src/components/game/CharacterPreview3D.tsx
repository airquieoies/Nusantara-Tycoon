import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { CharacterAppearance } from '../../game/stage1Data';
import { FacialExpression } from '../../game/threeCharacterRig';
import { createPlayerRig, PlayerRig } from '../../game/threeWorldBuilder';

export type PreviewCameraPreset = 'full' | 'face' | 'side';

interface CharacterPreview3DProps {
  appearance: CharacterAppearance;
  expression: FacialExpression;
}

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(renderer);
  } catch {
    return false;
  }
}

function afterDraw(gl: WebGLRenderingContext | WebGL2RenderingContext, cb: () => void) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (sync) {
      gl.flush();
      const start = performance.now();
      const poll = () => {
        const res = gl.clientWaitSync(sync, 0, 0);
        if (res !== gl.TIMEOUT_EXPIRED || performance.now() - start > 80) {
          gl.deleteSync(sync);
          window.setTimeout(() => requestAnimationFrame(cb), 24);
          return;
        }
        window.setTimeout(poll, 10);
      };
      window.setTimeout(poll, 10);
      return;
    }
  }
  window.setTimeout(() => requestAnimationFrame(cb), 24);
}

const PRESET_CONFIG: Record<PreviewCameraPreset, { dist: number; targetY: number; pitch: number; yaw?: number }> = {
  full: { dist: 3.65, targetY: 1.06, pitch: 0.12, yaw: 0.22 },
  face: { dist: 1.42, targetY: 1.72, pitch: 0.06, yaw: 0.12 },
  side: { dist: 3.45, targetY: 1.06, pitch: 0.12, yaw: Math.PI * 0.45 },
};

export const CharacterPreview3D: React.FC<CharacterPreview3DProps> = ({
  appearance,
  expression,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rigRef = useRef<PlayerRig | null>(null);
  const camStateRef = useRef({
    yaw: 0.22,
    pitch: 0.12,
    distance: 3.65,
    targetY: 1.06,
  });
  const appearanceRef = useRef(appearance);
  appearanceRef.current = appearance;
  const expressionRef = useRef(expression);
  expressionRef.current = expression;

  const [preset, setPreset] = useState<PreviewCameraPreset>('full');
  const [hudYaw, setHudYaw] = useState(0.22);
  const [hudZoom, setHudZoom] = useState(3.65);

  useEffect(() => {
    if (rigRef.current) {
      rigRef.current.applyAppearance(appearance);
    }
  }, [appearance]);

  useEffect(() => {
    if (rigRef.current) {
      rigRef.current.setExpression(expression);
    }
  }, [expression]);

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;

    const isSoftwareGl = detectSoftwareGl();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    const width = mountEl.clientWidth || 340;
    const height = mountEl.clientHeight || 360;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();

    const hemi = new THREE.HemisphereLight(0xfef3c7, 0x1e293b, 0.9);
    scene.add(hemi);
    const keyLight = new THREE.DirectionalLight(0xfff1d6, 2.0);
    keyLight.position.set(2.8, 4.2, 3.6);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    rimLight.position.set(-3.0, 2.6, -2.5);
    scene.add(rimLight);

    // Warm studio pedestal turntable
    const pedGeo = new THREE.CylinderGeometry(0.92, 1.02, 0.14, 28);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.35,
    });
    const pedRingGeo = new THREE.RingGeometry(0.84, 0.91, 28);
    const pedRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -0.07;
    const pedRing = new THREE.Mesh(pedRingGeo, pedRingMat);
    pedRing.rotation.x = -Math.PI / 2;
    pedRing.position.y = 0.004;
    scene.add(pedestal, pedRing);

    const rig = createPlayerRig(appearanceRef.current);
    rig.setExpression(expressionRef.current);
    scene.add(rig.root);
    rigRef.current = rig;

    const camera = new THREE.PerspectiveCamera(38, width / Math.max(1, height), 0.1, 40);

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      camStateRef.current.yaw += dx * 0.012;
      camStateRef.current.pitch = Math.max(
        -0.18,
        Math.min(0.65, camStateRef.current.pitch + dy * 0.008)
      );
      setHudYaw(Number(camStateRef.current.yaw.toFixed(2)));
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camStateRef.current.distance = Math.max(
        1.35,
        Math.min(4.4, camStateRef.current.distance + e.deltaY * 0.0025)
      );
      setHudZoom(Number(camStateRef.current.distance.toFixed(2)));
    };
    const onResize = () => {
      const w = mountEl.clientWidth || 340;
      const h = mountEl.clientHeight || 360;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    const ro = new ResizeObserver(onResize);
    ro.observe(mountEl);

    let disposed = false;
    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      rig.setAnimationState({
        walkCycle: 0,
        speed: 0,
        grounded: true,
        ridingKind: null,
        elapsed,
        expression: expressionRef.current,
      });

      const cs = camStateRef.current;
      const cx = Math.sin(cs.yaw) * Math.cos(cs.pitch) * cs.distance;
      const cy = cs.targetY + Math.sin(cs.pitch) * cs.distance;
      const cz = Math.cos(cs.yaw) * Math.cos(cs.pitch) * cs.distance;
      camera.position.set(cx, cy, cz);
      camera.lookAt(0, cs.targetY, 0);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(renderer.getContext(), () => {
          if (!disposed) tick(performance.now());
        });
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      afterDraw(renderer.getContext(), () => {
        if (!disposed) tick(performance.now());
      });
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      rig.dispose();
      rigRef.current = null;
      pedGeo.dispose();
      pedMat.dispose();
      pedRingGeo.dispose();
      pedRingMat.dispose();
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (canvas.parentElement === mountEl) {
        mountEl.removeChild(canvas);
      }
    };
  }, []);

  const applyPreset = (p: PreviewCameraPreset) => {
    const cfg = PRESET_CONFIG[p];
    camStateRef.current.distance = cfg.dist;
    camStateRef.current.targetY = cfg.targetY;
    camStateRef.current.pitch = cfg.pitch;
    if (cfg.yaw !== undefined) {
      camStateRef.current.yaw = cfg.yaw;
      setHudYaw(Number(cfg.yaw.toFixed(2)));
    }
    setPreset(p);
    setHudZoom(Number(cfg.dist.toFixed(2)));
  };

  const rotateBy = (delta: number) => {
    camStateRef.current.yaw += delta;
    setHudYaw(Number(camStateRef.current.yaw.toFixed(2)));
  };

  const zoomBy = (delta: number) => {
    camStateRef.current.distance = Math.max(
      1.35,
      Math.min(4.4, camStateRef.current.distance + delta)
    );
    setHudZoom(Number(camStateRef.current.distance.toFixed(2)));
  };

  return (
    <div
      className="flex flex-col gap-2"
      data-testid="character-preview-3d"
      data-yaw={hudYaw}
      data-zoom={hudZoom}
      data-preset={preset}
      data-expression={expression}
    >
      <div className="relative h-[300px] w-full overflow-hidden rounded-2xl border border-amber-500/35 bg-slate-950 shadow-inner">
        <div
          ref={mountRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          title="Seret mouse untuk memutar karakter 360°"
        />
        <div className="pointer-events-none absolute top-2.5 left-2.5 rounded-lg bg-slate-950/85 px-2.5 py-1 text-[10px] font-semibold text-amber-300">
          Seret 360° untuk melihat detail
        </div>
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1">
          <button
            type="button"
            data-testid="preview-rotate-left-btn"
            onClick={() => rotateBy(-0.55)}
            aria-label="Putar Kiri"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/95 text-slate-200 hover:border-amber-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            data-testid="preview-rotate-right-btn"
            onClick={() => rotateBy(0.55)}
            aria-label="Putar Kanan"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/95 text-slate-200 hover:border-amber-400"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            data-testid="preview-zoom-in-btn"
            onClick={() => zoomBy(-0.35)}
            aria-label="Perbesar"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/95 text-slate-200 hover:border-amber-400"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            data-testid="preview-zoom-out-btn"
            onClick={() => zoomBy(0.35)}
            aria-label="Perkecil"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/95 text-slate-200 hover:border-amber-400"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Camera Presets */}
      <div className="grid grid-cols-3 gap-1.5">
        {(
          [
            { id: 'full', label: 'Seluruh Badan' },
            { id: 'face', label: 'Close-Up Wajah' },
            { id: 'side', label: 'Tampak Samping' },
          ] as { id: PreviewCameraPreset; label: string }[]
        ).map((p) => (
          <button
            key={p.id}
            type="button"
            data-testid={`preview-preset-${p.id}`}
            onClick={() => applyPreset(p.id)}
            className={`rounded-lg border py-1.5 text-[11px] font-bold transition-colors ${
              preset === p.id
                ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
