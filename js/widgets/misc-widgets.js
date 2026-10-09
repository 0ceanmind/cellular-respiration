// Recap tiles and the question-bank launcher.
import { register } from './registry.js';

register('recap', (el) => {
  const tiles = [
    ['3 + 5', 'PDH complex', 'enzymes + coenzymes · TLCFN', 'grad-1'],
    ['8 · 3', 'TCA cycle', 'steps · control points', 'grad-2'],
    ['10', 'ATP per acetyl CoA', '3 NADH · 1 FADH₂ · 1 GTP', 'grad-2'],
    ['4 · 4 · 2', 'H⁺ pumped', 'by Complexes I · III · IV', 'grad-3'],
    ['2.5 · 1.5', 'ATP per NADH · FADH₂', '4 H⁺ = 1 ATP', 'grad-3'],
    ['30–32', 'ATP per glucose', 'depends on the NADH shuttle', 'grad-atp'],
  ];
  el.innerHTML = `<div class="recap">${tiles.map(([n, t, s, g], i) => `
    <div class="rtile" style="--d:${i * 0.09}s"><span class="rbig ${g}">${n}</span><b>${t}</b><span class="rs">${s}</span></div>`).join('')}</div>`;
  return {
    enter() { el.querySelectorAll('.rtile').forEach(t => { t.classList.remove('in'); void t.offsetWidth; t.classList.add('in'); }); },
  };
});

register('quizcta', (el, app) => {
  const url = new URL('quiz.html', location.href).href;
  el.innerHTML = `
  <div class="qcta">
    <div class="qtext">
      <p class="eyebrow">The professor's question bank</p>
      <h1 class="qtitle">Test yourself.</h1>
      <p class="qsub"><b class="qcount">—</b> exam-style questions on PDH, the TCA cycle, the ETC and oxidative phosphorylation · instant feedback · explanations</p>
      <div class="qbtns">
        <button class="btn qstart">Start the quiz</button>
        <span class="qhint">or press <kbd>Q</kbd> any time</span>
      </div>
    </div>
    <div class="qqr">
      <div class="qrbox"></div>
      <span>Scan to practise on your phone</span>
    </div>
  </div>`;
  try {
    const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
    el.querySelector('.qrbox').innerHTML = qr.createSvgTag({ cellSize: 8, margin: 2, scalable: true });
  } catch (e) { el.querySelector('.qqr').style.display = 'none'; }
  fetch('data/questions.json').then(r => r.json()).then(d => { el.querySelector('.qcount').textContent = d.questions.length; }).catch(() => {});
  el.querySelector('.qstart').addEventListener('click', () => app.toggleOverlay('quiz-overlay', true));
  return {};
});
