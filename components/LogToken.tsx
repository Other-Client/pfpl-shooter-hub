"use client";

import { useEffect } from "react";

export default function LogToken() {
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/auth/token");
        if (response.ok) {
          const data = await response.json();
          console.log("Raw JWT Token:", data.token);
        } else {
          console.error("Failed to fetch token");
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();
  }, []);

  return null;
}
