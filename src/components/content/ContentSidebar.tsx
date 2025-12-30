"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { ContentNavItem } from "@/types/content";

interface ContentSidebarProps {
  title: string;
  items: ContentNavItem[];
  colorClass?: string;
}

export function ContentSidebar({ title, items, colorClass = "from-blue-500 to-cyan-500" }: ContentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200
                        dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass}`}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          </div>
          <nav className="space-y-1">
            {items.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all
                    ${
                      isActive
                        ? `bg-gradient-to-r ${colorClass} text-white shadow-md`
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                >
                  <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center
                                   rounded text-xs font-medium
                                   ${isActive
                                     ? "bg-white/20 text-white"
                                     : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
