"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Bot,
  BarChart3,
  Database,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/products", label: "产品管理", icon: Package },
  { href: "/agents", label: "AI 员工", icon: Bot },
  { href: "/analytics", label: "数据洞察", icon: BarChart3 },
  { href: "/data-sources", label: "数据源", icon: Database },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="min-h-screen bg-apple-gray-4 flex">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
              fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-apple-gray-3 flex flex-col
              transform transition-transform duration-300 ease-in-out
              lg:translate-x-0 lg:static lg:z-auto
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <div className="px-6 py-5 border-b border-apple-gray-3 flex items-center justify-between">
              <Link
                href="/dashboard"
                className="text-lg font-semibold text-apple-gray-1 tracking-tight"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="block">焕美严选</span>
                <span className="block text-xs font-normal tracking-wider text-apple-gray-2">HUANMEI</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-apple-gray-2 hover:text-apple-gray-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <NavItems onClick={() => setSidebarOpen(false)} />
            </nav>
            <div className="px-3 py-4 border-t border-apple-gray-3">
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-apple-gray-2 hover:bg-apple-gray-4 hover:text-apple-gray-1 transition-colors"
              >
                <Settings className="w-5 h-5" />
                返回官网
              </a>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile header */}
            <header className="h-14 bg-white border-b border-apple-gray-3 flex items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-2 text-apple-gray-2 hover:text-apple-gray-1"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <HeaderTitle />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-apple-gray-2">Admin</span>
              </div>
            </header>
            <main className="p-4 md:p-6 lg:p-8">
              <div className="max-w-[1280px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

function NavItems({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              isActive
                ? "bg-hermes-orange-pale text-hermes-orange font-medium"
                : "text-apple-gray-2 hover:bg-apple-gray-4 hover:text-apple-gray-1"
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function HeaderTitle() {
  const pathname = usePathname();
  const label =
    navItems.find(
      (item) =>
        pathname === item.href || pathname.startsWith(item.href + "/")
    )?.label || "";
  return <div className="text-sm text-apple-gray-2 hidden sm:block">{label}</div>;
}
