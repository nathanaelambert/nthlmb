const canvas = document.getElementById('wave');
const ctx = canvas.getContext('2d');

// Controls
const agitationInput = document.getElementById('agitation');
const agitationVal = document.getElementById('agitation_val');

// Fixed values
const amplitude = 0.04;
const lineWeight = 3;
const numPoints = 32; // Constant
const smoothness = 1; // Constant (1 = smooth circle)

// State
let agitation = +agitationInput.value;
let speed = 1;
let lineColor = 'hsl(240, 80%, 50%)'; // initial blue

// Only initialize phases/amplitudes ONCE
let phases = [];
let amplitudesArr = [];
for (let i = 0; i < numPoints; i++) {
  phases[i] = Math.random() * Math.PI * 2;
  amplitudesArr[i] = amplitude;
}

// Update agitation and derived parameters
agitationInput.addEventListener('input', () => {
  agitation = +agitationInput.value;
  agitationVal.textContent = agitation.toFixed(2);
  updateAgitationParams();
});
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function lerpHue(a, b, t) {
  // Interpolate hue taking the shortest path around the color wheel
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return (a + d * t + 360) % 360;
}
function updateAgitationParams() {
  // Speed: 1 to 20
  speed = lerp(1, 20, agitation);
  // Color: blue (240) -> purple (280) -> red (0)
  let hue;
  if (agitation < 0.5) {
    hue = lerpHue(240, 280, agitation * 2); // 0..0.5: blue to purple
  } else {
    hue = lerpHue(280, 0, (agitation - 0.5) * 2); // 0.5..1: purple to red
  }
  lineColor = `hsl(${hue}, 80%, 50%)`;
  agitationVal.textContent = agitation.toFixed(2);
}
updateAgitationParams();

// Responsive square canvas
function resizeCanvas() {
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.92;
  canvas.width = size;
  canvas.height = size;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Exponential random number generator (mean = 1/lambda)
// Most values near 0, a few much larger
function randomExponential(lambda = 3) {
    // See [1][2][5]
    return -Math.log(1 - Math.random()) / lambda;
}
  
function getOscillatingPoints(cx, cy, baseRadius, t) {
    const pts = [];
    // Amplitude increases with agitation (from 0.01 to 0.12)
    const maxAmplitude = lerp(0.01, 0.12, agitation);
    const lambda = 3; // Higher lambda = more points near zero, a few large
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const osc = Math.sin(t * speed + phases[i]);
        // Exponential random, normalized to [0, 1)
        const expRand = Math.min(randomExponential(lambda), 1);
        const amp = expRand * maxAmplitude;
        const r = baseRadius * (1 + amp * osc);
        pts.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        angle: angle,
        r: r
        });
    }
return pts;
}
  

// Helper: get control point for Bézier curve, tangent to the circle at given point
function getControlPoint(pt, angle, handleLen) {
  // Tangent is perpendicular to radius
  const tangentAngle = angle + Math.PI/2;
  return {
    x: pt.x + Math.cos(tangentAngle) * handleLen,
    y: pt.y + Math.sin(tangentAngle) * handleLen
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const baseRadius = w * 0.5 * 0.5; // 50% of width, then half for radius

  const t = performance.now() * 0.001;
  const points = getOscillatingPoints(cx, cy, baseRadius, t);

  // Use constant smoothness
  const kappa = 0.5522847498;
  const theta = 2 * Math.PI / numPoints;

  ctx.beginPath();
  for (let i = 0; i < numPoints; i++) {
    const curr = points[i];
    const next = points[(i + 1) % numPoints];

    const avgR = (curr.r + next.r) / 2;
    const handleLen = avgR * kappa * theta * smoothness;

    const cp1 = getControlPoint(curr, curr.angle, handleLen);
    const cp2 = getControlPoint(next, next.angle, -handleLen);

    if (i === 0) ctx.moveTo(curr.x, curr.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, next.x, next.y);
  }
  ctx.closePath();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWeight;
  ctx.stroke();

  requestAnimationFrame(draw);
}
draw();
