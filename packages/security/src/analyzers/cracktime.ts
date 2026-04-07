export const SCENARIO_GPS: Record<string, number> = {
  'online (rate-limit)':     1e4,
  'offline (bcrypt/scrypt)': 1e10,
  'offline (sha256, GPU)':   1e12,
  'massive (cloud cracking)':1e13,
  'quantum (Grover)':        1e18,
};

export interface CrackTimeEstimate {
  scenario: string;
  guessesPerSecond: number;
  averageSeconds: number;
  worstSeconds: number;
  averageHuman: string;
  worstHuman: string;
}

const HEAT_DEATH_SECONDS = 60 * 60 * 24 * 365 * 1e17;

const UNITS: ReadonlyArray<[number, string]> = [
  [1,                              'second'],
  [60,                             'seconds'],
  [60 * 60,                        'minutes'],
  [60 * 60 * 24,                   'days'],
  [60 * 60 * 24 * 30,              'months'],
  [60 * 60 * 24 * 365,             'years'],
  [60 * 60 * 24 * 365 * 10,        'decades'],
  [60 * 60 * 24 * 365 * 100,       'centuries'],
  [HEAT_DEATH_SECONDS / 10,         'millennia'],
  [HEAT_DEATH_SECONDS,             'heat death of universe'],
];

function humanize(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 1) return 'instant';
  if (seconds >= HEAT_DEATH_SECONDS * 1e10) return 'beyond heat death of universe';
  for (let i = UNITS.length - 1; i >= 0; i--) {
    const unit = UNITS[i];
    if (!unit) continue;
    const [factor, name] = unit;
    if (seconds >= factor) {
      const v = seconds / factor;
      if (v < 0.05) return 'instant';
      const rounded = v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
      // Pluralize: 1 second, 2 seconds, 1 minute, 2 minutes, etc.
      if (rounded === 1) return name.replace(/s$/, '');
      return name.endsWith('s') ? `${rounded} ${name}` : `${rounded} ${name}s`;
    }
  }
  return 'instant';
}

export function estimateCrackTimes(poolSize: number, length: number): CrackTimeEstimate[] {
  if (poolSize <= 0 || length <= 0) return [];
  const total = Math.pow(poolSize, length);
  return Object.entries(SCENARIO_GPS).map(([scenario, gps]) => {
    const avg = total / 2 / gps;
    const worst = total / gps;
    return {
      scenario,
      guessesPerSecond: gps,
      averageSeconds: avg,
      worstSeconds: worst,
      averageHuman: humanize(avg),
      worstHuman: humanize(worst),
    };
  });
}

export function estimateCrackTimesFromBits(bits: number): CrackTimeEstimate[] {
  if (bits <= 0) return [];
  const total = Math.pow(2, bits);
  return Object.entries(SCENARIO_GPS).map(([scenario, gps]) => {
    const avg = total / 2 / gps;
    const worst = total / gps;
    return {
      scenario,
      guessesPerSecond: gps,
      averageSeconds: avg,
      worstSeconds: worst,
      averageHuman: humanize(avg),
      worstHuman: humanize(worst),
    };
  });
}
