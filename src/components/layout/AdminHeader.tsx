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
    toast.success("Déconnexion réussie");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {children}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un produit, client..."
              className="w-64 pl-10 bg-secondary/50 border-transparent focus:border-primary"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse-soft">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Alertes
                <Badge variant="secondary">{unreadCount} nouvelles</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.read ? "bg-accent/50" : ""}`}
                >
                  <span className="font-medium text-sm">{notification.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{notification.message}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center text-primary font-medium" onClick={() => navigate("/notifications")}>
                Voir toutes les alertes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{`${currentUser.prenom || ""} ${currentUser.nom || ""}`.trim() || "Utilisateur"}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {currentUser.role === "admin" ? "Administrateur" : "Vendeur"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
