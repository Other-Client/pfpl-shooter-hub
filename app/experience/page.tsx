"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function ExperienceContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
//   const gameId = searchParams.get("gameId");
  const gameId = "691c09f80db2cdf1dd52bae1";
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);
  const EXPERINCE_URL = "https://app.zimension3d.com/#/world"

  useEffect(() => {
    if (status === "loading") return;

    // Fetch the raw JWT token
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/auth/token');
        if (response.ok) {
          const data = await response.json();
          setRawToken(data.token);
          console.log("Raw JWT Token:", data.token);
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
    console.log("Iframe src:", src)
    setIframeSrc(src);
  }, [session, status, gameId, rawToken]);

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
        src={iframeSrc}
        allow={"xr-spatial-tracking; fullscreen"}
        sandbox="allow-scripts allow-same-origin allow-forms"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
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