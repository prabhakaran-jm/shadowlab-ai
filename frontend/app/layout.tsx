import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShadowLab",
  description: "Chaos Engineering for AI APIs",
};

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0f0f12] text-zinc-100 font-sans text-base">
        {children}
      </body>
    </html>
  );
}
