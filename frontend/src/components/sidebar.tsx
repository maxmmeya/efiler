"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authService } from "@/lib/auth";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Users,
  CheckCircle,
  FileCheck,
  Share2,
  Building2,
  UserCog,
  Settings,
  GitBranch,
  FolderTree,
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
  permissions?: string[];
}

export function Sidebar() {
  const pathname = usePathname();
  const user = authService.getUser();

  const hasAccess = (item: MenuItem): boolean => {
    if (!item.roles && !item.permissions) return true;

    if (item.roles && item.roles.some(role => user?.roles?.includes(role))) {
      return true;
    }

    if (item.permissions && item.permissions.some(perm => user?.permissions?.includes(perm))) {
      return true;
    }

    return false;
  };

  // Define menu items based on user type
  const getMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [];

    // External User Menu
    if (user?.roles?.includes('ROLE_EXTERNAL_USER') || user?.roles?.includes('ROLE_EXTERNAL_INSTITUTIONAL')) {
      items.push(
        { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
        { name: 'New Submission', href: '/portal/submit', icon: Upload },
        { name: 'My Documents', href: '/portal/documents', icon: FileText },
        { name: 'Institutional Docs', href: '/portal/institutional-documents', icon: Building2 },
      );
    }

    // Back Office User Menu
    if (user?.roles?.includes('ROLE_BACK_OFFICE')) {
      items.push(
        { name: 'Dashboard', href: '/backoffice/dashboard', icon: LayoutDashboard },
        { name: 'Pending Approvals', href: '/backoffice/approvals', icon: CheckCircle },
        { name: 'Digital Signatures', href: '/backoffice/signatures', icon: FileCheck },
        { name: 'Share Documents', href: '/backoffice/share-document', icon: Share2 },
        { name: 'Document Types', href: '/backoffice/document-types', icon: FolderTree },
      );
    }

    // Administrator Menu
    if (user?.roles?.includes('ROLE_ADMINISTRATOR')) {
      items.push(
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'User Management', href: '/admin/users', icon: UserCog },
        { name: 'Institutions', href: '/admin/institutions', icon: Building2 },
        { name: 'Document Types', href: '/backoffice/document-types', icon: FolderTree },
        { name: 'Forms Management', href: '/admin/forms', icon: FileText },
        { name: 'Workflows', href: '/admin/workflows', icon: GitBranch },
        { name: 'System Settings', href: '/admin/settings', icon: Settings },
      );
    }

    return items.filter(hasAccess);
  };

  const menuItems = getMenuItems();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-primary-foreground">E-Filing System</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-300'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-800 p-4">
        <div className="text-xs text-gray-400">
          Logged in as
        </div>
        <div className="mt-1 text-sm font-medium truncate">{user?.username}</div>
        <div className="mt-1 text-xs text-gray-500 truncate">{user?.email}</div>
      </div>
    </div>
  );
}
