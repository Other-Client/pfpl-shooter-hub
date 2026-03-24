import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "PreciShot - VR Sports Shooting Simulator",
  description:
    "PreciShot is the VR training and analytics platform by Precihole Sports Foundation for shooters and coaches.",
  applicationName: "PreciShot",
  icons: {
    icon: ["/favicon.ico", "/favicon.png"],
    shortcut: ["/favicon.ico", "/favicon.png"],
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} theme-body`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
