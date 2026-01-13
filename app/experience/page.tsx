"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";

function ExperienceContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
//   const gameId = searchParams.get("gameId");
  const gameId = "691c09f80db2cdf1dd52bae1";
  // const gameId = "6965c0278217c54420eb6363";
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);
  const EXPERINCE_URL = "https://app.zimension3d.com/#/world-guest"

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  useEffect(() => {
    if (status === "loading") return;

    // Fetch the raw JWT token
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/auth/token');
        if (response.ok) {
          const data = await response.json();
          setRawToken(data.token);
          // console.log("Raw JWT Token:", data.token);
        } else {
          console.error("Failed to fetch token");
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();

    if (!gameId) {
      // Show error or redirect
      return;
    }

    // Assuming the iframe URL is something like this - adjust as needed
    const src = rawToken
      ? `${EXPERINCE_URL}/${gameId}?appauth=${rawToken}`
      : `${EXPERINCE_URL}/${gameId}`;
    // console.log("Iframe src:", src)
    setIframeSrc(src);
    
  }, [session, status, gameId, rawToken]);
  function postMessageToIframe (message: any) {
    const iframe = iframeRef.current;
    if(iframe)
    iframe.contentWindow?.postMessage(message, "*");
  };

  useEffect(() => {
    
    // console.log("Raw token:", rawToken);
    if(!rawToken) return
    // postMessageToIframe({ type: "IFRAME_QUERY", auth: rawToken })
    const onMessage = (event: MessageEvent) => {
      // Safety checks: origin and source
      // if (event.origin !== IFRAME_ORIGIN) return;
      // if (event.source !== iframeRef.current?.contentWindow) return;

      // Respond to the iframe asking for auth
      if (event.data?.type === "REQUEST_AUTH") {
        postMessageToIframe({ type: "AUTH_TOKEN", token: rawToken });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [rawToken]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  



//   if (!session) {
//     return <div>Please log in to access the experience.</div>;
//   }

  if (!gameId) {
    return <div>Game ID is required.</div>;
  }

  if (!iframeSrc) {
    return <div>Preparing experience...</div>;
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
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
    <Suspense fallback={<div>Loading...</div>}>
      <ExperienceContent />
    </Suspense>
  );
}