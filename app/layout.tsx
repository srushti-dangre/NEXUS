import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "./components/SocketProvider";

export const metadata: Metadata = {
  title: "NEXUS — Market Intelligence",
  description: "Real-Time Market Intelligence Terminal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&family=JetBrains+Mono:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}