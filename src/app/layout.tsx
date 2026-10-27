import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DepositFlow — AICTE Security Deposit & FDR Compliance Portal",
  description: "Centralized FDR Lifecycle Management, Real-time Verification & Compliance Monitoring for AICTE Technical Institutions.",
  keywords: "FDR, Security Deposit, AICTE, Compliance, Regulatory, DepositFlow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans min-h-full`}
        style={{ background: '#0d1117', color: '#e6edf3' }}>
        {children}
      </body>
    </html>
  );
}
