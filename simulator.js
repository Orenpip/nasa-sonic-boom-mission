const defaults = { noseAngle: 0.5, fuselageRatio: 7, wingSweep: 35, tailTaper: 0.5, volumeDistribution: 0 };
const configs = [
  ['noseAngle', 'Nose shape', 0, 1, 0.01, value => value < 0.15 ? 'Needle' : value < 0.3 ? 'Optimal' : value < 0.6 ? 'Rounded' : 'Blunt', 'Optimal near 0.2'],
  ['fuselageRatio', 'Fineness ratio', 3, 12, 0.1, value => `${value.toFixed(1)}:1`, 'Longer and slimmer reduces the boom'],
  ['wingSweep', 'Wing sweep', 0, 75, 1, value => `${value.toFixed(0)}°`, 'Optimal near 52° at Mach 1.6'],
  ['tailTaper', 'Tail taper', 0, 1, 0.01, value => value < 0.2 ? 'Flat cut' : value < 0.4 ? 'Slight taper' : value < 0.6 ? 'Optimal' : value < 0.8 ? 'Sharp taper' : 'Needle', 'Optimal near 0.5'],
  ['volumeDistribution', 'Volume distribution', -1, 1, 0.01, value => value < -0.4 ? 'Rear heavy' : value < -0.1 ? 'Optimal' : value < 0.1 ? 'Uniform' : value < 0.5 ? 'Forward biased' : 'Front heavy', 'Optimal near -0.2'],
];
let params = { ...defaults };
const get = id => document.getElementById(id);

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
  const result = calculateBoom(params);
  get('pldb').textContent = `${result.pldb.toFixed(1)} PLdB`;
  get('pressure').textContent = `${result.overpressure.toFixed(1)} Pa`;
  get('grade').textContent = result.pldb < 77 ? 'Excellent' : result.pldb < 83 ? 'Good' : result.pldb < 93 ? 'Average' : result.pldb < 107 ? 'Loud' : 'Very loud';
}

window.getFlightDesignParams = () => ({ ...params });

renderSliders();
render();
