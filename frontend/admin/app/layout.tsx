"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  BookOpen,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ToastContainer } from "@/components/ui";
import { API_CONFIG } from "@/lib/config";

const navItems = [
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/analytics", label: "数据洞察", icon: BarChart3 },
  { href: "/products", label: "产品管理", icon: Package },
  { href: "/wiki", label: "知识库", icon: BookOpen },
  { href: "/agents", label: "AI 员工", icon: Bot },
  { href: "/data-sources", label: "数据源", icon: Database },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-apple-gray-4 flex">
      <ToastContainer />
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
          transition-transform duration-300
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-apple-gray-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-base md:text-lg font-semibold text-apple-gray-1 tracking-tight"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="block">焕美严选</span>
            <span className="block text-[10px] md:text-xs font-normal tracking-wider text-apple-gray-2">HUANMEI</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-apple-gray-2 hover:text-apple-gray-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-2 md:px-3 py-3 md:py-4 space-y-0.5 md:space-y-1 overflow-y-auto">
          <NavItems onClick={() => setSidebarOpen(false)} />
        </nav>
        <div className="px-2 md:px-3 py-3 md:py-4 border-t border-apple-gray-3 space-y-0.5 md:space-y-1">
          <a
            href={API_CONFIG.WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm text-apple-gray-2 hover:bg-apple-gray-4 hover:text-apple-gray-1 transition-colors"
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">返回官网</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm text-apple-gray-2 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">退出登录</span>
          </button>
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
            <span className="text-sm text-apple-gray-2">{user?.name || "Admin"}</span>
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-[1280px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
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
            className={`flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm transition-colors ${
              isActive
                ? "bg-hermes-orange-pale text-hermes-orange font-medium"
                : "text-apple-gray-2 hover:bg-apple-gray-4 hover:text-apple-gray-1"
            }`}
          >
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
            <span className="truncate">{item.label}</span>
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
