import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CervicalLens - AI Cervical Cancer Screening",
  description:
    "AI-powered cervical cancer screening platform. Review flagged Pap smear slides and provide diagnostic confirmation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,300..800;1,300..800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
