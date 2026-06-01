import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatMBA OSS",
  description: "Self-hostable MBA application workspace with SQLite and bring-your-own-model support."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
