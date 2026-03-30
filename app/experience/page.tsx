"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

function ExperienceContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId") ?? "691c09f80db2cdf1dd52bae1";
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const experienceUrl = "https://dev-app.zimension3d.com/#/world-guest";

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    const fetchToken = async () => {
      try {
        const response = await fetch("/api/auth/token");
        if (response.ok) {
          const data = await response.json();
          setRawToken(data.token);
        } else {
          console.error("Failed to fetch token");
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();

    if (!gameId) {
      return;
    }

    const src = rawToken
      ? `${experienceUrl}/${gameId}?appauth=${rawToken}`
      : `${experienceUrl}/${gameId}`;
    setIframeSrc(src);
  }, [status, gameId, rawToken]);

  function postMessageToIframe(message: any) {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.contentWindow?.postMessage(message, "*");
    }
  }

  useEffect(() => {
    if (!rawToken) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "REQUEST_AUTH") {
        postMessageToIframe({ type: "AUTH_TOKEN", token: rawToken });
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [rawToken]);

  if (status === "loading") {
    return <div className="experience-message">Loading experience...</div>;
  }

  if (!gameId) {
    return <div className="experience-message">Game ID is required.</div>;
  }

  if (!iframeSrc) {
    return <div className="experience-message">Preparing experience...</div>;
  }

  return (
    <div className="experience-shell">
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        allow="xr-spatial-tracking; autoplay; fullscreen; gamepad; pointer-lock"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-presentation allow-top-navigation-by-user-activation"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Game Experience"
      />
    </div>
  );
}

export default function ExperiencePage() {
  return (
    <Suspense fallback={<div className="experience-message">Loading...</div>}>
      <ExperienceContent />
    </Suspense>
  );
}
