import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "Chujai Legal — ชูใจ ลีกัล",
  description: "เรื่องกฎหมายไม่ต้องเป็นเรื่องยากอีกต่อไป — AI ช่วยวิเคราะห์สิทธิ บอกทุกขั้นตอน จนคุณทำเองได้",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={kanit.variable}>{children}</body>
    </html>
  );
}
