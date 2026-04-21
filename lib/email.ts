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

type VerificationEmailInput = {
  to: string;
  name: string;
  verifyUrl: string;
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
  const from = process.env.EMAIL_FROM || "support@precishot.com";
  const replyTo = process.env.EMAIL_REPLY_TO || "support@precishot.com";
  const accessKeyId = process.env.SES_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SES_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (!region) {
    throw new Error("Missing required environment variable: SES_REGION");
  }

  return { region, from, replyTo, accessKeyId, secretAccessKey };
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
  const baseUrl = getAppBaseUrl();
  const logoUrl = baseUrl ? `${baseUrl}/logo.png` : null;

  const logoImg = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="PreciShot" width="48" height="48" style="display:block;border-radius:10px;margin-bottom:14px;" />`
    : "";

  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `
        <p style="margin:28px 0 0;">
          <a href="${escapeHtml(opts.ctaUrl)}"
             style="display:inline-block;padding:14px 28px;border-radius:999px;background:#efbf04;color:#1b1400;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.02em;">
            ${escapeHtml(opts.ctaLabel)}
          </a>
        </p>
      `
      : "";

  return `
    <!doctype html>
    <html lang="en">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
      <body style="margin:0;padding:0;background:#f0ead8;color:#151515;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;">
          ${escapeHtml(opts.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ead8;padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                <!-- Header card -->
                <tr>
                  <td style="background:#0c0c0c;border-radius:20px 20px 0 0;padding:32px 36px 28px;">
                    ${logoImg}
                    <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#efbf04;margin-bottom:10px;font-weight:600;">
                      PreciShot
                    </div>
                    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.1;color:#f7f2e4;font-weight:700;">
                      ${escapeHtml(opts.title)}
                    </h1>
                    <p style="margin:0;color:#b8b0a2;line-height:1.65;font-size:15px;">
                      ${escapeHtml(opts.intro)}
                    </p>
                    ${cta}
                  </td>
                </tr>

                <!-- Body card -->
                <tr>
                  <td style="background:#ffffff;border-radius:0 0 20px 20px;padding:28px 36px 32px;line-height:1.7;color:#2a2a2a;font-size:15px;">
                    ${opts.body}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 4px 0;color:#8a7f72;font-size:12px;line-height:1.6;text-align:center;">
                    Sent by PreciShot &mdash; Precihole Sports Foundation.<br />
                    If you did not expect this email, you can safely ignore it.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function sendMail(input: SendMailInput) {
  const { region, from, replyTo, accessKeyId, secretAccessKey } = getEmailConfig();
  const ses = new AWS.SES({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });

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

export async function sendVerificationEmail(input: VerificationEmailInput) {
  const subject = "Verify your PreciShot account";

  const body = `
    <p style="margin:0 0 18px;">
      Thanks for signing up. To activate your account, click the button above — the link is valid for <strong>24 hours</strong>.
    </p>
    <p style="margin:0 0 18px;">
      If the button doesn't work, copy and paste this URL into your browser:
    </p>
    <p style="margin:0;word-break:break-all;">
      <a href="${escapeHtml(input.verifyUrl)}" style="color:#b8860b;">${escapeHtml(input.verifyUrl)}</a>
    </p>
    <hr style="margin:24px 0;border:none;border-top:1px solid #ede8dc;" />
    <p style="margin:0;color:#6b6459;font-size:13px;">
      If you did not create a PreciShot account, no action is needed.
    </p>
  `;

  await sendMail({
    to: input.to,
    subject,
    html: renderEmailShell({
      preheader: "Verify your email to activate your PreciShot account.",
      title: "Confirm your email",
      intro: `One step left, ${input.name}. Verify your email address to start using PreciShot.`,
      body,
      ctaLabel: "Verify email address",
      ctaUrl: input.verifyUrl,
    }),
    text: [
      `Hi ${input.name},`,
      "",
      "Verify your PreciShot account by opening this link:",
      input.verifyUrl,
      "",
      "This link expires in 24 hours.",
      "If you did not sign up, ignore this email.",
    ].join("\n"),
  });
}

export async function sendWelcomeEmail(input: WelcomeEmailInput) {
  const appBaseUrl = getAppBaseUrl();
  const loginUrl = appBaseUrl ? `${appBaseUrl}/login` : undefined;

  const body = `
    <p style="margin:0 0 18px;">
      Your account is verified and ready to go. Sign in to start tracking sessions, reviewing exports, and monitoring performance trends.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-radius:12px;overflow:hidden;background:#faf6ea;margin:0 0 18px;">
      <tr>
        <td style="padding:16px 20px;">
          <div style="font-size:12px;color:#7d6941;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Signed in as</div>
          <div style="font-size:15px;font-weight:600;color:#1a1a1a;">${escapeHtml(input.to)}</div>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#6b6459;font-size:13px;">
      Need help? Reply to this email and we'll get back to you.
    </p>
  `;

  await sendMail({
    to: input.to,
    subject: "Welcome to PreciShot — your account is ready",
    html: renderEmailShell({
      preheader: "Your PreciShot account is verified and ready.",
      title: "Welcome to PreciShot",
      intro: `You're all set, ${input.name}.`,
      body,
      ctaLabel: loginUrl ? "Open PreciShot" : undefined,
      ctaUrl: loginUrl,
    }),
    text: [
      `Welcome to PreciShot, ${input.name}.`,
      "",
      "Your account has been verified and is ready to use.",
      `Email: ${input.to}`,
      loginUrl ? `Sign in: ${loginUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  const body = `
    <p style="margin:0 0 18px;">
      We received a request to reset the password for <strong>${escapeHtml(input.to)}</strong>.
    </p>
    <p style="margin:0 0 18px;">
      Click the button above to set a new password. This link expires in <strong>${input.expiresInMinutes} minutes</strong>.
    </p>
    <p style="margin:0 0 18px;word-break:break-all;">
      Or paste this URL into your browser:<br />
      <a href="${escapeHtml(input.resetUrl)}" style="color:#b8860b;">${escapeHtml(input.resetUrl)}</a>
    </p>
    <hr style="margin:24px 0;border:none;border-top:1px solid #ede8dc;" />
    <p style="margin:0;color:#6b6459;font-size:13px;">
      If you did not request a password reset, ignore this email — your password will not change.
    </p>
  `;

  await sendMail({
    to: input.to,
    subject: "Reset your PreciShot password",
    html: renderEmailShell({
      preheader: "Reset your PreciShot password.",
      title: "Reset your password",
      intro: `Choose a new password for your PreciShot account, ${input.name}.`,
      body,
      ctaLabel: "Reset password",
      ctaUrl: input.resetUrl,
    }),
    text: [
      `Hi ${input.name},`,
      "",
      "Reset your PreciShot password by opening this link:",
      input.resetUrl,
      "",
      `This link expires in ${input.expiresInMinutes} minutes.`,
      "If you did not request a reset, ignore this email.",
    ].join("\n"),
  });
}

export async function sendSessionReportEmail(input: SessionReportEmailInput) {
  const { report } = input;
  const subject = `PreciShot session report • ${report.startedAtLabel}`;
  const shotsPreview = report.shots
    .slice(0, 10)
    .map(
      (shot) => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #ece6d7;">${shot.index}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #ece6d7;">${escapeHtml(shot.timeLabel)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #ece6d7;">${escapeHtml(shot.xLabel)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #ece6d7;">${escapeHtml(shot.yLabel)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #ece6d7;">${escapeHtml(shot.scoreLabel)}</td>
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
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:8px;margin:0 0 18px;">
      <tr>
        <td style="padding:14px 16px;border-radius:12px;background:#faf6ea;width:25%;">
          <div style="font-size:11px;color:#7d6941;text-transform:uppercase;letter-spacing:0.08em;">Total score</div>
          <div style="font-size:24px;font-weight:700;">${escapeHtml(report.summary.totalScoreLabel)}</div>
        </td>
        <td style="padding:14px 16px;border-radius:12px;background:#faf6ea;width:25%;">
          <div style="font-size:11px;color:#7d6941;text-transform:uppercase;letter-spacing:0.08em;">Average</div>
          <div style="font-size:24px;font-weight:700;">${escapeHtml(report.summary.averageScoreLabel)}</div>
        </td>
        <td style="padding:14px 16px;border-radius:12px;background:#faf6ea;width:25%;">
          <div style="font-size:11px;color:#7d6941;text-transform:uppercase;letter-spacing:0.08em;">Shots</div>
          <div style="font-size:24px;font-weight:700;">${escapeHtml(report.summary.shotCountLabel)}</div>
        </td>
        <td style="padding:14px 16px;border-radius:12px;background:#faf6ea;width:25%;">
          <div style="font-size:11px;color:#7d6941;text-transform:uppercase;letter-spacing:0.08em;">Group size</div>
          <div style="font-size:24px;font-weight:700;">${escapeHtml(report.summary.groupSizeLabel)}</div>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 14px;font-size:14px;color:#4a4a4a;">
      <strong>Started:</strong> ${escapeHtml(report.startedAtLabel)}<br />
      <strong>Gun preset:</strong> ${escapeHtml(report.gunPresetLabel)}<br />
      <strong>Target type:</strong> ${escapeHtml(report.targetTypeLabel)}<br />
      <strong>Offset:</strong> ${escapeHtml(report.summary.offsetLabel)}
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#faf6ea;">
          <th style="text-align:left;padding:10px;border-bottom:2px solid #d8c79a;">#</th>
          <th style="text-align:left;padding:10px;border-bottom:2px solid #d8c79a;">Time</th>
          <th style="text-align:left;padding:10px;border-bottom:2px solid #d8c79a;">X</th>
          <th style="text-align:left;padding:10px;border-bottom:2px solid #d8c79a;">Y</th>
          <th style="text-align:left;padding:10px;border-bottom:2px solid #d8c79a;">Score</th>
        </tr>
      </thead>
      <tbody>${shotsPreview}</tbody>
    </table>
    ${
      report.shots.length > 10
        ? `<p style="margin:12px 0 0;color:#6b6459;font-size:13px;">Showing first 10 of ${report.shots.length} shots.</p>`
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
