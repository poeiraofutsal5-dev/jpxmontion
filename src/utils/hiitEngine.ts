/**
 * HIIT Interval State Management and calculations for JPX MOTION
 */

export type HiitPhase = 'warmup' | 'sprint' | 'recovery' | 'cooldown' | 'completed';

export interface HiitConfig {
  warmupSeconds: number; // 0 if user wants to start directly with sprint
  sprintSeconds: number; // e.g. 30s run
  recoverySeconds: number; // e.g. 30s walk
  rounds: number; // e.g. 25 rounds
  cooldownSeconds: number; // e.g. 0s
}

export interface HiitState {
  phase: HiitPhase;
  currentRound: number;
  totalRounds: number;
  phaseRemainingSeconds: number;
  phaseTotalSeconds: number;
  totalElapsedSeconds: number;
  isComplete: boolean;
}

export const DEFAULT_HIIT_CONFIG: HiitConfig = {
  warmupSeconds: 0, // Inicia direto no primeiro tiro de corrida conforme rotina do atleta
  sprintSeconds: 30, // 30 segundos correndo forte
  recoverySeconds: 30, // 30 segundos andando de recuperação
  rounds: 25, // 25 tiros alternados
  cooldownSeconds: 0
};

/**
 * Calculates current HIIT state given total elapsed seconds
 */
export function calculateHiitState(elapsedSeconds: number, config: HiitConfig = DEFAULT_HIIT_CONFIG): HiitState {
  if (elapsedSeconds < 0) elapsedSeconds = 0;

  const totalRounds = Math.max(1, config.rounds || 1);
  const sprintSec = Math.max(5, config.sprintSeconds || 30);
  const recoverySec = Math.max(0, config.recoverySeconds || 0);
  const warmupSec = Math.max(0, config.warmupSeconds || 0);
  const cooldownSec = Math.max(0, config.cooldownSeconds || 0);

  let remaining = elapsedSeconds;

  // 1. Warmup (if any configured)
  if (warmupSec > 0) {
    if (remaining < warmupSec) {
      return {
        phase: 'warmup',
        currentRound: 1,
        totalRounds,
        phaseRemainingSeconds: warmupSec - remaining,
        phaseTotalSeconds: warmupSec,
        totalElapsedSeconds: elapsedSeconds,
        isComplete: false
      };
    }
    remaining -= warmupSec;
  }

  // 2. Interval rounds: Corro sprintSec -> Ando recoverySec
  for (let r = 1; r <= totalRounds; r++) {
    // Sprint phase (Corrida)
    if (remaining < sprintSec) {
      return {
        phase: 'sprint',
        currentRound: r,
        totalRounds,
        phaseRemainingSeconds: sprintSec - remaining,
        phaseTotalSeconds: sprintSec,
        totalElapsedSeconds: elapsedSeconds,
        isComplete: false
      };
    }
    remaining -= sprintSec;

    // Recovery phase (Caminhada)
    if (recoverySec > 0 && (r < totalRounds || recoverySec > 0)) {
      if (remaining < recoverySec) {
        return {
          phase: 'recovery',
          currentRound: r,
          totalRounds,
          phaseRemainingSeconds: recoverySec - remaining,
          phaseTotalSeconds: recoverySec,
          totalElapsedSeconds: elapsedSeconds,
          isComplete: false
        };
      }
      remaining -= recoverySec;
    }
  }

  // 3. Cooldown (if any)
  if (cooldownSec > 0) {
    if (remaining < cooldownSec) {
      return {
        phase: 'cooldown',
        currentRound: totalRounds,
        totalRounds,
        phaseRemainingSeconds: cooldownSec - remaining,
        phaseTotalSeconds: cooldownSec,
        totalElapsedSeconds: elapsedSeconds,
        isComplete: false
      };
    }
  }

  // 4. Completed all rounds
  return {
    phase: 'completed',
    currentRound: totalRounds,
    totalRounds,
    phaseRemainingSeconds: 0,
    phaseTotalSeconds: 0,
    totalElapsedSeconds: elapsedSeconds,
    isComplete: true
  };
}

/**
 * Web Audio sound synthesizers for countdown and phase transitions
 */
export function playWorkoutTone(type: 'beep' | 'start' | 'phase_sprint' | 'phase_rest' | 'complete') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'beep': // short 880Hz alert beep
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;

      case 'phase_sprint': // energetic high beep
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'phase_rest': // calm alert for walking
        osc.frequency.setValueAtTime(783.99, now); // G5
        osc.frequency.setValueAtTime(523.25, now + 0.15); // C5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'start':
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'complete':
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.15);
        osc.frequency.setValueAtTime(659.25, now + 0.3);
        osc.frequency.setValueAtTime(880, now + 0.45);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
    }
  } catch {
    // AudioContext blocked by browser policy before interaction
  }
}
