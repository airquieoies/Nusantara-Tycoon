import React, { useEffect, useRef } from 'react';
import { BUILDING_CATALOG } from '../game/data/bermainData';
import { GRID_SIZE } from '../game/rules';
import { BuildingDefinition, CityTile, StageNumber } from '../game/types';

interface IsometricCityCanvasProps {
  stage: StageNumber;
  grid: CityTile[][];
  selectedBuildingId: string | null;
  onTileClick: (row: number, col: number) => void;
  onTileHover: (tile: CityTile | null, building: BuildingDefinition | null) => void;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const PARTICLE_POOL_SIZE = 72;

export const IsometricCityCanvas: React.FC<IsometricCityCanvasProps> = ({
  stage,
  grid,
  selectedBuildingId,
  onTileClick,
  onTileHover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const propsRef = useRef({
    stage,
    grid,
    selectedBuildingId,
    onTileClick,
    onTileHover,
  });
  propsRef.current = { stage, grid, selectedBuildingId, onTileClick, onTileHover };

  const hoverRef = useRef<{ row: number; col: number } | null>(null);
  const lastBuiltCountRef = useRef<number>(0);

  // Pre-allocated particle ring buffer (Zero-GC inside rAF)
  const particlesRef = useRef<Particle[]>(
    Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      color: '#FBBF24',
      size: 3,
    }))
  );
  const particleCursorRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = container.clientWidth || 720;
    let height = container.clientHeight || 480;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(320, rect.width);
      height = Math.max(340, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    const getMetrics = () => {
      const tileW = Math.min(width / (GRID_SIZE + 1.8), height / (GRID_SIZE * 0.65 + 2.2), 92);
      const tileH = tileW * 0.52;
      const originX = width * 0.5;
      const originY = height * 0.24;
      return { tileW, tileH, originX, originY };
    };

    const gridToScreen = (row: number, col: number) => {
      const { tileW, tileH, originX, originY } = getMetrics();
      const x = originX + (col - row) * (tileW * 0.5);
      const y = originY + (col + row) * (tileH * 0.5);
      return { x, y, tileW, tileH };
    };

    const screenToGrid = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const { tileW, tileH, originX, originY } = getMetrics();

      const dx = px - originX;
      const dy = py - originY;
      const halfW = tileW * 0.5;
      const halfH = tileH * 0.5;

      const col = Math.floor((dx / halfW + dy / halfH) * 0.5);
      const row = Math.floor((dy / halfH - dx / halfW) * 0.5);

      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        return { row, col };
      }
      return null;
    };

    const spawnBurst = (sx: number, sy: number, color: string) => {
      const pool = particlesRef.current;
      for (let i = 0; i < 14; i++) {
        const idx = particleCursorRef.current % PARTICLE_POOL_SIZE;
        particleCursorRef.current += 1;
        const angle = (Math.PI * 2 * i) / 14;
        const speed = 0.6 + (i % 4) * 0.45;
        pool[idx].active = true;
        pool[idx].x = sx;
        pool[idx].y = sy - 8;
        pool[idx].vx = Math.cos(angle) * speed * 1.3;
        pool[idx].vy = Math.sin(angle) * speed * 0.7 - 1.3;
        pool[idx].life = 0;
        pool[idx].maxLife = 0.65 + (i % 3) * 0.15;
        pool[idx].color = color;
        pool[idx].size = 2.5 + (i % 3);
      }
    };

    const drawDiamond = (
      cx: number,
      cy: number,
      w: number,
      h: number,
      fill: string,
      stroke: string,
      lineWidth = 1
    ) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + w * 0.5, cy + h * 0.5);
      ctx.lineTo(cx, cy + h);
      ctx.lineTo(cx - w * 0.5, cy + h * 0.5);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    };

    const drawIsoBox = (
      cx: number,
      cy: number,
      w: number,
      h: number,
      boxHeight: number,
      topColor: string,
      leftColor: string,
      rightColor: string
    ) => {
      const hw = w * 0.36;
      const hh = h * 0.36;
      const baseY = cy + h * 0.5;

      // Left face
      ctx.beginPath();
      ctx.moveTo(cx - hw, baseY);
      ctx.lineTo(cx, baseY + hh);
      ctx.lineTo(cx, baseY + hh - boxHeight);
      ctx.lineTo(cx - hw, baseY - boxHeight);
      ctx.closePath();
      ctx.fillStyle = leftColor;
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Right face
      ctx.beginPath();
      ctx.moveTo(cx, baseY + hh);
      ctx.lineTo(cx + hw, baseY);
      ctx.lineTo(cx + hw, baseY - boxHeight);
      ctx.lineTo(cx, baseY + hh - boxHeight);
      ctx.closePath();
      ctx.fillStyle = rightColor;
      ctx.fill();
      ctx.stroke();

      // Top face
      ctx.beginPath();
      ctx.moveTo(cx, baseY - hh - boxHeight);
      ctx.lineTo(cx + hw, baseY - boxHeight);
      ctx.lineTo(cx, baseY + hh - boxHeight);
      ctx.lineTo(cx - hw, baseY - boxHeight);
      ctx.closePath();
      ctx.fillStyle = topColor;
      ctx.fill();
      ctx.stroke();
    };

    const drawBuilding = (
      b: BuildingDefinition,
      cx: number,
      cy: number,
      tileW: number,
      tileH: number,
      timeSec: number,
      currentStage: StageNumber
    ) => {
      const scaleH = tileW * (0.24 + b.heightLevel * 0.16);

      if (b.id === 'hutan-kota' || b.id === 'taman-kota') {
        // Lush green canopy cluster
        const trees = [
          { dx: -tileW * 0.14, dy: tileH * 0.45, r: tileW * 0.13, col: '#15803D' },
          { dx: tileW * 0.12, dy: tileH * 0.48, r: tileW * 0.12, col: '#16A34A' },
          { dx: 0, dy: tileH * 0.35, r: tileW * 0.16, col: '#22C55E' },
        ];
        trees.forEach((t) => {
          ctx.fillStyle = '#78350F';
          ctx.fillRect(cx + t.dx - 2, cy + t.dy - 4, 4, 9);
          ctx.beginPath();
          ctx.arc(cx + t.dx, cy + t.dy - t.r * 0.55, t.r, 0, Math.PI * 2);
          ctx.fillStyle = t.col;
          ctx.fill();
        });
        return;
      }

      if (b.id === 'pelabuhan-nusantara') {
        // Wooden pier + traditional Nusantara sailboat
        drawIsoBox(cx, cy + 4, tileW * 0.9, tileH * 0.9, tileW * 0.14, '#B45309', '#78350F', '#92400E');
        const bob = Math.sin(timeSec * 2.2) * 2;
        ctx.save();
        ctx.translate(cx + tileW * 0.1, cy + tileH * 0.36 + bob);
        // Sailboat hull
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(14, 0);
        ctx.lineTo(9, 7);
        ctx.lineTo(-10, 7);
        ctx.closePath();
        ctx.fillStyle = '#7C2D12';
        ctx.fill();
        // Sail
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -22);
        ctx.lineTo(14, -7);
        ctx.closePath();
        ctx.fillStyle = '#FEF3C7';
        ctx.fill();
        ctx.restore();
        return;
      }

      // Standard extruded 2.5D building
      drawIsoBox(
        cx,
        cy,
        tileW,
        tileH,
        scaleH,
        b.colorRoof,
        b.colorPrimary,
        '#1E293B'
      );

      // Windows on taller buildings
      if (b.heightLevel >= 2) {
        ctx.fillStyle = currentStage === 3 ? '#BAE6FD' : '#FDE68A';
        const rows = b.heightLevel;
        for (let r = 0; r < rows; r++) {
          const wy = cy + tileH * 0.5 - scaleH + 8 + r * 11;
          ctx.fillRect(cx - tileW * 0.2, wy, 4, 5);
          ctx.fillRect(cx - tileW * 0.1, wy + 2, 4, 5);
        }
      }

      // Traditional Nusantara Joglo peak for cultural/market buildings
      if (b.category === 'budaya' || b.id === 'pasar-tradisional') {
        ctx.beginPath();
        ctx.moveTo(cx, cy + tileH * 0.5 - scaleH - tileW * 0.22);
        ctx.lineTo(cx + tileW * 0.28, cy + tileH * 0.5 - scaleH);
        ctx.lineTo(cx - tileW * 0.28, cy + tileH * 0.5 - scaleH);
        ctx.closePath();
        ctx.fillStyle = b.colorRoof;
        ctx.fill();
      }

      // Smokestack + animated steam for factories
      if (b.id === 'pabrik-industri' || b.id === 'kawasan-industri') {
        const stackX = cx + tileW * 0.14;
        const stackY = cy + tileH * 0.32 - scaleH;
        ctx.fillStyle = '#475569';
        ctx.fillRect(stackX - 3, stackY - 16, 6, 16);
        const puffOffset = (timeSec * 14) % 16;
        ctx.beginPath();
        ctx.arc(stackX + puffOffset * 0.3, stackY - 20 - puffOffset, 4, 0, Math.PI * 2);
        ctx.fillStyle = b.id === 'kawasan-industri' ? 'rgba(167, 243, 208, 0.55)' : 'rgba(203, 213, 225, 0.55)';
        ctx.fill();
      }

      // Solar rooftop / beacon for Smart City & Tech
      if (b.id === 'gedung-smart-city' || b.id === 'pusat-teknologi') {
        const topY = cy + tileH * 0.5 - scaleH - tileH * 0.2;
        ctx.beginPath();
        ctx.arc(cx, topY - 4, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#34D399';
        ctx.fill();
      }
    };

    let prevTime = performance.now();
    let lastRenderTime = 0;

    const renderFrame = (now: number) => {
      animId = requestAnimationFrame(renderFrame);
      if (now - lastRenderTime < 32) return;
      lastRenderTime = now;

      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;
      const timeSec = now / 1000;

      const { stage: curStage, grid: curGrid, selectedBuildingId: selId } = propsRef.current;

      let builtCount = 0;
      for (const r of curGrid) {
        for (const c of r) {
          if (c.buildingId) builtCount += 1;
        }
      }
      if (builtCount > lastBuiltCountRef.current) {
        const lastTile = curGrid.flat().reduce<CityTile | null>(
          (best, t) => (t.buildingId && (!best || t.builtAtTick >= best.builtAtTick) ? t : best),
          null
        );
        if (lastTile) {
          const pos = gridToScreen(lastTile.row, lastTile.col);
          spawnBurst(pos.x, pos.y + pos.tileH * 0.3, '#FBBF24');
        }
      }
      lastBuiltCountRef.current = builtCount;

      ctx.clearRect(0, 0, width, height);

      const { tileW, tileH, originX, originY } = getMetrics();
      const mapSpanW = tileW * GRID_SIZE;
      const mapSpanH = tileH * GRID_SIZE;

      // Isometric island / city base plinth
      ctx.beginPath();
      ctx.moveTo(originX, originY - 10);
      ctx.lineTo(originX + mapSpanW * 0.5 + 22, originY + mapSpanH * 0.5);
      ctx.lineTo(originX, originY + mapSpanH + 14);
      ctx.lineTo(originX - mapSpanW * 0.5 - 22, originY + mapSpanH * 0.5);
      ctx.closePath();
      ctx.fillStyle = curStage === 1 ? 'rgba(30, 58, 47, 0.92)' : curStage === 2 ? 'rgba(30, 41, 59, 0.92)' : 'rgba(15, 61, 62, 0.92)';
      ctx.fill();
      ctx.strokeStyle =
        curStage === 1
          ? 'rgba(245, 158, 11, 0.45)'
          : curStage === 2
            ? 'rgba(234, 88, 12, 0.45)'
            : 'rgba(14, 165, 233, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Stage 3 offshore wind turbines in background horizon
      if (curStage === 3) {
        [0.14, 0.22, 0.82, 0.9].forEach((xr, i) => {
          const tx = width * xr;
          const ty = height * 0.24;
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tx, ty + 32);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          for (let b = 0; b < 3; b++) {
            const ang = timeSec * 1.8 + i + (b * Math.PI * 2) / 3;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + Math.cos(ang) * 14, ty + Math.sin(ang) * 14);
            ctx.stroke();
          }
        });
      }

      // Render Isometric Grid back-to-front
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const tile = curGrid[r][c];
          const { x, y } = gridToScreen(r, c);
          const isHovered = hoverRef.current?.row === r && hoverRef.current?.col === c;

          let fill = '#365314';
          let stroke = 'rgba(255, 255, 255, 0.14)';

          if (tile.terrain === 'land') {
            fill = curStage === 1 ? '#4D7C0F' : curStage === 2 ? '#475569' : '#15803D';
          } else if (tile.terrain === 'road') {
            fill = curStage === 1 ? '#785A3A' : '#334155';
          } else if (tile.terrain === 'water') {
            const shimmer = Math.sin(timeSec * 2 + r + c) * 8;
            fill = `rgb(14, ${116 + Math.round(shimmer)}, 144)`;
          } else if (tile.terrain === 'park_base') {
            fill = '#16A34A';
          }

          if (isHovered && selId) {
            fill = tile.terrain === 'road' ? '#991B1B' : '#0284C7';
            stroke = '#FDE047';
          }

          drawDiamond(x, y, tileW, tileH, fill, stroke, isHovered ? 2 : 1);

          if (tile.terrain === 'road') {
            ctx.beginPath();
            if (r === 3) {
              ctx.moveTo(x - tileW * 0.18, y + tileH * 0.32);
              ctx.lineTo(x + tileW * 0.18, y + tileH * 0.68);
            } else {
              ctx.moveTo(x + tileW * 0.18, y + tileH * 0.32);
              ctx.lineTo(x - tileW * 0.18, y + tileH * 0.68);
            }
            ctx.strokeStyle = curStage === 1 ? 'rgba(253, 230, 138, 0.45)' : 'rgba(248, 250, 252, 0.55)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          if (tile.buildingId) {
            const b = BUILDING_CATALOG.find((item) => item.id === tile.buildingId);
            if (b) {
              ctx.beginPath();
              ctx.ellipse(x, y + tileH * 0.56, tileW * 0.3, tileH * 0.28, 0, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(2, 6, 23, 0.36)';
              ctx.fill();
              drawBuilding(b, x, y, tileW, tileH, timeSec, curStage);
            }
          }
        }
      }

      // Animated moving vehicle / cart along road row 3
      const roadProgress = (timeSec * 0.55) % GRID_SIZE;
      const carRow = 3;
      const carCol = roadProgress;
      const carX = originX + (carCol - carRow) * (tileW * 0.5);
      const carY = originY + (carCol + carRow) * (tileH * 0.5) + tileH * 0.5;
      ctx.beginPath();
      ctx.ellipse(carX, carY, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = curStage === 1 ? '#FDE68A' : curStage === 2 ? '#FB923C' : '#38BDF8';
      ctx.fill();

      // Update and render pooled particles
      const pool = particlesRef.current;
      for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
        const p = pool[i];
        if (!p.active) continue;
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        const alpha = 1 - p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    animId = requestAnimationFrame(renderFrame);

    const handleMove = (e: PointerEvent) => {
      const coords = screenToGrid(e.clientX, e.clientY);
      hoverRef.current = coords;
      if (!coords) {
        propsRef.current.onTileHover(null, null);
        return;
      }
      const tile = propsRef.current.grid[coords.row]?.[coords.col] ?? null;
      const b = tile?.buildingId
        ? BUILDING_CATALOG.find((item) => item.id === tile.buildingId) ?? null
        : null;
      propsRef.current.onTileHover(tile, b);
    };

    const handleClick = (e: MouseEvent) => {
      const coords = screenToGrid(e.clientX, e.clientY);
      if (coords) {
        propsRef.current.onTileClick(coords.row, coords.col);
      }
    };

    const handleLeave = () => {
      hoverRef.current = null;
      propsRef.current.onTileHover(null, null);
    };

    canvas.addEventListener('pointermove', handleMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('pointerleave', handleLeave);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', handleMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  const stageBgSrc =
    stage === 1
      ? '/assets/aistudio/Tambahkan_judul__1__5ad5298b.png'
      : stage === 2
        ? '/assets/aistudio/Tambahkan_judul__2__81566d0d.png'
        : '/assets/aistudio/Tambahkan_judul__3__9ee52f2a.png';

  return (
    <div ref={containerRef} className="relative h-full min-h-[360px] w-full overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950">
      <img
        src={stageBgSrc}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover object-left-bottom opacity-20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/70 to-slate-950/95"
      />
      <canvas
        ref={canvasRef}
        data-testid="city-canvas"
        aria-label="Peta Kota Nusantara Isometrik Interaktif"
        className="relative z-10 block h-full w-full cursor-pointer"
      />
    </div>
  );
};
