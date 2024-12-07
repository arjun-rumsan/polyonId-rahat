"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Home,
  Users,
  DollarSign,
  Send,
  ChevronDown,
  ChevronRight,
  UserPlus,
  List,
} from "lucide-react";
import { useRouter } from "next/router";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  {
    name: "Beneficiaries",
    icon: Users,
    submenu: [
      { name: "Add", href: "/beneficiaries/add", icon: UserPlus },
      { name: "List", href: "/beneficiaries/list", icon: List },
    ],
  },
  { name: "Payouts", href: "/payouts", icon: DollarSign },
  { name: "Donate", href: "/donate", icon: Send },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleSubmenu = (name: string) => {
    setExpandedItem(expandedItem === name ? null : name);
  };

  return (
    <nav className="w-64 bg-white shadow-md h-full">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">Navigation</h2>
      </div>
      {
        <ul className="space-y-2 p-4">
          {navItems.map((item) => {
            const isActive = item.href
              ? pathname === item.href
              : item.submenu?.some((subItem) => pathname === subItem.href);
            const isExpanded = expandedItem === item.name;

            return (
              <li key={item.name}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`flex items-center justify-between w-full p-2 rounded-lg ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <ul className="ml-6 mt-2 space-y-2">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              className={`flex items-center space-x-3 p-2 rounded-lg ${
                                pathname === subItem.href
                                  ? "bg-blue-500 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <subItem.icon className="w-4 h-4" />
                              <span>{subItem.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      }
    </nav>
  );
}
