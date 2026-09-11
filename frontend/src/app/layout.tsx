import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIH 2026 - Chartering Engine",
  description: "Intelligent Freight Forecasting and Optimization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
