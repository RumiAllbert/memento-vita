import { useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $lifeConfig, $lifeStats, $relationships } from '../stores/life';
import { WEEKS_PER_YEAR, DEFAULT_LIFE_EXPECTANCY, DEFAULT_RETIREMENT_AGE } from '../lib/constants';
import { calcWeeksLived, getPhaseForAge } from '../lib/calculations';

export default function ExportPoster() {
  const rawConfig = useStore($lifeConfig);
  const stats = useStore($lifeStats);
  const rels = useStore($relationships);

  const exportPNG = useCallback(() => {
    if (!stats) return;

    const config = {
      birthDate: rawConfig.birthDate || '',
      name: rawConfig.name || '',
      lifeExpectancy: Number(rawConfig.lifeExpectancy) || DEFAULT_LIFE_EXPECTANCY,
      retirementAge: Number(rawConfig.retirementAge) || DEFAULT_RETIREMENT_AGE,
    };

    const totalYears = config.lifeExpectancy;
    const weeksLived = calcWeeksLived(config.birthDate);
    const scale = 2; // retina

    // Layout
    const cellSize = 8;
    const cellGap = 1.5;
    const gridW = WEEKS_PER_YEAR * (cellSize + cellGap);
    const gridH = totalYears * (cellSize + cellGap);
    const marginX = 80;
    const marginTop = 140;
    const marginBottom = 160;
    const canvasW = gridW + marginX * 2;
    const canvasH = gridH + marginTop + marginBottom;

    const canvas = document.createElement('canvas');
    canvas.width = canvasW * scale;
    canvas.height = canvasH * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);

    // Get current theme colors from CSS vars
    const cs = getComputedStyle(document.documentElement);
    const bg = cs.getPropertyValue('--th-bg').trim() || '#0a0a0a';
    const text = cs.getPropertyValue('--th-text').trim() || '#e5e5e5';
    const muted = cs.getPropertyValue('--th-text-muted').trim() || '#737373';
    const lived = cs.getPropertyValue('--th-lived').trim() || '#404040';
    const current = cs.getPropertyValue('--th-current').trim() || '#e5e5e5';
    const future = cs.getPropertyValue('--th-future').trim() || '#1a1a1a';
    const border = cs.getPropertyValue('--th-border').trim() || '#262626';

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Title
    ctx.fillStyle = text;
    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.fillText(config.name ? `${config.name}'s Life` : 'Your Life', marginX, 50);

    ctx.fillStyle = muted;
    ctx.font = '400 11px "JetBrains Mono", monospace';
    ctx.fillText(
      `${stats.weeksLived.toLocaleString()} weeks lived  ·  ${stats.weeksRemaining.toLocaleString()} remaining  ·  ${stats.percentLived.toFixed(1)}% complete`,
      marginX,
      72
    );

    // Subtitle stats
    ctx.font = '400 10px "JetBrains Mono", monospace';
    const subtitleParts = [`~${stats.summersLeft} summers left`];
    if ((rels.parentsAlive || 'both') !== 'neither') {
      subtitleParts.push(`~${stats.parentVisitsLeft} parent visits`);
    }
    subtitleParts.push(`${stats.phoneYearsTotal} years on screen`);
    ctx.fillText(subtitleParts.join('  ·  '), marginX, 92);

    // Column headers (every 4 weeks)
    ctx.fillStyle = muted;
    ctx.font = '400 6px "JetBrains Mono", monospace';
    for (let w = 0; w < WEEKS_PER_YEAR; w += 4) {
      ctx.fillText(
        String(w + 1),
        marginX + w * (cellSize + cellGap) + 1,
        marginTop - 6
      );
    }

    // Draw grid
    for (let year = 0; year < totalYears; year++) {
      const y = marginTop + year * (cellSize + cellGap);

      // Row label
      if (year % 5 === 0) {
        ctx.fillStyle = muted;
        ctx.font = '400 7px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(String(year), marginX - 8, y + cellSize - 1);
        ctx.textAlign = 'left';
      }

      for (let week = 0; week < WEEKS_PER_YEAR; week++) {
        const idx = year * WEEKS_PER_YEAR + week;
        const x = marginX + week * (cellSize + cellGap);

        if (idx < weeksLived) {
          ctx.fillStyle = lived;
          ctx.fillRect(x, y, cellSize, cellSize);
        } else if (idx === weeksLived) {
          ctx.fillStyle = current;
          ctx.fillRect(x, y, cellSize, cellSize);
          // glow
          ctx.shadowColor = current;
          ctx.shadowBlur = 4;
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = future;
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = border;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }

    // Legend at bottom-left
    const legendY = canvasH - marginBottom + 30;
    const legendItems = [
      { color: lived, label: 'Lived' },
      { color: current, label: 'Now' },
      { color: future, label: 'Future' },
    ];
    // Actually put legend left-aligned below grid
    ctx.font = '400 7px "JetBrains Mono", monospace';
    legendItems.forEach((item, i) => {
      const lx = marginX + i * 60;
      ctx.fillStyle = item.color;
      ctx.fillRect(lx, legendY, 8, 8);
      if (item.label === 'Future') {
        ctx.strokeStyle = border;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(lx, legendY, 8, 8);
      }
      ctx.fillStyle = muted;
      ctx.fillText(item.label, lx + 12, legendY + 7);
    });

    // Footer quote (below legend)
    ctx.fillStyle = muted;
    ctx.font = '400 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Time is the most valuable thing a man can spend. — Theophrastus',
      canvasW / 2,
      legendY + 40
    );

    ctx.font = '400 8px "JetBrains Mono", monospace';
    ctx.fillText('memento vita', canvasW / 2, legendY + 58);
    ctx.textAlign = 'left';

    // Download
    const link = document.createElement('a');
    link.download = `${(config.name || 'life').toLowerCase().replace(/\s+/g, '-')}-memento-vita.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [rawConfig, stats, rels]);

  if (!stats) return null;

  return (
    <button
      onClick={exportPNG}
      data-export-poster
      className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg transition-colors"
      style={{ color: 'var(--th-text-muted)', border: '1px solid var(--th-border)' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span className="hidden sm:inline">Export Poster</span>
    </button>
  );
}
