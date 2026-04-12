import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sierra 企業客服 AI",
  description: "企業級智能客服系統 - FAQ機器人、多輪對話、儀表板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">{children}</body>
    </html>
  );
}
