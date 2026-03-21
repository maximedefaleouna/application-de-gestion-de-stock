import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  ShoppingCart,
  Package,
  CreditCard,
  Settings,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { notificationService } from "@/services/api.service";
import { toast } from "sonner";

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  sale: {
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "bg-primary/10 text-primary",
  },
  stock: {
    icon: <Package className="w-5 h-5" />,
    color: "bg-warning/10 text-warning",
  },
  credit: {
    icon: <CreditCard className="w-5 h-5" />,
    color: "bg-destructive/10 text-destructive",
  },
  system: {
    icon: <Settings className="w-5 h-5" />,
    color: "bg-info/10 text-info",
  },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getAll();
      setNotifications(response.data || []);
      console.log('🔔 Notifications chargées:', response.data?.length || 0);
    } catch (error: any) {
      console.error('Erreur chargement notifications:', error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur de chargement des notifications",
      );
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Rafraîchir toutes les 10 secondes
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      toast.error("Impossible de marquer comme lu");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch {
      toast.error("Impossible de marquer toutes les notifications comme lues");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification supprimée");
    } catch {
      toast.error("Impossible de supprimer la notification");
    }
  };

  const createTestNotification = async () => {
    try {
      // Créer une notification de test via l'API
      const response = await fetch('/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          type: 'systeme',
          titre: '🧪 Test de notification',
          message: `Ceci est un test créé à ${new Date().toLocaleString('fr-FR')}`,
        }),
      });
      
      if (response.ok) {
        toast.success('Notification de test créée !');
        await loadNotifications(); // Rafraîchir
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la création');
      }
    } catch (error: any) {
      console.error('Erreur création test:', error);
      toast.error('Impossible de créer la notification de test');
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === activeTab);
  }, [activeTab, notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AdminLayout
      title="Alertes & Notifications"
      subtitle="Restez informé des événements importants"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(typeConfig).map(([type, config]) => {
          const count = notifications.filter((n) => n.type === type).length;
          return (
            <Card key={type} className="p-4 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}
              >
                {config.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {type === "sale"
                    ? "Ventes"
                    : type === "stock"
                      ? "Stock"
                      : type === "credit"
                        ? "Crédits"
                        : "Système"}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Toutes les alertes
          </h2>
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount} non lues</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={createTestNotification}
            asChild={false}
          >
            🧪 Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            asChild={false}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Tout marquer lu
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="unread">Non lues</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="credit">Crédits</TabsTrigger>
          <TabsTrigger value="sale">Ventes</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucune alerte</p>
          </Card>
        ) : (
          filteredNotifications.map((notification, index) => (
            <Card
              key={notification.id}
              className={`p-4 animate-slide-up transition-all ${!notification.read ? "border-l-4 border-l-primary bg-accent/30" : ""}`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig[notification.type]?.color || typeConfig.system.color}`}
                >
                  {typeConfig[notification.type]?.icon ||
                    typeConfig.system.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => markAsRead(notification.id)}
                        asChild={false}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Marquer lu
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => deleteNotification(notification.id)}
                      asChild={false}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
