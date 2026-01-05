"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Search,
  Settings,
  FolderOpen,
  Bell,
  Calendar,
  Users,
  BarChart3,
  Building2,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Search", href: "/search", icon: Search },
  { name: "Timeline", href: "/timeline", icon: Calendar },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const categories = [
  { name: "Architecture", color: "#3B82F6", icon: Building2 },
  { name: "Civil", color: "#10B981", icon: FolderOpen },
  { name: "Electrical", color: "#F59E0B", icon: FolderOpen },
  { name: "Mechanical", color: "#EF4444", icon: FolderOpen },
  { name: "Structure", color: "#8B5CF6", icon: FolderOpen },
  { name: "Landscape", color: "#22C55E", icon: FolderOpen },
  { name: "Scenography", color: "#06B6D4", icon: FolderOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-gray-50 dark:bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-lg font-bold">PGI-IA</h1>
          <p className="text-xs text-gray-500">Centre Culturel Kahnawake</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Categories */}
        <div className="mt-8">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/documents?category=${category.name}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t p-4">
        <Link
          href="/notifications"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Bell className="h-5 w-5" />
          Notifications
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
