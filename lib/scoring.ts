// src/lib/scoring.ts

export type ShotInput = { xMm: number; yMm: number };

export type ShotScore = {
  score: number;
  ring: number;
  isInnerTen: boolean;
};

/**
 * Simple circle-rings scoring.
 * You can calibrate ring radii to match the real 10m pistol target.
 */
export function scoreShot({ xMm, yMm }: ShotInput): ShotScore {
  const r = Math.sqrt(xMm * xMm + yMm * yMm);

  // example radii (fake numbers – replace with real spec)
  const ringStep = 10; // mm per ring, just example
  let ring = Math.max(0, 10.9 - (r / ringStep));
  ring = Math.round(ring*10)/10;

  const isInnerTen = r < 5; // inside tiny circle
  const score = ring; // or 10.3 based on r if you want decimal scoring

  return { score, ring, isInnerTen };
}
