import api from "../lib/api";

export interface LoginData {
  email: string;
  motDePasse: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: "admin" | "vendeur";
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

const extractPayload = <T>(payload: any): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
};

const withMappedData = <T>(raw: any, data: T) => {
  if (raw && typeof raw === "object") return { ...raw, data };
  return { data };
};

const toFrontendRole = (role: string) => (role === "vendeur" ? "seller" : role);
const toBackendRole = (role: string) => (role === "seller" ? "vendeur" : role);

const toFrontendPayment = (mode: string) => {
  const map: Record<string, string> = {
    espece: "cash",
    carte: "card",
    mobile_money: "mobile_money",
    credit: "credit",
    cash: "cash",
    card: "card",
  };
  return map[mode] || "cash";
};

const toBackendPayment = (mode: string) => {
  const map: Record<string, string> = {
    cash: "espece",
    card: "carte",
    mobile_money: "mobile_money",
    credit: "credit",
    espece: "espece",
    carte: "carte",
  };
  return map[mode] || "espece";
};

const toFrontendStatus = (status: string) => {
  const map: Record<string, string> = {
    completee: "completed",
    partielle: "partial",
    annulee: "cancelled",
    credit: "credit",
    completed: "completed",
    partial: "partial",
    cancelled: "cancelled",
  };
  return map[status] || "completed";
};

const toBackendStatus = (status: string) => {
  const map: Record<string, string> = {
    completed: "completee",
    partial: "partielle",
    cancelled: "annulee",
    credit: "credit",
    completee: "completee",
    partielle: "partielle",
    annulee: "annulee",
  };
  return map[status] || "completee";
};

const toFrontendNotificationType = (type: string) => {
  const map: Record<string, string> = {
    vente: "sale",
    stock: "stock",
    credit: "credit",
    systeme: "system",
    sale: "sale",
    system: "system",
  };
  return map[type] || "system";
};

const resolveAssetUrl = (value: string | undefined | null) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  const apiOrigin = apiBase.replace(/\/api\/v1\/?$/, "");
  return `${apiOrigin}${value.startsWith("/") ? value : `/${value}`}`;
};

const mapBackendProductToFrontend = (product: any) => ({
  id: product?.id,
  name: product?.nom || product?.name || "",
  reference: product?.reference || "",
  description: product?.description || "",
  category: product?.categorie?.nom || product?.category || "",
  brand: product?.marque || product?.brand || "",
  compatibleVehicles: Array.isArray(product?.compatibleVehicles) ? product.compatibleVehicles : [],
  buyPrice: Number(product?.buyPrice || 0),
  sellPrice: Number(product?.prixVente || product?.sellPrice || 0),
  stock: Number(product?.stock || 0),
  minStock: Number(product?.stockMin || product?.minStock || 0),
  imageUrl: resolveAssetUrl(product?.imageUrl || ""),
  available: product?.disponible ?? product?.available ?? true,
});

const mapBackendClientToFrontend = (client: any) => ({
  id: client?.id,
  name: client?.nom || client?.name || "",
  phone: client?.telephone || client?.phone || "",
  email: client?.email,
  address: client?.adresse || client?.address,
  totalCredit: Number(client?.totalCredit || 0),
  totalPaid: Number(client?.totalPaye || client?.totalPaid || 0),
  createdAt: new Date(client?.createdAt || client?.creeLe || new Date()),
  nom: client?.nom,
  telephone: client?.telephone,
});

const mapBackendSaleToFrontend = (sale: any) => ({
  id: sale?.id,
  items: (sale?.articles || sale?.items || []).map((article: any) => ({
    productId: article?.produitId || article?.productId,
    productName: article?.produit?.nom || article?.productName || "Produit",
    quantity: Number(article?.quantite || article?.quantity || 0),
    unitPrice: Number(article?.prixUnitaire || article?.unitPrice || 0),
    imageUrl: article?.produit?.imageUrl,
  })),
  totalAmount: Number(sale?.montantTotal || sale?.totalAmount || 0),
  paidAmount: Number(sale?.montantPaye || sale?.paidAmount || 0),
  remainingAmount: Number(sale?.montantRestant || sale?.remainingAmount || 0),
  paymentMethod: toFrontendPayment(sale?.modePaiement || sale?.paymentMethod || "espece"),
  status: toFrontendStatus(sale?.statut || sale?.status || "completee"),
  clientId: sale?.clientId,
  clientName: sale?.client?.nom || sale?.clientName,
  clientPhone: sale?.client?.telephone || sale?.clientPhone,
  isCredit: Boolean(sale?.estCredit ?? sale?.isCredit),
  seller: sale?.vendeur ? `${sale.vendeur.prenom || ""} ${sale.vendeur.nom || ""}`.trim() : sale?.seller || "N/A",
  createdAt: new Date(sale?.createdAt || new Date()),
  updatedAt: new Date(sale?.updatedAt || sale?.createdAt || new Date()),
  montantTotal: Number(sale?.montantTotal || sale?.totalAmount || 0),
  montantPaye: Number(sale?.montantPaye || sale?.paidAmount || 0),
  montantRestant: Number(sale?.montantRestant || sale?.remainingAmount || 0),
  statut: sale?.statut || toBackendStatus(sale?.status || "completed"),
  modePaiement: sale?.modePaiement || toBackendPayment(sale?.paymentMethod || "cash"),
  estCredit: Boolean(sale?.estCredit ?? sale?.isCredit),
  articles: sale?.articles,
  client: sale?.client,
  vendeur: sale?.vendeur,
});

const mapBackendUserToFrontend = (user: any) => ({
  id: user?.id,
  firstName: user?.prenom || user?.firstName || "",
  lastName: user?.nom || user?.lastName || "",
  name: `${user?.prenom || ""} ${user?.nom || ""}`.trim() || user?.name || "",
  email: user?.email,
  phone: user?.telephone,
  role: toFrontendRole(user?.role),
  avatar: user?.avatar,
  active: user?.actif ?? user?.active ?? true,
  createdAt: new Date(user?.creeLe || user?.createdAt || new Date()),
  lastLogin: user?.derniereConnexion ? new Date(user.derniereConnexion) : undefined,
});

const mapBackendNotificationToFrontend = (notification: any) => ({
  id: notification?.id,
  type: toFrontendNotificationType(notification?.type),
  title: notification?.titre,
  message: notification?.message,
  read: Boolean(notification?.lu),
  createdAt: new Date(notification?.createdAt || new Date()),
});

export const authService = {
  login: async (data: LoginData) => {
    const response = await api.post<ApiResponse<{ token: string; utilisateur: any }>>("/auth/login", data);
    if (response.data?.success) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.utilisateur));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getProfile: async () => {
    const response = await api.get<ApiResponse<any>>("/auth/me");
    const profile = extractPayload<any>(response.data);
    return withMappedData(response.data, mapBackendUserToFrontend(profile));
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.put<ApiResponse<any>>("/auth/change-password", { oldPassword, newPassword });
    return response.data;
  },
  createUser: async (data: RegisterData | any) => {
    const payload = { ...data, role: data?.role ? toBackendRole(data.role) : data?.role };
    const response = await api.post<ApiResponse<any> | { data: any }>("/auth/admin/create-user", payload);
    const user = extractPayload<any>(response.data);
    return withMappedData(response.data, mapBackendUserToFrontend(user));
  },
  getUsers: async () => {
    const response = await api.get<ApiResponse<any[]> | { data: any[] }>("/auth/admin/users");
    const users = extractPayload<any[]>(response.data) || [];
    return withMappedData(response.data, users.map(mapBackendUserToFrontend));
  },
  updateUser: async (id: string, data: Partial<RegisterData> | any) => {
    const payload = { ...data, role: data?.role ? toBackendRole(data.role) : data?.role };
    const response = await api.put<ApiResponse<any> | { data: any }>(`/auth/${id}`, payload);
    const user = extractPayload<any>(response.data);
    return withMappedData(response.data, mapBackendUserToFrontend(user));
  },
  deleteUser: async (id: string) => {
    const response = await api.delete<ApiResponse<any>>(`/auth/admin/users/${id}`);
    return response.data;
  },
};

export const produitService = {
  getAll: async (params?: { categorieId?: string; disponible?: boolean; search?: string }) => {
    const response = await api.get<ApiResponse<any[]> | { data: any[] }>("/produits", { params });
    const products = extractPayload<any[]>(response.data) || [];
    return withMappedData(response.data, products.map(mapBackendProductToFrontend));
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<any> | { data: any }>(`/produits/${id}`);
    const product = extractPayload<any>(response.data);
    return withMappedData(response.data, mapBackendProductToFrontend(product));
  },
  create: async (data: FormData | any) => {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const response = await api.post<ApiResponse<any> | { data: any }>(
      "/produits",
      data,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined,
    );
    const product = extractPayload<any>(response.data);
    return withMappedData(response.data, product ? mapBackendProductToFrontend(product) : product);
  },
  update: async (id: string, data: any) => {
    const response = await api.put<ApiResponse<any> | { data: any }>(`/produits/${id}`, data);
    const product = extractPayload<any>(response.data);
    return withMappedData(response.data, product ? mapBackendProductToFrontend(product) : product);
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<any>>(`/produits/${id}`);
    return response.data;
  },
  getLowStock: async () => {
    const response = await api.get<ApiResponse<any[]> | { data: any[] }>("/produits/stock/alertes");
    const products = extractPayload<any[]>(response.data) || [];
    return withMappedData(response.data, products.map(mapBackendProductToFrontend));
  },
};

export const clientService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<any[]> | { data: any[] }>("/clients");
    const clients = extractPayload<any[]>(response.data) || [];
    return withMappedData(response.data, clients.map(mapBackendClientToFrontend));
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<any> | { data: any }>(`/clients/${id}`);
    const client = extractPayload<any>(response.data);
    return withMappedData(response.data, mapBackendClientToFrontend(client));
  },
  create: async (data: any) => {
    const payload = {
      nom: data?.nom || data?.name,
      telephone: data?.telephone || data?.phone,
      email: data?.email,
      adresse: data?.adresse || data?.address,
    };
    const response = await api.post<ApiResponse<any> | { data: any }>("/clients", payload);
    const client = extractPayload<any>(response.data);
    return withMappedData(response.data, mapBackendClientToFrontend(client));
  },
  update: async (id: string, data: any) => {
    const payload = {
      nom: data?.nom || data?.name,
      telephone: data?.telephone || data?.phone,
      email: data?.email,
      adresse: data?.adresse || data?.address,
    };
    const response = await api.put<ApiResponse<any> | { data: any }>(`/clients/${id}`, payload);
    const client = extractPayload<any>(response.data);
    return withMappedData(response.data, mapBackendClientToFrontend(client));
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<any> | { data: any }>(`/clients/${id}`);
    return response.data;
  },
  getClientsWithCredit: async () => {
    const response = await api.get<ApiResponse<any[]> | { data: any[] }>("/clients/credits");
    const clients = extractPayload<any[]>(response.data) || [];
    return withMappedData(response.data, clients.map(mapBackendClientToFrontend));
  },
};

export const venteService = {
  getAll: async (params?: any) => {
    const response = await api.get<ApiResponse<any[]> | { data: any[] }>("/ventes", { params });
    const ventes = extractPayload<any[]>(response.data) || [];
    return withMappedData(response.data, ventes.map(mapBackendSaleToFrontend));
  },
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<any> | { data: any }>(`/ventes/${id}`);
    const vente = extractPayload<any>(response.data);
    return withMappedData(response.data, mapBackendSaleToFrontend(vente));
  },
  create: async (data: any) => {
    const payload = data?.items
      ? {
          montantTotal: Math.round(data.totalAmount || 0),
          montantPaye: Math.round(data.paidAmount || 0),
          modePaiement: toBackendPayment(data.paymentMethod || "cash"),
          statut: toBackendStatus(data.status || (data.isCredit ? "credit" : "completed")),
          clientId: data.clientId || null,
          estCredit: Boolean(data.isCredit),
          articles: (data.items || []).map((item: any) => ({
            produitId: item.productId,
            quantite: Number(item.quantity || 0),
            prixUnitaire: Math.round(item.unitPrice || 0),
          })),
        }
      : {
          ...data,
          modePaiement: toBackendPayment(data.modePaiement || data.paymentMethod || "cash"),
          statut: toBackendStatus(data.statut || data.status || "completed"),
        };

    const response = await api.post<ApiResponse<any> | { data: any }>("/ventes", payload);
    const vente = extractPayload<any>(response.data);
    return withMappedData(response.data, mapBackendSaleToFrontend(vente));
  },
  update: async (id: string, data: any) => {
    const payload = {
      ...data,
      modePaiement: toBackendPayment(data.modePaiement || data.paymentMethod || "cash"),
      statut: toBackendStatus(data.statut || data.status || "completed"),
    };
    const response = await api.put<ApiResponse<any> | { data: any }>(`/ventes/${id}`, payload);
    const vente = extractPayload<any>(response.data);
    return withMappedData(response.data, mapBackendSaleToFrontend(vente));
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<any> | { data: any }>(`/ventes/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get<ApiResponse<any> | { data: any }>("/ventes/stats");
    return response.data;
  },
};

export const categorieService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<any[]> | { data: any[] }>("/categories");
    return response.data;
  },
  create: async (data: { nom: string; description: string }) => {
    const response = await api.post<ApiResponse<any> | { data: any }>("/categories", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put<ApiResponse<any> | { data: any }>(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<any> | { data: any }>(`/categories/${id}`);
    return response.data;
  },
};

export const configurationService = {
  get: async () => {
    const response = await api.get<ApiResponse<any> | { data: any }>("/configuration");
    return response.data;
  },
  save: async (data: any) => {
    const response = await api.post<ApiResponse<any> | { data: any }>("/configuration", data);
    return response.data;
  },
};

export const notificationService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<any[]> | { data: any[] }>("/notifications");
    const notifications = extractPayload<any[]>(response.data) || [];
    return withMappedData(response.data, notifications.map(mapBackendNotificationToFrontend));
  },
  getUnread: async () => {
    const response = await api.get<ApiResponse<any[]> | { data: any[] }>("/notifications/non-lues");
    const notifications = extractPayload<any[]>(response.data) || [];
    return withMappedData(response.data, notifications.map(mapBackendNotificationToFrontend));
  },
  markAsRead: async (id: string) => {
    const response = await api.put<ApiResponse<any> | { data: any }>(`/notifications/${id}/lire`);
    const notification = extractPayload<any>(response.data);
    return withMappedData(response.data, mapBackendNotificationToFrontend(notification));
  },
  markAllAsRead: async () => {
    const response = await api.put<ApiResponse<any> | { data: any }>("/notifications/tout-lire");
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<any> | { data: any }>(`/notifications/${id}`);
    return response.data;
  },
};

export const mouvementStockService = {
  getAll: async (params?: { produitId?: string; type?: "entree" | "sortie" | "ajustement" }) => {
    const response = await api.get<ApiResponse<any[]> | { data: any[] }>("/mouvements-stock", { params });
    const movements = extractPayload<any[]>(response.data) || [];
    const mapped = movements.map((movement) => ({
      id: movement.id,
      productId: movement.produitId,
      productName: movement.produit?.nom || "Produit",
      type: movement.type === "entree" ? "in" : movement.type === "sortie" ? "out" : "adjustment",
      quantity: Number(movement.quantite || 0),
      reason: movement.motif || "",
      date: new Date(movement.date || new Date()),
      userName: movement.utilisateur
        ? `${movement.utilisateur.prenom || ""} ${movement.utilisateur.nom || ""}`.trim()
        : "",
    }));
    return withMappedData(response.data, mapped);
  },
  create: async (data: { productId: string; type: "in" | "out" | "adjustment"; quantity: number; reason: string }) => {
    const payload = {
      produitId: data.productId,
      type: data.type === "in" ? "entree" : data.type === "out" ? "sortie" : "ajustement",
      quantite: Number(data.quantity),
      motif: data.reason,
    };
    const response = await api.post<ApiResponse<any> | { data: any }>("/mouvements-stock", payload);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<any> | { data: any }>(`/mouvements-stock/${id}`);
    return response.data;
  },
};
