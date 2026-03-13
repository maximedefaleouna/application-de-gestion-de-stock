import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { notificationService, authService } from "@/services/api.service";
import { toast } from "sonner";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AdminHeader({ title, subtitle, children }: AdminHeaderProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getAll();
      setNotifications((response.data || []).slice(0, 4));
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    authService.logout();
    toast.success("Deconnexion reussie");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-3 sm:px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between w-full max-w-[100vw] overflow-hidden">
        {/* Left Section - Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {children}
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
          {/* Search - Desktop Only */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="w-48 xl:w-64 pl-10 bg-secondary/50 border-transparent focus:border-primary text-sm"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-destructive text-destructive-foreground text-[10px] sm:text-xs rounded-full flex items-center justify-center animate-pulse-soft">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 sm:w-80 max-w-[90vw]">
              <DropdownMenuLabel className="flex items-center justify-between" inset={false}>
                Alertes
                <Badge variant="secondary">{unreadCount} nouvelles</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.read ? "bg-accent/50" : ""}`} inset={false}                >
                  <span className="font-medium text-sm">{notification.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{notification.message}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center text-primary font-medium" onClick={() => navigate("/notifications")} inset={false}>
                Voir toutes les alertes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 h-9 sm:h-10">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate max-w-[120px] xl:max-w-none">{`${currentUser.prenom || ""} ${currentUser.nom || ""}`.trim() || "Utilisateur"}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground capitalize truncate">{currentUser.role === "admin" ? "Administrateur" : "Vendeur"}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-w-[90vw]">
              <DropdownMenuLabel inset={false}>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")} inset={false}>
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout} inset={false}>
                Déconnexion  
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
