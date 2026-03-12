import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  authService,
  produitService,
  clientService,
  venteService,
  categorieService,
  configurationService,
} from "@/services/api.service";
import { toast } from "sonner";

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "admin" | "vendeur";
  avatar: string;
}

interface Configuration {
  id: string;
  nom: string;
  nomChef: string;
  prenomChef: string;
  adresse: string;
  telephone: string;
  email: string;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  products: any[];
  clients: any[];
  categories: any[];
  ventes: any[];
  configuration: Configuration | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerUser: (data: any) => Promise<void>;
  fetchProducts: () => Promise<void>;
  createProduct: (formData: FormData) => Promise<void>;
  updateProduct: (id: string, data: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  fetchClients: () => Promise<void>;
  createClient: (data: any) => Promise<void>;
  updateClient: (id: string, data: any) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchVentes: () => Promise<void>;
  fetchConfiguration: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [ventes, setVentes] = useState<any[]>([]);
  const [configuration, setConfiguration] = useState<Configuration | null>(null);

  // Vérifier si l'utilisateur est connecté au montage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchConfiguration();
    }
    setIsLoading(false);
  }, []);

  // Connexion
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, motDePasse: password });
      setUser(response.data.utilisateur);
      // Ne pas afficher de toast ici, c'est géré par le composant Login
    } catch (error: any) {
      // Ne pas afficher d'erreur ici non plus, c'est géré par Login
      throw error;
    }
  };

  // Déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info("Déconnecté");
  };

  // Créer un utilisateur
  const registerUser = async (data: any) => {
    try {
      await authService.createUser(data);
      toast.success("Utilisateur créé avec succès");
    } catch (error: any) {
      toast.error(
        error.response.data.message || "Erreur lors de la création",
      );
      throw error;
    }
  };

  // Récupérer les produits
  const fetchProducts = async () => {
    try {
      const response = await produitService.getAll();
      setProducts(response.data);
    } catch (error: any) {
      toast.error(
        error.response.data.message ||
          "Erreur lors du chargement des produits",
      );
    }
  };

  // Créer un produit
  const createProduct = async (formData: FormData) => {
    try {
      await produitService.create(formData);
      toast.success("Produit créé avec succès");
      await fetchProducts();
    } catch (error: any) {
      toast.error(
        error.response.data.message ||
          "Erreur lors de la création du produit",
      );
      throw error;
    }
  };

  // Modifier un produit
  const updateProduct = async (id: string, data: any) => {
    try {
      await produitService.update(id, data);
      toast.success("Produit modifié avec succès");
      await fetchProducts();
    } catch (error: any) {
      toast.error(
        error.response.data.message ||
          "Erreur lors de la modification du produit",
      );
      throw error;
    }
  };

  // Supprimer un produit
  const deleteProduct = async (id: string) => {
    try {
      await produitService.delete(id);
      toast.success("Produit supprimé avec succès");
      await fetchProducts();
    } catch (error: any) {
      toast.error(
        error.response.data.message ||
          "Erreur lors de la suppression du produit",
      );
      throw error;
    }
  };

  // Récupérer les clients
  const fetchClients = async () => {
    try {
      const response = await clientService.getAll();
      setClients(response.data);
    } catch (error: any) {
      toast.error(
        error.response.data.message ||
          "Erreur lors du chargement des clients",
      );
    }
  };

  // Créer un client
  const createClient = async (data: any) => {
    try {
      await clientService.create(data);
      toast.success("Client créé avec succès");
      await fetchClients();
    } catch (error: any) {
      toast.error(
        error.response.data.message || "Erreur lors de la création du client",
      );
      throw error;
    }
  };

  // Modifier un client
  const updateClient = async (id: string, data: any) => {
    try {
      await clientService.update(id, data);
      toast.success("Client modifié avec succès");
      await fetchClients();
    } catch (error: any) {
      toast.error(
        error.response.data.message ||
          "Erreur lors de la modification du client",
      );
      throw error;
    }
  };

  // Supprimer un client
  const deleteClient = async (id: string) => {
    try {
      await clientService.delete(id);
      toast.success("Client supprimé avec succès");
      await fetchClients();
    } catch (error: any) {
      toast.error(
        error.response.data.message ||
          "Erreur lors de la suppression du client",
      );
      throw error;
    }
  };

  // Récupérer les catégories
  const fetchCategories = async () => {
    try {
      const response = await categorieService.getAll();
      setCategories(response.data);
    } catch (error: any) {
      toast.error(
        error.response.data.message ||
          "Erreur lors du chargement des catégories",
      );
    }
  };

  // Récupérer les ventes
  const fetchVentes = async () => {
    try {
      const response = await venteService.getAll();
      setVentes(response.data);
    } catch (error: any) {
      toast.error(
        error.response.data.message || "Erreur lors du chargement des ventes",
      );
    }
  };

  // Récupérer la configuration
  const fetchConfiguration = async () => {
    try {
      const response = await configurationService.get();
      setConfiguration(response.data);
    } catch (error: any) {
      console.error("Erreur chargement configuration:", error);
      // Don't show error if config doesn't exist yet (404)
      if (error.response?.status !== 404) {
        toast.error("Erreur de chargement de la configuration");
      }
    }
  };

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    products,
    clients,
    categories,
    ventes,
    configuration,
    login,
    logout,
    registerUser,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    fetchCategories,
    fetchVentes,
    fetchConfiguration,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
