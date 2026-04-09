import AWS from "aws-sdk";
import type { SessionEmailReport } from "@/lib/session-report";

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type WelcomeEmailInput = {
  to: string;
  name: string;
};

type PasswordResetEmailInput = {
  to: string;
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
};

type SessionReportEmailInput = {
  to: string;
  recipientName?: string | null;
  report: SessionEmailReport;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getEmailConfig() {
  const region = process.env.SES_REGION || process.env.AWS_REGION;
  const from = process.env.EMAIL_FROM || "support@pricishot.com";
  const replyTo = process.env.EMAIL_REPLY_TO || "support@pricishot.com";

  if (!region) {
    throw new Error("Missing required environment variable: SES_REGION");
  }

  return { region, from, replyTo };
}

function getAppBaseUrl() {
  const value = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL;
  return value ? value.replace(/\/+$/, "") : null;
}

function renderEmailShell(opts: {
  preheader: string;
  title: string;
  intro: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `
        <p style="margin:24px 0 0;">
          <a href="${escapeHtml(opts.ctaUrl)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#efbf04;color:#1b1400;text-decoration:none;font-weight:700;">
            ${escapeHtml(opts.ctaLabel)}
          </a>
        </p>
      `
      : "";

  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f5efe1;color:#151515;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
          ${escapeHtml(opts.preheader)}
        </div>
        <div style="max-width:680px;margin:0 auto;padding:32px 20px;">
          <div style="background:#0c0c0c;border-radius:20px;padding:24px 24px 20px;color:#f7f2e4;">
            <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#efbf04;margin-bottom:12px;">
              PreciShot
            </div>
            <h1 style="margin:0 0 12px;font-size:28px;line-height:1.05;color:#f7f2e4;">
              ${escapeHtml(opts.title)}
            </h1>
            <p style="margin:0;color:#d7d1c6;line-height:1.6;">
              ${escapeHtml(opts.intro)}
            </p>
            ${cta}
          </div>
          <div style="background:#fff;border-radius:18px;padding:24px;margin-top:16px;line-height:1.65;color:#151515;">
            ${opts.body}
          </div>
          <p style="margin:16px 4px 0;color:#6b6459;font-size:13px;line-height:1.6;">
            Sent by PreciShot. If you did not expect this email, you can ignore it.
          </p>
        </div>
      </body>
    </html>
  `;
}

async function sendMail(input: SendMailInput) {
  const { region, from, replyTo } = getEmailConfig();
  const ses = new AWS.SES({ region });

  await ses
    .sendEmail({
      Source: from,
      Destination: {
        ToAddresses: [input.to],
      },
      ReplyToAddresses: replyTo ? [replyTo] : undefined,
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: input.subject,
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: input.html,
          },
          Text: {
            Charset: "UTF-8",
            Data: input.text,
          },
        },
      },
    })
    .promise();
}

export async function sendWelcomeEmail(input: WelcomeEmailInput) {
  const appBaseUrl = getAppBaseUrl();
  const loginUrl = appBaseUrl ? `${appBaseUrl}/login` : undefined;
  const subject = "Welcome to PreciShot";
  const intro = `Your account is ready, ${input.name}.`;
  const body = `
    <p style="margin:0 0 16px;">
      Welcome to PreciShot. Your account has been created and you can now sign in to review sessions, exports, and performance trends.
    </p>
    <p style="margin:0;">
      Email: <strong>${escapeHtml(input.to)}</strong>
    </p>
  `;

  await sendMail({
    to: input.to,
    subject,
    html: renderEmailShell({
      preheader: "Your PreciShot account is ready.",
      title: "Welcome to PreciShot",
      intro,
      body,
      ctaLabel: loginUrl ? "Open PreciShot" : undefined,
      ctaUrl: loginUrl,
    }),
    text: [
      `Welcome to PreciShot, ${input.name}.`,
      "Your account is ready.",
      `Email: ${input.to}`,
      loginUrl ? `Login: ${loginUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function sendPasswordResetEmail(
  input: PasswordResetEmailInput
) {
  const subject = "Reset your PreciShot password";
  const body = `
    <p style="margin:0 0 16px;">
      We received a request to reset the password for <strong>${escapeHtml(
        input.to
      )}</strong>.
    </p>
    <p style="margin:0 0 16px;">
      Use the button below to set a new password. This link expires in ${
        input.expiresInMinutes
      } minutes.
    </p>
    <p style="margin:0;">
      If you did not request a reset, you can ignore this email.
    </p>
  `;

  await sendMail({
    to: input.to,
    subject,
    html: renderEmailShell({
      preheader: "Reset your PreciShot password.",
      title: "Reset your password",
      intro: `Choose a new password for your PreciShot account, ${input.name}.`,
      body,
      ctaLabel: "Reset password",
      ctaUrl: input.resetUrl,
    }),
    text: [
      `Reset your PreciShot password, ${input.name}.`,
      `Open this link to continue: ${input.resetUrl}`,
      `This link expires in ${input.expiresInMinutes} minutes.`,
    ].join("\n"),
  });
}

export async function sendSessionReportEmail(
  input: SessionReportEmailInput
) {
  const { report } = input;
  const subject = `PreciShot session report • ${report.startedAtLabel}`;
  const shotsPreview = report.shots
    .slice(0, 10)
    .map(
      (shot) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #ece6d7;">${shot.index}</td>
          <td style="padding:8px;border-bottom:1px solid #ece6d7;">${escapeHtml(
            shot.timeLabel
          )}</td>
          <td style="padding:8px;border-bottom:1px solid #ece6d7;">${escapeHtml(
            shot.xLabel
          )}</td>
          <td style="padding:8px;border-bottom:1px solid #ece6d7;">${escapeHtml(
            shot.yLabel
          )}</td>
          <td style="padding:8px;border-bottom:1px solid #ece6d7;">${escapeHtml(
            shot.scoreLabel
          )}</td>
        </tr>
      `
    )
    .join("");

  const body = `
    <p style="margin:0 0 16px;">
      Session report for <strong>${escapeHtml(
        report.shooterName || report.recipientEmail || "PreciShot shooter"
      )}</strong>.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:0 0 18px;">
      <div style="padding:14px;border-radius:14px;background:#faf6ea;">
        <div style="font-size:12px;color:#7d6941;text-transform:uppercase;letter-spacing:0.08em;">Total score</div>
        <div style="font-size:26px;font-weight:700;">${escapeHtml(
          report.summary.totalScoreLabel
        )}</div>
      </div>
      <div style="padding:14px;border-radius:14px;background:#faf6ea;">
        <div style="font-size:12px;color:#7d6941;text-transform:uppercase;letter-spacing:0.08em;">Average</div>
        <div style="font-size:26px;font-weight:700;">${escapeHtml(
          report.summary.averageScoreLabel
        )}</div>
      </div>
      <div style="padding:14px;border-radius:14px;background:#faf6ea;">
        <div style="font-size:12px;color:#7d6941;text-transform:uppercase;letter-spacing:0.08em;">Shots</div>
        <div style="font-size:26px;font-weight:700;">${escapeHtml(
          report.summary.shotCountLabel
        )}</div>
      </div>
      <div style="padding:14px;border-radius:14px;background:#faf6ea;">
        <div style="font-size:12px;color:#7d6941;text-transform:uppercase;letter-spacing:0.08em;">Group size</div>
        <div style="font-size:26px;font-weight:700;">${escapeHtml(
          report.summary.groupSizeLabel
        )}</div>
      </div>
    </div>
    <p style="margin:0 0 12px;">
      <strong>Started:</strong> ${escapeHtml(report.startedAtLabel)}<br />
      <strong>Gun preset:</strong> ${escapeHtml(report.gunPresetLabel)}<br />
      <strong>Target type:</strong> ${escapeHtml(report.targetTypeLabel)}<br />
      <strong>Offset:</strong> ${escapeHtml(report.summary.offsetLabel)}
    </p>
    <table style="width:100%;border-collapse:collapse;margin-top:18px;font-size:14px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #d8c79a;">#</th>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #d8c79a;">Time</th>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #d8c79a;">X</th>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #d8c79a;">Y</th>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #d8c79a;">Score</th>
        </tr>
      </thead>
      <tbody>${shotsPreview}</tbody>
    </table>
    ${
      report.shots.length > 10
        ? `<p style="margin:12px 0 0;color:#6b6459;">Showing first 10 of ${report.shots.length} shots.</p>`
        : ""
    }
  `;

  await sendMail({
    to: input.to,
    subject,
    html: renderEmailShell({
      preheader: `Session report for ${report.startedAtLabel}.`,
      title: "Session report",
      intro: `A PreciShot report has been prepared for ${
        input.recipientName || report.shooterName || "you"
      }.`,
      body,
      ctaLabel: report.sessionUrl ? "Open session" : undefined,
      ctaUrl: report.sessionUrl || undefined,
    }),
    text: [
      "PreciShot session report",
      `Started: ${report.startedAtLabel}`,
      `Gun preset: ${report.gunPresetLabel}`,
      `Target type: ${report.targetTypeLabel}`,
      `Total score: ${report.summary.totalScoreLabel}`,
      `Average: ${report.summary.averageScoreLabel}`,
      `Shots: ${report.summary.shotCountLabel}`,
      `Group size: ${report.summary.groupSizeLabel}`,
      `Offset: ${report.summary.offsetLabel}`,
      report.sessionUrl ? `Open session: ${report.sessionUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export { getAppBaseUrl };
