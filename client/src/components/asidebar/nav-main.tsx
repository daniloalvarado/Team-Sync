"use client";

import {
  LucideIcon,
  Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar, // 1. IMPORTAR ESTO
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";

type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export function NavMain() {
  const { hasPermission } = useAuthContext();
  
  // 2. OBTENER EL CONTROL DEL SIDEBAR
  const { setOpenMobile, isMobile, state } = useSidebar();

  const canManageSettings = hasPermission(
    Permissions.MANAGE_WORKSPACE_SETTINGS
  );

  const workspaceId = useWorkspaceId();
  const location = useLocation();

  const pathname = location.pathname;

  const items: ItemType[] = [
    {
      title: "Panel de Control",
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      title: "Tareas",
      url: `/workspace/${workspaceId}/tasks`,
      icon: CheckCircle,
    },
    {
      title: "Miembros",
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    },

    ...(canManageSettings
      ? [
          {
            title: "Configuración",
            url: `/workspace/${workspaceId}/settings`,
            icon: Settings,
          },
        ]
      : []),
  ];
  return (
    <SidebarGroup className={state === "collapsed" ? "my-2" : ""}>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={item.url === pathname}
              asChild
              // 3. AGREGAR ESTO: Si es móvil, cierra el menú al hacer click
              onClick={() => isMobile && setOpenMobile(false)}
              tooltip={item.title}
            >
              <Link to={item.url} className="!text-[15px]">
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}