import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShadowLab",
  description: "Chaos Engineering for AI APIs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
