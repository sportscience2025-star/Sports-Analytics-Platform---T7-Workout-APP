# UI and Chart Visual Components Analysis Report

## Summary
This report provides a detailed technical audit of the Chart.js visual components, HTML containers, and CSS styling across the application (primarily centered in `js/data-analysis.js`, `index.html`, and `css/style.css`). It outlines existing chart configurations and formulates concrete architectural and design recommendations for a modern visual overhaul—including glowing neon lines, custom glassmorphism tooltips, sleek modern typography, and upgraded responsive canvas layouts.

---

## 1. Existing Chart.js Instances & Canvas HTML Structures

In `js/data-analysis.js`, four dynamic Chart.js instances are created and managed by the `DataAnalysisUI` class.

### 1.1 Chart Instance Inventory

| Instance Name | Canvas ID | Chart Type | Data / Visual Purpose | File & Lines |
| :--- | :--- | :--- | :--- | :--- |
| `this.chartInstance` | `#vbt-chart` | `scatter` + `line` | Load-Velocity profile (Data points, OLS regression line, MVT threshold line) | `js/data-analysis.js`: 711, 849–921 |
| `this.powerCurveChart` | `#power-curve-chart` | `line` + `scatter` | Mechanical power curve $P = F \cdot V$ with Pmax peak highlight | `js/data-analysis.js`: 718, 941–996 |
| `this.jumpHeightChart` | `#jump-heights-chart` | `bar` | Comparative jump heights (Squat Jump vs. Countermovement Jump) | `js/data-analysis.js`: 1171, 1193–1223 |
| `this.rsiChart` | `#rsi-trials-chart` | `line` | Reactive Strength Index (RSI) progression across Drop Jump trials | `js/data-analysis.js`: 1176, 1234–1263 |

### 1.2 HTML Container Structures & Styling Setup

- **VBT & Power Curve Dashboard Container** (`js/data-analysis.js`, lines 707–722):
  ```html
  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1.5rem; margin-top:1.5rem;">
      <div style="background:rgba(15,23,42,0.4); border:1px solid var(--border); border-radius:12px; padding:1.5rem;">
          <h4 style="margin:0 0 0.75rem 0; font-size:0.95rem; color:white;">📈 Profilo Carico-Velocità</h4>
          <div style="position:relative; height:280px;">
              <canvas id="vbt-chart"></canvas>
          </div>
          ...
      </div>
      <div style="background:rgba(15,23,42,0.4); border:1px solid var(--border); border-radius:12px; padding:1.5rem;">
          <h4 style="margin:0 0 0.75rem 0; font-size:0.95rem; color:white;">⚡ Curva di Potenza (F·V)</h4>
          <div style="position:relative; height:280px;">
              <canvas id="power-curve-chart"></canvas>
          </div>
          ...
      </div>
  </div>
  ```

- **Jump Test Dashboard Container** (`js/data-analysis.js`, lines 1166–1179):
  ```html
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
      <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; height: 320px;">
          <h5 style="margin-top:0; margin-bottom: 1rem; color: white; font-size: 1rem;">Confronto Altezze: CMJ vs SJ</h5>
          <div style="position: relative; height: calc(100% - 2rem);">
              <canvas id="jump-heights-chart"></canvas>
          </div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; height: 320px;">
          <h5 style="margin-top:0; margin-bottom: 1rem; color: white; font-size: 1rem;">Drop Jump: Andamento RSI per Prova</h5>
          <div style="position: relative; height: calc(100% - 2rem);">
              <canvas id="rsi-trials-chart"></canvas>
          </div>
      </div>
  </div>
  ```

---

## 2. Inspection of Current Styling, Tooltips, Colors, and Responsive Options

### 2.1 CSS Styling & Architecture
- **Inline Style Dominance**: Currently, chart card backgrounds (`rgba(15, 23, 42, 0.4)`), borders (`1px solid var(--border)`), border radii (`12px`), paddings (`1.5rem`), and fixed heights (`280px`, `320px`) are declared **inline inside JavaScript template strings** in `js/data-analysis.js`.
- **Global CSS Variables** (`css/style.css`, lines 1–35):
  - `--bg-body`: `#0f172a`
  - `--bg-surface`: `#1e293b`
  - `--primary`: `#3b82f6`
  - `--accent`: `#0ea5e9`
  - `--border`: `#334155`
  - `--font-heading`: `'Outfit', sans-serif`
  - `--font-body`: `'Inter', sans-serif`
- There are no specific CSS utility classes (`.chart-card`, `.chart-wrapper`, etc.) defined in `css/style.css` for data visualization panels.

### 2.2 Dataset Colors and Configurations
1. **Load-Velocity Chart** (`#vbt-chart`, lines 853–884):
   - **Real Data (Scatter)**: `backgroundColor: '#10b981'`, `pointRadius: 7`, `pointHoverRadius: 9`
   - **OLS Regression Line**: `borderColor: '#6366f1'`, `borderWidth: 2.5`, `fill: false`, `pointRadius: 0`
   - **MVT Threshold Line**: `borderColor: '#fbbf24'`, `borderWidth: 2.5`, `borderDash: [8, 4]`, `fill: false`
2. **Power Curve Chart** (`#power-curve-chart`, lines 945–963):
   - **Power Area Line**: `borderColor: '#ef4444'`, `backgroundColor: 'rgba(239,68,68,0.08)'`, `borderWidth: 2.5`, `fill: true`, `tension: 0.3`
   - **Pmax Point**: `backgroundColor: '#fbbf24'`, `borderColor: '#fbbf24'`, `pointRadius: 9`, `pointHoverRadius: 11`
3. **Jump Heights Chart** (`#jump-heights-chart`, lines 1198–1208):
   - **Squat Jump (SJ)**: `backgroundColor: '#10b981'`, `borderRadius: 4`
   - **Countermovement Jump (CMJ)**: `backgroundColor: '#6366f1'`, `borderRadius: 4`
4. **RSI Trials Chart** (`#rsi-trials-chart`, lines 1236–1246):
   - **RSI Line**: `borderColor: '#f59e0b'`, `backgroundColor: 'rgba(245, 158, 11, 0.1)'`, `borderWidth: 2`, `pointRadius: 6`, `fill: true`, `tension: 0.1`

### 2.3 Tooltips & Scales Inspection
- **VBT & Power Curve Tooltips** (lines 891–906, 971–981):
  - Configured via Chart.js built-in tooltip plugin with custom text callbacks.
  - Basic dark canvas background styling: `backgroundColor: 'rgba(15,23,42,0.95)'`, `borderColor: 'rgba(255,255,255,0.1)'`, `borderWidth: 1`, `titleColor: '#e2e8f0'`, `bodyColor: '#94a3b8'`.
- **Jump & RSI Tooltips**: Default standard Chart.js tooltips with no custom callbacks or formatting.
- **Responsive Settings**: All charts set `responsive: true` and `maintainAspectRatio: false`, but canvas heights are tightly restricted by parent element CSS heights (`280px` / `320px`), causing charts to appear vertically squashed on wide screens.

---

## 3. Technical Recommendations for Visual Overhaul

To elevate the UI to a futuristic, high-performance sports science dashboard, we propose the following technical improvements:

### 3.1 Glowing Neon Lines via Chart.js Plugin
Chart.js standard canvas rendering does not natively expose `shadowBlur` and `shadowColor` in dataset options. We recommend implementing a lightweight custom plugin (`chartGlowPlugin`) or utilizing canvas context hooks (`beforeDatasetsDraw` / `afterDatasetsDraw`).

**Implementation Blueprint**:
```javascript
const chartGlowPlugin = {
    id: 'chartGlow',
    beforeDatasetDraw(chart, args) {
        const { ctx } = chart;
        const dataset = args.meta.dataset;
        if (dataset && args.meta.type === 'line') {
            ctx.save();
            ctx.shadowColor = args.meta.glowColor || dataset.options.borderColor || '#00f0ff';
            ctx.shadowBlur = args.meta.glowBlur || 14;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    },
    afterDatasetDraw(chart, args) {
        const { ctx } = chart;
        if (args.meta.type === 'line') {
            ctx.restore();
        }
    }
};
```
**Recommended Neon Palette**:
- **VBT Regression Line**: Neon Cyan (`#00f0ff` / `#06b6d4`) with cyan glow (`rgba(6, 182, 212, 0.8)`).
- **VBT Data Points**: Emerald Neon (`#00ff9d` / `#10b981`) with point glow.
- **Power Curve**: Cyberpunk Magenta/Pink (`#ff007f` / `#ec4899`) with fill gradient (`rgba(255, 0, 127, 0.15)` to transparent).
- **RSI Line**: Electric Gold (`#ffb700` / `#f59e0b`) with warm glow.

### 3.2 Custom Glassmorphism Tooltips (External HTML Tooltips)
Replace standard canvas tooltips with custom HTML elements driven by `options.plugins.tooltip.external`.

**CSS Styling Specification**:
```css
.glass-chart-tooltip {
    position: absolute;
    pointer-events: none;
    transition: all 0.15s ease;
    background: rgba(15, 23, 42, 0.78);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 12px 32px 0 rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 10px 14px;
    color: #f8fafc;
    font-family: 'Inter', sans-serif;
    z-index: 1000;
}
```

### 3.3 Sleek Typography & CSS Extraction
1. **Extract CSS**: Move inline card/container styles out of JavaScript string templates into `css/style.css` under dedicated utility classes (`.analysis-chart-card`, `.chart-canvas-container`).
2. **Typography Setup**:
   - Apply `'Outfit', sans-serif` to chart titles and section headers.
   - Configure global Chart.js scale defaults to use `'Inter', sans-serif` with font weight `500` and crisp color contrast (`#94a3b8` tick labels, subtle grid lines `rgba(255,255,255,0.04)`).

### 3.4 Larger, Responsive Canvas Layouts
- **Dynamic Container Heights**: Upgrade chart wrapper containers to use CSS min-heights and media queries:
  ```css
  .chart-canvas-container {
      position: relative;
      width: 100%;
      height: 360px;
  }
  @media (max-width: 768px) {
      .chart-canvas-container {
          height: 280px;
      }
  }
  ```
- **Grid Layout Enhancements**: Upgrade desktop view grid layouts to allow full-width expanded charts when inspecting detailed VBT regressions or multi-trial jump tests.

---
*Report compiled by Explorer 2 (teamwork_preview_explorer)*
