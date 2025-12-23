"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExperiencePage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const gameId = '123';searchParams.get("gameId");
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const EXPERINCE_URL = "https://app.zimension3d.com/#/world/691c09f80db2cdf1dd52bae1"

  useEffect(() => {
    if (status === "loading") return;
    let token = ''//session?.user.id
    // if (!session?.accessToken) {
    //   // Redirect to login or show error
    //   return;
    // }

    if (!gameId) {
      // Show error or redirect
    //   return;
    }

    // Assuming the iframe URL is something like this - adjust as needed
    const src = `${EXPERINCE_URL}?token=${token}&gameId=${gameId}`;
    setIframeSrc(src);
  }, [session, status, gameId]);

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