import type { Metadata } from "next";
import "./globals.css";
import { ChatWidget } from "@/components/chat/chat-widget";

export const metadata: Metadata = {
  title: "焕美严选 - 品质好物，智能服务",
  description: "精选全球好物，AI智能推荐。7×24小时专属客服，让您购物无忧。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
