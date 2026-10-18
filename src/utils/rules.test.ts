import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDistance, formatPace, formatDuration, calculateCalories } from './formatters.ts';
import { calculateHiitState, DEFAULT_HIIT_CONFIG } from './hiitEngine.ts';
import { calculateHaversineDistance, calculateRouteDistance } from './geo.ts';

test('formatDistance handles meters and kilometers correctly', () => {
  assert.equal(formatDistance(500), '500 m');
  assert.equal(formatDistance(1000), '1,00 km');
  assert.equal(formatDistance(5440), '5,44 km');
});

test('formatPace outputs valid min/km notation', () => {
  assert.equal(formatPace(300), '5\'00"');
  assert.equal(formatPace(316), '5\'16"');
  assert.equal(formatPace(300, true), '5\'00" /km');
  assert.equal(formatPace(0), "--'--\"");
});

test('formatDuration formats minutes:seconds and hours:minutes:seconds', () => {
  assert.equal(formatDuration(45), '00:45');
  assert.equal(formatDuration(3551), '59:11');
  assert.equal(formatDuration(3665), '01:01:05');
});

test('calculateCalories computes accurate burn per sport', () => {
  assert.equal(calculateCalories(5000, 'run'), 340);
  assert.equal(calculateCalories(5000, 'walk'), 240);
  assert.equal(calculateCalories(5000, 'hiit'), 425);
});

test('calculateHiitState progresses through user sprint 30s and walk 30s', () => {
  const config = {
    warmupSeconds: 0,
    sprintSeconds: 30,
    recoverySeconds: 30,
    rounds: 25,
    cooldownSeconds: 0
  };

  // At 10s -> Round 1 Sprint with 20s remaining
  const s1 = calculateHiitState(10, config);
  assert.equal(s1.phase, 'sprint');
  assert.equal(s1.currentRound, 1);
  assert.equal(s1.phaseRemainingSeconds, 20);

  // At 35s -> Round 1 Recovery (Caminhada) with 25s remaining
  const s2 = calculateHiitState(35, config);
  assert.equal(s2.phase, 'recovery');
  assert.equal(s2.currentRound, 1);
  assert.equal(s2.phaseRemainingSeconds, 25);

  // At 65s -> Round 2 Sprint (Corrida) with 25s remaining
  const s3 = calculateHiitState(65, config);
  assert.equal(s3.phase, 'sprint');
  assert.equal(s3.currentRound, 2);
  assert.equal(s3.phaseRemainingSeconds, 25);

  // Total duration: 25 * 60s = 1500s. At 1500s -> completed
  const sFinal = calculateHiitState(1500, config);
  assert.equal(sFinal.phase, 'completed');
  assert.equal(sFinal.isComplete, true);
});

test('calculateHaversineDistance returns positive distance between distinct coordinates', () => {
  const p1 = { lat: -23.5874, lng: -46.6576 }; // Ibirapuera, SP
  const p2 = { lat: -23.5880, lng: -46.6580 };
  const dist = calculateHaversineDistance(p1, p2);
  assert.ok(dist > 50 && dist < 150);
});
