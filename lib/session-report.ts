type SessionLike = {
  _id: { toString(): string } | string;
  startedAt: Date | string;
  gunPreset: string;
  targetType: string;
  summary?: {
    totalScore?: number;
    averageScore?: number;
  } | null;
};

type ShotLike = {
  index: number;
  tsMs?: number;
  xMm: number;
  yMm: number;
  score: number;
  ring?: number;
  isInnerTen?: boolean;
};

type BuildSessionEmailReportInput = {
  session: SessionLike;
  shots: ShotLike[];
  shooterName?: string | null;
  recipientEmail?: string | null;
  sessionUrl?: string | null;
};

export type SessionEmailReport = ReturnType<typeof buildSessionEmailReport>;

export function formatSessionLabel(value: string) {
  return value.replace(/_/g, " ");
}

export function buildSessionEmailReport(
  input: BuildSessionEmailReportInput
) {
  const startedAt = new Date(input.session.startedAt);
  const referenceTime = startedAt.getTime();
  const shotCount = input.shots.length;
  const totalScore =
    input.session.summary?.totalScore ??
    input.shots.reduce((sum, shot) => sum + (shot.score || 0), 0);
  const averageScore =
    input.session.summary?.averageScore ??
    (shotCount > 0 ? totalScore / shotCount : 0);

  let avgX = 0;
  let avgY = 0;

  input.shots.forEach((shot) => {
    avgX += shot.xMm;
    avgY += shot.yMm;
  });

  if (shotCount > 0) {
    avgX /= shotCount;
    avgY /= shotCount;
  }

  let maxDist = 0;
  input.shots.forEach((shot) => {
    const dx = shot.xMm - avgX;
    const dy = shot.yMm - avgY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDist) {
      maxDist = distance;
    }
  });

  return {
    sessionId:
      typeof input.session._id === "string"
        ? input.session._id
        : input.session._id.toString(),
    shooterName: input.shooterName || null,
    recipientEmail: input.recipientEmail || null,
    startedAtLabel: new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(startedAt),
    gunPresetLabel: formatSessionLabel(input.session.gunPreset),
    targetTypeLabel: formatSessionLabel(input.session.targetType),
    sessionUrl: input.sessionUrl || null,
    summary: {
      totalScore: Number(totalScore || 0),
      averageScore: Number(averageScore || 0),
      shotCount,
      groupSizeMm: maxDist || 0,
      offsetXMm: shotCount ? avgX : 0,
      offsetYMm: shotCount ? avgY : 0,
      totalScoreLabel: Number(totalScore || 0).toFixed(1),
      averageScoreLabel: Number(averageScore || 0).toFixed(1),
      shotCountLabel: String(shotCount),
      groupSizeLabel: maxDist ? `${maxDist.toFixed(1)} mm` : "-",
      offsetLabel: shotCount
        ? `${avgX.toFixed(1)} mm / ${avgY.toFixed(1)} mm`
        : "-",
    },
    shots: input.shots.map((shot, index) => ({
      index: shot.index ?? index + 1,
      timeLabel:
        typeof shot.tsMs === "number"
          ? `${(Math.round((shot.tsMs - referenceTime) / 10) / 100).toFixed(2)} s`
          : "-",
      xLabel: `${shot.xMm.toFixed(1)} mm`,
      yLabel: `${shot.yMm.toFixed(1)} mm`,
      scoreLabel: shot.score.toFixed(1),
      ringLabel:
        typeof shot.ring === "number" ? String(shot.ring) : "-",
      innerTenLabel: shot.isInnerTen ? "Yes" : "No",
    })),
  };
}
