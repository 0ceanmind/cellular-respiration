// Animated line-art icons for the roadmap cards.
const ICONS = {
  bridge: `
  <svg viewBox="0 0 400 220">
    <defs><linearGradient id="gi1" x1="0" x2="1"><stop offset="0" stop-color="#64d2ff"/><stop offset="1" stop-color="#30d158"/></linearGradient></defs>
    <path d="M20 150 H380" stroke="#ffffff22" stroke-width="3"/>
    <path id="arcB" d="M40 150 Q200 20 360 150" fill="none" stroke="url(#gi1)" stroke-width="5" stroke-linecap="round"/>
    ${[80, 120, 160, 200, 240, 280, 320].map(x => {
      const t = (x - 40) / 320, y = 150 - 2 * t * (1 - t) * 130;
      return `<line x1="${x}" y1="${y + 2}" x2="${x}" y2="150" stroke="#ffffff30" stroke-width="2"/>`;
    }).join('')}
    <g><circle r="9" fill="#30d158"><animateMotion dur="3.2s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".5 0 .5 1"><mpath href="#arcB"/></animateMotion><animate attributeName="fill" values="#30d158;#30d158;#64d2ff;#64d2ff" keyTimes="0;.45;.55;1" dur="3.2s" repeatCount="indefinite"/></circle></g>
    <text x="40" y="190" fill="#98989f" font-size="20" font-weight="600" font-family="Inter">pyruvate</text>
    <text x="360" y="190" fill="#98989f" font-size="20" font-weight="600" font-family="Inter" text-anchor="end">acetyl CoA</text>
  </svg>`,
  cycle: `
  <svg viewBox="0 0 400 220">
    <defs><linearGradient id="gi2" x1="0" x2="1"><stop offset="0" stop-color="#ffd60a"/><stop offset=".5" stop-color="#ff9f0a"/><stop offset="1" stop-color="#ff6482"/></linearGradient></defs>
    <circle cx="200" cy="110" r="86" fill="none" stroke="#ffffff18" stroke-width="14"/>
    <g style="transform-origin:200px 110px; animation: spin 7s linear infinite">
      <circle cx="200" cy="110" r="86" fill="none" stroke="url(#gi2)" stroke-width="6" stroke-linecap="round" stroke-dasharray="150 390"/>
    </g>
    ${Array.from({ length: 8 }, (_, i) => {
      const a = i / 8 * Math.PI * 2 - Math.PI / 2;
      return `<circle cx="${200 + 86 * Math.cos(a)}" cy="${110 + 86 * Math.sin(a)}" r="9" fill="#1c1c1e" stroke="#ffffffaa" stroke-width="3"/>`;
    }).join('')}
    <text x="200" y="120" text-anchor="middle" fill="#fff" font-size="30" font-weight="700" font-family="Inter">8</text>
  </svg>`,
  plant: `
  <svg viewBox="0 0 400 220">
    <defs><linearGradient id="gi3" x1="0" x2="1"><stop offset="0" stop-color="#d070ff"/><stop offset=".5" stop-color="#7d7aff"/><stop offset="1" stop-color="#2d9bff"/></linearGradient></defs>
    <rect x="10" y="98" width="380" height="34" rx="17" fill="#ffffff10"/>
    ${[['#7d7aff', 50], ['#d070ff', 108], ['#2d9bff', 166], ['#2ad4b4', 224]].map(([c, x]) => `<rect x="${x}" y="84" width="40" height="62" rx="14" fill="${c}" opacity=".9"/>`).join('')}
    <g transform="translate(320 115)">
      <rect x="-12" y="-30" width="24" height="60" rx="8" fill="#ffb340"/>
      <g style="animation: spin 1.6s linear infinite"><circle r="26" fill="none" stroke="#ffd60a" stroke-width="4" stroke-dasharray="10 8"/></g>
    </g>
    <path id="eP" d="M50 115 H260" fill="none"/>
    <circle r="7" fill="#ffe45c"><animateMotion dur="2.2s" repeatCount="indefinite"><mpath href="#eP"/></animateMotion></circle>
    ${[70, 186, 244].map((x, i) => `<circle cx="${x}" r="6" fill="#ff453a"><animate attributeName="cy" values="100;40" dur="2.2s" begin="${i * 0.5}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="2.2s" begin="${i * 0.5}s" repeatCount="indefinite"/></circle>`).join('')}
  </svg>`,
};

export function drawChapterIcons() {
  document.querySelectorAll('.ch-icon[data-icon]').forEach(el => { el.innerHTML = ICONS[el.dataset.icon] || ''; });
  if (!document.getElementById('kf-spin')) {
    const s = document.createElement('style'); s.id = 'kf-spin';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
}
