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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
