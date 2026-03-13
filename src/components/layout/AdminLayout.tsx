import { ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Sheet/Drawer for ALL screen sizes */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-col min-h-screen">
        <AdminHeader title={title} subtitle={subtitle}>
          {/* Hamburger menu button - Always visible */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 h-9 w-9 lg:h-10 lg:w-10"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
          </Button>
        </AdminHeader>
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
