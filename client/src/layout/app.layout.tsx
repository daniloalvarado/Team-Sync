import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/auth-provider";
import Asidebar from "@/components/asidebar/asidebar";
import Header from "@/components/header";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";

const AppLayout = () => {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Asidebar />
        {/* 1. SidebarInset ocupa toda la pantalla y no deja hacer scroll general */}
        <SidebarInset className="h-screen flex flex-col overflow-hidden w-full">
          
          {/* 2. El Header se queda quieto arriba (fuera del scroll) */}
          <Header />

          {/* 3. Main es el ÚNICO que hace scroll (overflow-y-auto) */}
          <main className="flex-1 overflow-y-auto w-full bg-background">
            <div className="px-3 lg:px-20 py-3">
              <Outlet />
            </div>
          </main>

          <CreateWorkspaceDialog />
          <CreateProjectDialog />
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AppLayout;