// Interactive MCQ bank: topic filter, instant feedback with explanations, results + review.
const $ = s => document.querySelector(s);
const embed = new URLSearchParams(location.search).has('embed');
if (embed) document.body.classList.add('embed');

const CHAPTERS = [
  { n: 'The Bridge', c: '#30d158', t: ['PDH complex', 'PDH analogues', 'PDH deficiency', 'Thiamine'] },
  { n: 'The Cycle', c: '#ff9f0a', t: ['TCA steps', 'TCA energetics', 'TCA regulation', 'Amphibolic'] },
  { n: 'The Power Plant', c: '#7d7aff', t: ['ETC components', 'Chemiosmotic & ATP yield', 'ATP synthase', 'Inhibitors', 'Uncouplers'] },
];
const colorOf = topic => (CHAPTERS.find(ch => ch.t.includes(topic)) || {}).c || '#98989f';
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('qb:' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('qb:' + k, JSON.stringify(v)); } catch { /* private mode */ } },
};

let BANK = [], selected = new Set(), len = 10, run = null;

function show(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === id));
  window.scrollTo(0, 0);
}

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function renderTopics() {
  const counts = {};
  BANK.forEach(q => { counts[q.topic] = (counts[q.topic] || 0) + 1; });
  $('#topics').innerHTML = CHAPTERS.map(ch => `
    <div class="chap"><span class="chn" style="--c:${ch.c}">${ch.n}</span>
      <div class="chips">${ch.t.map(t => `<button class="chip ${selected.has(t) ? 'on' : ''}" data-t="${t}" style="--c:${ch.c}">${t}<i>${counts[t] || 0}</i></button>`).join('')}</div>
    </div>`).join('');
  updateGo();
}
function updateGo() {
  const n = BANK.filter(q => selected.has(q.topic)).length;
  $('#go').disabled = n === 0;
  $('#go').textContent = n ? `Start · ${len ? Math.min(len, n) : n} questions` : 'Pick a topic';
}

function start(pool) {
  const qs = shuffle(pool.slice()).slice(0, len ? len : pool.length);
  run = { qs, i: 0, score: 0, answers: [] };
  show('quiz');
  renderQ();
}

function renderQ() {
  const q = run.qs[run.i];
  $('#qnum').textContent = `${run.i + 1} / ${run.qs.length}`;
  $('#progBar').style.width = (run.i / run.qs.length * 100) + '%';
  $('#score').textContent = `${run.score} ✓`;
  $('#qtopic').textContent = q.topic;
  $('#qtopic').style.setProperty('--c', colorOf(q.topic));
  $('#qobj').textContent = q.objective;
  $('#qorigin').textContent = q.origin.startsWith('Lecture') ? 'From the lecture' : q.origin.startsWith('Adapted from Lecture') ? 'Lecture question (MCQ form)' : q.origin.startsWith('Adapted') ? 'Adapted · unverified OMC list' : 'Exam-style';
  $('#qstem').textContent = q.stem;
  $('#opts').innerHTML = q.options.map((o, i) => `<button class="opt" data-i="${i}"><span class="l">${'ABCDE'[i]}</span><span class="t"></span></button>`).join('');
  $('#opts').querySelectorAll('.t').forEach((el, i) => { el.textContent = q.options[i]; });
  $('#explain').classList.remove('on');
  $('#next').disabled = true;
  $('#next').textContent = run.i === run.qs.length - 1 ? 'See result' : 'Next';
  $('#qcard').classList.remove('in'); void $('#qcard').offsetWidth; $('#qcard').classList.add('in');
}

function answer(i) {
  const q = run.qs[run.i];
  if (run.answers[run.i] !== undefined) return;
  run.answers[run.i] = i;
  const ok = i === q.answer;
  if (ok) run.score++;
  $('#opts').querySelectorAll('.opt').forEach((b, j) => {
    b.disabled = true;
    b.classList.toggle('right', j === q.answer);
    b.classList.toggle('wrong', j === i && !ok);
    b.classList.toggle('dim', j !== q.answer && j !== i);
  });
  $('#verdict').textContent = ok ? 'Correct' : `Answer · ${'ABCDE'[q.answer]}`;
  $('#verdict').className = 'verdict ' + (ok ? 'ok' : 'no');
  $('#exText').textContent = q.explanation;
  $('#explain').classList.add('on');
  $('#score').textContent = `${run.score} ✓`;
  $('#next').disabled = false;
  $('#next').focus({ preventScroll: true });
}

function next() {
  if (run.answers[run.i] === undefined) return;
  if (run.i < run.qs.length - 1) { run.i++; renderQ(); }
  else finish();
}

function finish() {
  const n = run.qs.length, s = run.score, pct = Math.round(s / n * 100);
  show('result');
  const C = 2 * Math.PI * 52;
  const ring = $('#ringVal');
  ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C;
  requestAnimationFrame(() => { ring.style.strokeDashoffset = C * (1 - s / n); });
  ring.style.stroke = pct >= 80 ? '#30d158' : pct >= 60 ? '#ffd60a' : '#ff453a';
  $('#pct').textContent = pct + '%'; $('#frac').textContent = `${s} / ${n}`;
  $('#msg').textContent = pct >= 90 ? 'Outstanding — you own this chapter.' : pct >= 75 ? 'Strong. Review the few you missed below.' : pct >= 50 ? 'Getting there. Re-read the topics in red, then retry.' : 'Worth another pass through the slides — then try again.';
  const by = {};
  run.qs.forEach((q, i) => { const b = by[q.topic] ||= { n: 0, s: 0 }; b.n++; if (run.answers[i] === q.answer) b.s++; });
  $('#breakdown').innerHTML = Object.entries(by).sort((a, b) => a[1].s / a[1].n - b[1].s / b[1].n).map(([t, b]) => `
    <div class="brow"><span class="bt">${t}</span><div class="bb"><i style="width:${b.s / b.n * 100}%;background:${b.s / b.n >= 0.75 ? '#30d158' : b.s / b.n >= 0.5 ? '#ffd60a' : '#ff453a'}"></i></div><span class="bv">${b.s}/${b.n}</span></div>`).join('');
  const wrong = run.qs.map((q, i) => ({ q, a: run.answers[i] })).filter(x => x.a !== x.q.answer);
  $('#retryWrong').style.display = wrong.length ? '' : 'none';
  $('#review').innerHTML = wrong.length ? `<h3>Review · ${wrong.length} missed</h3>` + wrong.map(({ q, a }) => `
    <article class="rv"><p class="rs"></p>
      <p class="ry">Your answer · <b>${'ABCDE'[a]}</b> <span class="rya"></span></p>
      <p class="rc">Correct · <b>${'ABCDE'[q.answer]}</b> <span class="rca"></span></p>
      <p class="re"></p></article>`).join('') : '<h3>No mistakes to review.</h3>';
  $('#review').querySelectorAll('.rv').forEach((el, k) => {
    const { q, a } = wrong[k];
    el.querySelector('.rs').textContent = q.stem;
    el.querySelector('.rya').textContent = q.options[a];
    el.querySelector('.rca').textContent = q.options[q.answer];
    el.querySelector('.re').textContent = q.explanation;
  });
  run.wrong = wrong.map(w => w.q);
  const key = [...selected].sort().join('|');
  const best = store.get('best', {});
  if (!best[key] || pct > best[key]) { best[key] = pct; store.set('best', best); }
}

/* ── events ───────────────────────────── */
$('#topics').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  const t = b.dataset.t;
  selected.has(t) ? selected.delete(t) : selected.add(t);
  b.classList.toggle('on'); updateGo(); store.set('topics', [...selected]);
});
$('#allTopics').addEventListener('click', () => {
  const all = CHAPTERS.flatMap(c => c.t);
  if (selected.size === all.length) selected.clear(); else all.forEach(t => selected.add(t));
  renderTopics(); store.set('topics', [...selected]);
});
$('#len').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  len = +b.dataset.v;
  $('#len').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  updateGo();
});
$('#go').addEventListener('click', () => start(BANK.filter(q => selected.has(q.topic))));
$('#opts').addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) answer(+b.dataset.i); });
$('#next').addEventListener('click', next);
$('#quit').addEventListener('click', () => show('start'));
$('#again').addEventListener('click', () => show('start'));
$('#retryWrong').addEventListener('click', () => { const w = run.wrong; len = 0; start(w); len = +($('#len .on')?.dataset.v ?? 10); });

addEventListener('keydown', e => {
  if (!$('#quiz').classList.contains('on')) {
    if (e.key === 'Escape' && embed) parent.postMessage('quiz:close', '*');
    return;
  }
  const k = e.key.toLowerCase();
  const idx = 'abcde'.indexOf(k) >= 0 ? 'abcde'.indexOf(k) : '12345'.indexOf(k);
  if (idx >= 0 && k.length === 1) { e.preventDefault(); answer(idx); }
  else if (k === 'enter' || k === 'arrowright' || k === ' ') { e.preventDefault(); next(); }
  else if (k === 'escape') { if (embed) parent.postMessage('quiz:close', '*'); else show('start'); }
});

/* ── boot ─────────────────────────────── */
fetch('data/questions.json').then(r => r.json()).then(d => {
  BANK = d.questions;
  $('#qcount').textContent = BANK.length;
  const saved = store.get('topics', null);
  (saved && saved.length ? saved : CHAPTERS.flatMap(c => c.t)).forEach(t => selected.add(t));
  renderTopics();
  const ps = d.meta.pastPaperSearch || {};
  $('#aboutText').textContent = `${ps.found ? '' : 'No public National University (Oman) past papers on this chapter could be found, so these are exam-style questions written from the lecture slides (L.10, L.12, L.13) and Lippincott Illustrated Reviews: Biochemistry. '}The lecturer's own critical-thinking questions are included, and 8 questions are adapted from an unverified Oman Medical College topic list. ATP values follow the lecture convention: NADH = 2.5, FADH₂ = 1.5 ATP.`;
  const best = store.get('best', {});
  const top = Math.max(0, ...Object.values(best));
  if (top) $('#best').textContent = `Your best so far: ${top}%`;
}).catch(() => { $('#qcount').textContent = '0'; $('#aboutText').textContent = 'The question bank could not be loaded.'; });
