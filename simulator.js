const defaults = { noseAngle: 0.5, fuselageRatio: 7, wingSweep: 35, tailTaper: 0.5, volumeDistribution: 0 };
const configs = [
  ['noseAngle', 'Nose shape', 0, 1, 0.01, value => value < 0.15 ? 'Needle' : value < 0.3 ? 'Optimal' : value < 0.6 ? 'Rounded' : 'Blunt', 'Optimal near 0.2'],
  ['fuselageRatio', 'Fineness ratio', 3, 12, 0.1, value => `${value.toFixed(1)}:1`, 'Longer and slimmer reduces the boom'],
  ['wingSweep', 'Wing sweep', 0, 75, 1, value => `${value.toFixed(0)}°`, 'Optimal near 52° at Mach 1.6'],
  ['tailTaper', 'Tail taper', 0, 1, 0.01, value => value < 0.2 ? 'Flat cut' : value < 0.4 ? 'Slight taper' : value < 0.6 ? 'Optimal' : value < 0.8 ? 'Sharp taper' : 'Needle', 'Optimal near 0.5'],
  ['volumeDistribution', 'Volume distribution', -1, 1, 0.01, value => value < -0.4 ? 'Rear heavy' : value < -0.1 ? 'Optimal' : value < 0.1 ? 'Uniform' : value < 0.5 ? 'Forward biased' : 'Front heavy', 'Optimal near -0.2'],
];
let params = { ...defaults };
let currentResult;
const get = id => document.getElementById(id);
const storedRuns = () => JSON.parse(localStorage.getItem('sonicBoomRuns') || '[]');

function calculateBoom(p) {
  const M = 1.6, length = 50, count = 200, pi = Math.PI;
  const machAngle = Math.asin(1 / M) * 180 / pi;
  const radius = length / (2 * p.fuselageRatio);
  const maxArea = pi * radius * radius;
  const peak = length * (0.5 - 0.15 * p.volumeDistribution);
  const nosePower = 1.4 - 0.8 * p.noseAngle;
  const tailPower = 0.6 + 0.8 * p.tailTaper;
  const sigma = length * (0.04 + 0.16 * p.wingSweep / 75);
  const sweepFactor = p.wingSweep < machAngle
    ? 1 + 2 * ((machAngle - p.wingSweep) / machAngle) ** 2
    : 1 + 1.5 * (Math.max(0, p.wingSweep - 52) / 23) ** 2;
  const wingArea = 0.35 * maxArea * sweepFactor;
  const areas = [];

  for (let index = 0; index < count; index += 1) {
    const x = index / (count - 1) * length;
    const t = x <= peak
      ? Math.max(0, Math.min(1, x / peak))
      : Math.max(0, Math.min(1, (length - x) / (length - peak)));
    const angle = pi / 2 * t ** (x <= peak ? nosePower : tailPower);
    areas.push(maxArea * Math.sin(angle) ** 2 + wingArea * Math.exp(-0.5 * ((x - 0.45 * length) / sigma) ** 2));
  }

  const dx = length / (count - 1);
  const second = areas.map((_, index) => index > 0 && index < count - 1
    ? (areas[index + 1] - 2 * areas[index] + areas[index - 1]) / dx ** 2 : 0);
  second[0] = second[1];
  second[count - 1] = second[count - 2];
  let fMax = 0;
  for (let j = 1; j < count; j += 1) {
    let integral = 0;
    for (let i = 0; i < j; i += 1) {
      integral += 0.5 * (second[i] + second[Math.min(i + 1, count - 1)]) /
        Math.sqrt(j * dx - (i + 0.5) * dx) * dx;
    }
    fMax = Math.max(fMax, Math.abs(integral) / (2 * pi));
  }

  const noseFactor = 1 + (p.noseAngle < 0.2 ? 0.7 * ((0.2 - p.noseAngle) / 0.2) ** 2 : 0.35 * ((p.noseAngle - 0.2) / 0.8) ** 2);
  const tailFactor = 1 + (p.tailTaper > 0.5 ? 0.45 * ((p.tailTaper - 0.5) / 0.5) ** 2 : 0.35 * ((0.5 - p.tailTaper) / 0.5) ** 2);
  const volumeFactor = 1 + 0.5 * (p.volumeDistribution + 0.2) ** 2;
  const finenessFactor = p.fuselageRatio > 10 ? 1 + 0.5 * ((p.fuselageRatio - 10) / 2) ** 2 : 1;
  const raw = 19399 * 1.4 * M ** 2 / (2 * Math.sqrt(2)) * Math.sqrt(Math.sqrt(M ** 2 - 1) / 12000) * fMax * noseFactor * tailFactor * volumeFactor * finenessFactor;
  return { pldb: 20 * Math.log10(raw / 2e-5) - 53, overpressure: raw / 10 ** (53 / 20) };
}

function renderSliders() {
  get('sliders').innerHTML = configs.map(([key, label, min, max, step, format, hint]) => `
    <div class="slider-row"><div class="slider-label"><label for="${key}">${label}</label><output id="${key}-value"></output></div>
    <input id="${key}" type="range" min="${min}" max="${max}" step="${step}"><p class="hint">${hint}</p></div>`).join('');
  configs.forEach(([key]) => get(key).addEventListener('input', event => {
    params[key] = Number(event.target.value);
    render();
  }));
}

function render() {
  configs.forEach(([key, , , , , format]) => {
    get(key).value = params[key];
    get(`${key}-value`).value = format(params[key]);
  });
  currentResult = calculateBoom(params);
  get('pldb').textContent = currentResult.pldb.toFixed(1);
  get('pressure').textContent = `${currentResult.overpressure.toFixed(1)} Pa`;
  get('grade').textContent = currentResult.pldb < 77 ? 'Excellent' : currentResult.pldb < 83 ? 'Good' : currentResult.pldb < 93 ? 'Average' : currentResult.pldb < 107 ? 'Loud' : 'Very loud';
  drawAircraft();
}

function drawAircraft() {
  const halfHeight = 20 + (1 - (params.fuselageRatio - 3) / 9) * 20;
  const wingOffset = params.wingSweep / 75 * 80;
  const wingSpan = 60 + (1 - params.wingSweep / 75) * 20;
  const nose = 50 + params.noseAngle * 40;
  const tailCut = halfHeight * (1 - params.tailTaper) + 2;
  const points = (a, b, c, d) => `${a},${b} ${c},${b} ${c + wingOffset},${d} ${a + wingOffset * 0.8},${d}`;
  get('airframe-shape').innerHTML = `<polygon points="${points(220, 100 + halfHeight, 270, 100 + halfHeight + wingSpan)}" fill="#426b78"/><polygon points="${points(220, 100 - halfHeight, 270, 100 - halfHeight - wingSpan)}" fill="#426b78"/><rect x="170" y="${100 - halfHeight}" width="160" height="${halfHeight * 2}" fill="url(#airframe-gradient)"/><path d="M170 ${100 - halfHeight} C150 ${100 - halfHeight},${nose + 20} 94,${nose} 100 C${nose + 20} 106,150 ${100 + halfHeight},170 ${100 + halfHeight}Z" fill="url(#airframe-gradient)"/><path d="M330 ${100 - halfHeight} C370 ${100 - halfHeight},430 ${100 - tailCut},450 ${100 - tailCut} L450 ${100 + tailCut} C430 ${100 + tailCut},370 ${100 + halfHeight},330 ${100 + halfHeight}Z" fill="url(#airframe-gradient)"/><ellipse cx="200" cy="${96 - halfHeight}" rx="18" ry="8" fill="#b5f6ff" opacity=".7"/>`;
}

function show(view) {
  ['designer', 'simulation', 'history', 'leaderboard'].forEach(name => { get(`${name}-view`).hidden = name !== view; });
  if (view === 'leaderboard') renderLeaderboard();
  if (view === 'history') renderHistory();
  location.hash = view;
}

function drawSimulation(result) {
  show('simulation');
  const canvas = get('simulation-canvas');
  const context = canvas.getContext('2d');
  const started = performance.now();
  const intensity = Math.max(0, Math.min(1, (result.pldb - 75) / 49));
  function frame(now) {
    const elapsed = (now - started) / 1000;
    context.fillStyle = '#081b28'; context.fillRect(0, 0, 800, 400);
    context.fillStyle = '#163d32'; context.fillRect(0, 340, 800, 60);
    context.strokeStyle = '#4f8b75'; context.beginPath(); context.moveTo(0, 340); context.lineTo(800, 340); context.stroke();
    const x = Math.min(750, 80 + elapsed * 180);
    context.fillStyle = '#a7d2d8'; context.beginPath(); context.ellipse(x, 120, 34, 7, 0, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#5b8994'; context.beginPath(); context.moveTo(x - 4, 114); context.lineTo(x - 30, 88); context.lineTo(x + 10, 114); context.fill();
    if (elapsed > 0.7) {
      const progress = Math.min(1, (elapsed - 0.7) / 2);
      context.globalAlpha = 0.2 + 0.4 * progress;
      context.strokeStyle = `rgb(${Math.round(intensity * 255)},${Math.round((1 - intensity) * 200)},40)`;
      context.beginPath(); context.moveTo(x, 120); context.lineTo(x - 700 * progress, 120 - 700 * progress * 0.85); context.moveTo(x, 120); context.lineTo(x - 700 * progress, 120 + 700 * progress * 0.85); context.stroke(); context.globalAlpha = 1;
    }
    if (elapsed < 4) requestAnimationFrame(frame);
    else {
      get('simulation-result').hidden = false;
      get('simulation-result').innerHTML = `<strong>${result.pldb.toFixed(1)} PLdB</strong> · ${result.overpressure.toFixed(1)} Pa ground overpressure · Run saved locally`;
    }
  }
  requestAnimationFrame(frame);
}

function run() {
  const runs = storedRuns();
  runs.push({ id: Date.now(), username: 'Local Pilot', design: { ...params }, ...currentResult, runAt: new Date().toISOString() });
  localStorage.setItem('sonicBoomRuns', JSON.stringify(runs.slice(-100)));
  drawSimulation(currentResult);
}

function renderHistory() {
  const runs = storedRuns().reverse();
  get('history-list').innerHTML = runs.map(run => `<div class="history-item"><span>${new Date(run.runAt).toLocaleString()}</span><strong>${run.pldb.toFixed(1)} PLdB</strong><span>${run.overpressure.toFixed(1)} Pa</span><span>nose ${run.design.noseAngle.toFixed(2)} · sweep ${run.design.wingSweep.toFixed(0)}°</span></div>`).join('') || '<p class="form-note">No flight tests yet.</p>';
}

function renderLeaderboard() {
  const runs = storedRuns().sort((a, b) => a.pldb - b.pldb).slice(0, 50);
  get('leaderboard-list').innerHTML = runs.map((run, index) => `<tr><td>${index + 1}</td><td>${run.username}</td><td>${run.pldb.toFixed(1)}</td><td>${run.overpressure.toFixed(1)} Pa</td><td>${run.design.noseAngle.toFixed(2)}</td><td>${run.design.fuselageRatio.toFixed(1)}</td><td>${run.design.wingSweep.toFixed(0)}°</td></tr>`).join('') || '<tr><td colspan="7">No flight tests yet.</td></tr>';
}

get('run-button').onclick = run;
get('back-button').onclick = () => show('designer');
document.body.onclick = event => {
  const target = event.target.closest('[data-view]');
  if (target) { event.preventDefault(); show(target.dataset.view); }
};
renderSliders();
render();
if (location.hash === '#leaderboard') show('leaderboard');
