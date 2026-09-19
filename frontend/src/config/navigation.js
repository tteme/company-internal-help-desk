import {
  LayoutDashboard,
  ClipboardList,
  GitBranch,
  Users,
  Building2,
  Tags,
  Timer,
  Clock3,
  BarChart3,
  ShieldCheck,
  Settings,
} from "lucide-react";

export const navigation = {
  EMPLOYEE: [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      section: "Main",
    },
    {
      label: "My Requests",
      path: "/requests",
      icon: ClipboardList,
      section: "Main",
    },
  ],

  DEPARTMENT_OFFICER: [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      section: "Main",
    },
    {
      label: "Requests",
      path: "/requests",
      icon: ClipboardList,
      section: "Main",
    },
  ],

  DEPARTMENT_HEAD: [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      section: "Main",
    },
    {
      label: "Requests",
      path: "/requests",
      icon: ClipboardList,
      section: "Main",
    },
    {
      label: "Escalations",
      path: "/escalations",
      icon: GitBranch,
      section: "Management",
    },
  ],

  ADMIN: [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      section: "Main",
    },
    {
      label: "Requests",
      path: "/requests",
      icon: ClipboardList,
      section: "Main",
    },
    {
      label: "Users",
      path: "/users",
      icon: Users,
      section: "Administration",
    },
    {
      label: "Branches",
      path: "/branches",
      icon: GitBranch,
      section: "Administration",
    },
    {
      label: "Departments",
      path: "/departments",
      icon: Building2,
      section: "Administration",
    },
    {
      label: "Categories",
      path: "/categories",
      icon: Tags,
      section: "Administration",
    },
    {
      label: "SLA Policies",
      path: "/sla",
      icon: Timer,
      section: "Configuration",
    },
    {
      label: "Business Hours",
      path: "/business-hours",
      icon: Clock3,
      section: "Configuration",
    },
    {
      label: "Reports",
      path: "/reports",
      icon: BarChart3,
      section: "Reporting",
    },
  ],

  SYSTEM_ADMINISTRATOR: [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      section: "Main",
    },
    {
      label: "Requests",
      path: "/requests",
      icon: ClipboardList,
      section: "Main",
    },
    {
      label: "Users",
      path: "/users",
      icon: Users,
      section: "Administration",
    },
    {
      label: "Roles & Permissions",
      path: "/roles-permissions",
      icon: ShieldCheck,
      section: "Administration",
    },
    {
      label: "System Settings",
      path: "/settings",
      icon: Settings,
      section: "Configuration",
    },
    {
      label: "Reports",
      path: "/reports",
      icon: BarChart3,
      section: "Reporting",
    },
  ],
};
