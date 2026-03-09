export const dynamic = "force-dynamic";

import { access } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Crosshair,
  Download,
  Eye,
  Monitor,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

const LANDING_ASSET_DIR = "assets/landing";
const LANDING_ASSETS = {
  hero: `/${LANDING_ASSET_DIR}/hero-vr-player.jpg`,
  dashboard: `/${LANDING_ASSET_DIR}/laptop-dashboard.jpg`,
  vrView: `/${LANDING_ASSET_DIR}/vr-view2.jpg`,
} as const;

const FOUNDATION_DETAILS = {
  name: "Precihole Foundation",
  website: "https://www.preciholefoundation.org/",
  phone: "+91 9152732446",
  email: "precihole.foundation@gmail.com",
  correspondenceOffice:
    "A-272, Road 16A, Wagle Estate, Thane (W) 400604, Maharashtra, India",
  registeredOffice:
    "524 Bhoomi Industrial Estate, Pimpalghar Ranjnoli, Bhiwandi - Kalyan Road, Thane, Maharashtra, India 421311",
} as const;

const featureCards: Array<{
  icon: LucideIcon;
  title: string;
  body: string;
}> = [
  {
    icon: Target,
    title: "Shot-by-shot precision",
    body: "Each VR shot is recorded with score, impact position, and session context so review starts from real data, not memory.",
  },
  {
    icon: BarChart3,
    title: "Heatmaps and grouping",
    body: "Spot spread, drift, and consistency patterns quickly with session summaries designed for coaching review.",
  },
  {
    icon: Monitor,
    title: "Gameplay plus analytics",
    body: "Show the athlete what happened in the run and pair it with a dashboard view that explains why it happened.",
  },
  {
    icon: Download,
    title: "Coach-ready exports",
    body: "Session details stay easy to archive, share, and revisit after practice or evaluation rounds.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Enter the platform",
    body: "Shooters and coaches log into PreciShot before the VR range session begins.",
  },
  {
    step: "02",
    title: "Train inside VR",
    body: "The athlete focuses on the drill while the platform captures shot outcome and session structure in the background.",
  },
  {
    step: "03",
    title: "Review the session",
    body: "Heatmaps, grouping, offsets, and score details turn the run into a clean performance breakdown.",
  },
  {
    step: "04",
    title: "Keep the record",
    body: "The finished session can be revisited later for coaching notes, athlete tracking, and exported reporting.",
  },
];

const audienceCards = [
  {
    title: "Shooters",
    body: "Understand how each run develops across the session instead of relying only on a final score.",
  },
  {
    title: "Coaches",
    body: "Use grouping and heatmap review to explain technical corrections with clear visual evidence.",
  },
  {
    title: "Academies",
    body: "Keep session history organized across training cycles, evaluation days, and athlete progress reviews.",
  },
];

const analyticsHighlights = [
  {
    title: "Session overview",
    body: "See the full run with total score, shot count, and grouping context in one view.",
  },
  {
    title: "Impact analysis",
    body: "Review center hold, spread, and heat density without manually plotting every hit.",
  },
  {
    title: "Actionable review",
    body: "Turn one VR session into something an athlete can understand and a coach can immediately act on.",
  },
];

const productStory = [
  {
    label: "VR session capture",
    text: "The product bridges live VR practice and structured post-session review.",
  },
  {
    label: "Performance dashboard",
    text: "Gameplay, scores, and shot patterning live together instead of across separate tools.",
  },
  {
    label: "Training memory",
    text: "Every session becomes an archive you can revisit when performance trends matter.",
  },
];

async function resolveLandingAsset(assetSrc: string): Promise<string | null> {
  try {
    await access(path.join(process.cwd(), "public", assetSrc.replace(/^\//, "")));
    return assetSrc;
  } catch {
    return null;
  }
}

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const isAuthed = Boolean(token);
  const currentYear = new Date().getFullYear();

  if (isAuthed) {
    redirect("/dashboard");
  }

  const [heroImageSrc, dashboardImageSrc, vrViewImageSrc] = await Promise.all([
    resolveLandingAsset(LANDING_ASSETS.hero),
    resolveLandingAsset(LANDING_ASSETS.dashboard),
    resolveLandingAsset(LANDING_ASSETS.vrView),
  ]);

  return (
    <main className="theme-shell landing-shell">
      <div className="page-container">
        <header className="site-header landing-header">
          <BrandMark href="/" subtitle="Performance Hub" />

          <nav className="nav-row nav-row--landing">
            <a href="#product" className="nav-link">
              Product
            </a>
            <a href="#analytics" className="nav-link">
              Analytics
            </a>
            <a href="#workflow" className="nav-link">
              Workflow
            </a>
            <a href="#audience" className="nav-link">
              Who It&apos;s For
            </a>
            <Link href="/login" className="button button-primary button-small">
              Login
            </Link>
          </nav>
        </header>

        <section className="hero-stage">
          <div className="landing-copy hero-copy">
            <div className="page-heading">
              <p className="eyebrow">VR shooting analytics platform</p>
              <h1 className="display-title landing-title">
                See every VR session like a coach in the room.
              </h1>
            </div>

            <p className="muted-copy landing-copy__lead">
              PreciShot turns immersive range practice into a reviewable
              performance record. Athletes get gameplay context, coaches get
              heatmaps and grouping, and the academy gets a clean session trail
              built for follow-up.
            </p>

            <div className="hero-actions">
              <Link href="/login" className="button button-primary">
                Login to PreciShot
              </Link>
              <a href="#workflow" className="button button-secondary">
                See how it works
              </a>
            </div>
          </div>

          <div className="hero-showcase panel">
            <div className="hero-showcase__frame">
              {heroImageSrc ? (
                <Image
                  src={heroImageSrc}
                  alt="Shooter wearing a VR headset while playing the training session"
                  width={1920}
                  height={1080}
                  className="hero-showcase__image"
                  priority
                />
              ) : (
                <div className="hero-showcase__placeholder">
                  <p className="hero-showcase__placeholder-title">VR range visual</p>
                  <p className="hero-showcase__placeholder-copy">
                    Add the hero image to public/assets/landing/hero-vr-player.jpg and this section
                    will render it automatically.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="hero-metrics hero-metrics--landing">
            <div className="metric-card">
              <div className="metric-card__label">Live capture</div>
              <div className="metric-card__value">VR shot sync</div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">Performance review</div>
              <div className="metric-card__value">Heatmaps + grouping</div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">Range archive</div>
              <div className="metric-card__value">Exportable sessions</div>
            </div>
          </div>
        </section>

        <section className="story-strip" id="product">
          {productStory.map((item) => (
            <article className="story-card" key={item.label}>
              <p className="story-card__label">{item.label}</p>
              <p className="story-card__text">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="landing-section landing-section--split" id="analytics">
          <div className="section-heading section-heading--stacked">
            <p className="eyebrow">Performance loop</p>
            <h2 className="section-title">
              VR training becomes a session you can actually review.
            </h2>
            <p className="muted-copy">
              PreciShot connects the moment of practice to the analysis needed
              after the run. Instead of losing the session once the headset
              comes off, you keep a breakdown that is ready for athlete feedback
              and coach discussion.
            </p>
          </div>

          <div className="analytics-stack">
            {dashboardImageSrc ? (
              <article className="panel analytics-media">
                <div className="analytics-media__copy">
                  <p className="eyebrow">Web app review</p>
                  <h3 className="section-title section-title--small">
                    Session tracking on the dashboard
                  </h3>
                  <p className="muted-copy">
                    Players and coaches can move from VR to the web app without
                    losing the thread of the session. Scores, grouping, and
                    review details stay visible in one place.
                  </p>
                </div>
                <div className="analytics-media__frame">
                  <Image
                    src={dashboardImageSrc}
                    alt="Laptop dashboard showing web app session details and performance tracking"
                    width={1600}
                    height={1000}
                    className="analytics-media__image"
                  />
                </div>
              </article>
            ) : null}

            <div className="panel analytics-panel">
              <div className="analytics-panel__header">
                <p className="eyebrow">Inside one session</p>
                <h3 className="section-title section-title--small">
                  What the platform helps you review
                </h3>
              </div>

              <div className="insight-list">
                {analyticsHighlights.map((item) => (
                  <div className="insight-item" key={item.title}>
                    <p className="insight-item__title">{item.title}</p>
                    <p className="insight-item__copy">{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="analytics-panel__footer">
                <div className="analytics-pill">
                  <span>Gameplay view</span>
                  <span>Session summary</span>
                </div>
                <div className="analytics-pill">
                  <span>Shot density</span>
                  <span>Coach feedback</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section" id="features">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Core experience</p>
              <h2 className="section-title">
                Built to explain performance clearly after every run.
              </h2>
            </div>
            <p className="muted-copy">
              Everything needed to understand a session stays in one platform,
              from shot capture to post-session exports.
            </p>
          </div>

          <div className="feature-card-grid">
            {featureCards.map(({ icon: Icon, title, body }) => (
              <article className="feature-card" key={title}>
                <div className="feature-card__icon">
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="feature-card__title">{title}</h3>
                <p className="feature-card__body">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section" id="workflow">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Workflow</p>
              <h2 className="section-title">
                From headset session to dashboard insight in four steps.
              </h2>
            </div>
            <p className="muted-copy">
              The process stays simple enough for the range floor and structured
              enough for follow-up once the session is complete.
            </p>
          </div>

          {vrViewImageSrc ? (
            <article className="panel workflow-visual">
              <div className="workflow-visual__copy">
                <p className="eyebrow">Inside VR</p>
                <h3 className="section-title section-title--small">
                  Competition gameplay stays connected to the review flow
                </h3>
                <p className="muted-copy">
                  The athlete competes inside the VR environment while the
                  session is captured for the later breakdown on the web app.
                </p>
              </div>
              <div className="workflow-visual__frame">
                <Image
                  src={vrViewImageSrc}
                  alt="VR competition gameplay view from inside the shooting session"
                  width={1600}
                  height={900}
                  className="workflow-visual__image"
                />
              </div>
            </article>
          ) : null}

          <div className="workflow-grid">
            {workflowSteps.map((item) => (
              <article className="workflow-card" key={item.step}>
                <div className="workflow-card__step">{item.step}</div>
                <h3 className="workflow-card__title">{item.title}</h3>
                <p className="workflow-card__body">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section" id="audience">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Who it serves</p>
              <h2 className="section-title">
                Made for the people who run and improve the session.
              </h2>
            </div>
            <p className="muted-copy">
              The same session data stays useful for self-review, coach
              analysis, and academy record keeping across the full training
              ecosystem.
            </p>
          </div>

          <div className="audience-grid">
            {audienceCards.map((item, index) => {
              const icons = [Crosshair, Eye, Users];
              const Icon = icons[index] ?? Shield;

              return (
                <article className="audience-card" key={item.title}>
                  <div className="audience-card__icon">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <h3 className="audience-card__title">{item.title}</h3>
                  <p className="audience-card__body">{item.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="cta-banner">
          <div>
            <p className="eyebrow">Ready to enter the platform</p>
            <h2 className="section-title cta-banner__title">
              Bring shooters into VR training and make every session reviewable.
            </h2>
            <p className="muted-copy cta-banner__copy">
              Log in to review sessions, track improvement, and keep the range
              connected from VR drill to performance archive.
            </p>
          </div>

          <div className="cta-banner__actions">
            <Link href="/login" className="button button-primary">
              Login
            </Link>
            <a href="#analytics" className="button button-ghost">
              See analytics
            </a>
          </div>
        </section>

        <footer className="site-footer">
          <div className="site-footer__grid">
            <div className="site-footer__brand">
              <p className="site-footer__brand-title">PreciShot</p>
              <p className="site-footer__brand-subtitle">Performance Hub</p>
              <p className="site-footer__copy">
                PreciShot is owned by{" "}
                <a href={FOUNDATION_DETAILS.website} className="text-link">
                  {FOUNDATION_DETAILS.name}
                </a>
                , which focuses on target shooting sports, armed forces, and
                police support initiatives.
              </p>
            </div>

            <div className="site-footer__group">
              <p className="site-footer__label">Foundation</p>
              <div className="site-footer__links">
                <a href={FOUNDATION_DETAILS.website} className="site-footer__link">
                  Official website
                </a>
                <a href="#analytics" className="site-footer__link">
                  Analytics
                </a>
                <a href="#workflow" className="site-footer__link">
                  Workflow
                </a>
              </div>
            </div>

            <div className="site-footer__group">
              <p className="site-footer__label">Contact</p>
              <div className="site-footer__links">
                <a
                  href={`mailto:${FOUNDATION_DETAILS.email}`}
                  className="site-footer__link"
                >
                  {FOUNDATION_DETAILS.email}
                </a>
                <a
                  href={`tel:${FOUNDATION_DETAILS.phone.replace(/\s+/g, "")}`}
                  className="site-footer__link"
                >
                  {FOUNDATION_DETAILS.phone}
                </a>
              </div>
              <p className="site-footer__text">
                {FOUNDATION_DETAILS.correspondenceOffice}
              </p>
            </div>

            <div className="site-footer__group">
              <p className="site-footer__label">Registered Office</p>
              <p className="site-footer__text">
                {FOUNDATION_DETAILS.registeredOffice}
              </p>
            </div>
          </div>

          <div className="site-footer__bottom">
            <p className="site-footer__meta">
              &copy; {currentYear} PreciShot. Product ownership:{" "}
              {FOUNDATION_DETAILS.name}.
            </p>
            <a href="/login" className="site-footer__link">
              Platform Login
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
