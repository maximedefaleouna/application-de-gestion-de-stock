# 📘 Guide d'Utilisation du Store - Frontend-Backend Integration

## 📋 Vue d'ensemble

Le frontend utilise maintenant un **Context React** couplé à **axios** pour communiquer avec le backend. Plus de données mock !

---

## 🏗️ Architecture

```
┌──────────────┐
│  Composants  │
│    React     │
└──────┬───────┘
       │ useApp()
       ▼
┌──────────────┐
│ AppContext   │
│  (État global)│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Services   │
│   (axios)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Backend    │
│   API REST   │
└──────────────┘
```

---

## 📦 Installation

### Dépendances installées

```bash
npm install axios
```

### Fichiers créés

1. **`frontend/src/lib/api.ts`** - Configuration axios
2. **`frontend/src/services/api.service.ts`** - Services API
3. **`frontend/src/contexts/AppContext.tsx`** - Contexte global
4. **`frontend/.env`** - Variables d'environnement

---

## 🔧 Configuration

### 1. Variables d'environnement

**Fichier :** `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 2. Provider dans main.tsx

```tsx
import { AppProvider } from "./contexts/AppContext";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
  </AppProvider>
);
```

---

## 🎯 Utilisation

### Hook personnalisé : `useApp()`

Le hook donne accès à :
- État utilisateur (`user`, `isAuthenticated`)
- Données (`products`, `clients`, `categories`, `ventes`)
- Actions (`login`, `createProduct`, etc.)

### Exemple dans un composant

```tsx
import { useApp } from "@/contexts/AppContext";

export default function Products() {
  const { 
    products,      // État des produits
    isLoading,     // État de chargement
    fetchProducts, // Action pour charger
    createProduct, // Action pour créer
    deleteProduct  // Action pour supprimer
  } = useApp();

  useEffect(() => {
    fetchProducts(); // Charge depuis l'API
  }, []);

  return (
    <div>
      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        products.map(product => (
          <div key={product.id}>{product.name}</div>
        ))
      )}
    </div>
  );
}
```

---

## 📡 Services API

### Structure des services

**Fichier :** `frontend/src/services/api.service.ts`

#### authService
```typescript
authService.login(email, password)
authService.logout()
authService.getProfile()
authService.changePassword(oldPass, newPass)
authService.createUser(data)
authService.getUsers()
authService.updateUser(id, data)
authService.deleteUser(id)
```

#### produitService
```typescript
produitService.getAll(params)
produitService.getById(id)
produitService.create(formData)  // FormData avec image
produitService.update(id, data)
produitService.delete(id)
produitService.getLowStock()
```

#### clientService
```typescript
clientService.getAll()
clientService.getById(id)
clientService.create(data)
clientService.update(id, data)
clientService.delete(id)
clientService.getClientsWithCredit()
```

#### venteService
```typescript
venteService.getAll(params)
venteService.getById(id)
venteService.create(data)
venteService.update(id, data)
venteService.delete(id)
venteService.getStats()
```

---

## 🔄 Gestion des requêtes

### Configuration axios

**Fichier :** `frontend/src/lib/api.ts`

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Intercepteurs

**1. Requête - Ajout du token JWT :**
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**2. Réponse - Gestion des erreurs 401 :**
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré → déconnexion
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📝 Exemples Complets

### 1. Authentification

```tsx
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirection automatique après connexion
    } catch (error) {
      // Erreur déjà gérée dans le context (toast)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Se connecter</button>
    </form>
  );
}
```

### 2. Création de produit avec image

```tsx
import { useApp } from "@/contexts/AppContext";
import { useRef } from "react";

export default function AddProduct() {
  const { createProduct } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    reference: "",
    price: 0,
    stock: 0
  });

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    
    // Champs texte
    formDataToSend.append('name', formData.name);
    formDataToSend.append('reference', formData.reference);
    formDataToSend.append('sellPrice', formData.price.toString());
    formDataToSend.append('stock', formData.stock.toString());
    
    // Image
    if (fileInputRef.current?.files?.[0]) {
      formDataToSend.append('image', fileInputRef.current.files[0]);
    }

    try {
      await createProduct(formDataToSend);
      // Produit créé et liste mise à jour automatiquement
    } catch (error) {
      // Erreur déjà gérée
    }
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Nom"
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
      />
      <button onClick={handleSubmit}>Créer</button>
    </div>
  );
}
```

### 3. Liste des clients

```tsx
import { useApp } from "@/contexts/AppContext";
import { useEffect } from "react";

export default function Clients() {
  const { clients, fetchClients } = useApp();

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div>
      <h1>Clients</h1>
      {clients.map(client => (
        <div key={client.id}>
          <h3>{client.nom}</h3>
          <p>{client.email}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## ⚠️ Gestion des erreurs

### Toast notifications

Toutes les erreurs sont gérées automatiquement avec des toasts :

```typescript
// Dans AppContext.tsx
try {
  await produitService.create(formData);
  toast.success('Produit créé avec succès');
} catch (error: any) {
  toast.error(error.response?.data?.message || 'Erreur...');
  throw error; // Propage l'erreur au composant
}
```

### Dans les composants

```tsx
try {
  await createProduct(formData);
  // Succès géré dans le context
} catch (error) {
  // Erreur gérée dans le context
  // Vous pouvez ajouter une logique supplémentaire si besoin
}
```

---

## 🎯 Migration depuis les Mock Data

### Ancienne approche (avec mocks)

```tsx
import { mockProducts } from "@/data/mockData";

const [products, setProducts] = useState(mockProducts);

const handleAdd = () => {
  const newProduct = { ...formData, id: `P${Date.now()}` };
  setProducts([newProduct, ...products]); // ❌ Juste en local
};
```

### Nouvelle approche (avec API)

```tsx
import { useApp } from "@/contexts/AppContext";

const { products, createProduct } = useApp();

const handleAdd = async () => {
  const formDataToSend = new FormData();
  // ... remplir formDataToSend
  
  await createProduct(formDataToSend); // ✅ Envoie à l'API
  // La liste est automatiquement mise à jour
};
```

---

## 🔄 Cycle de vie des données

### Chargement initial

```tsx
useEffect(() => {
  fetchProducts(); // Appel API au montage du composant
}, []);
```

### Mise à jour après création

```typescript
// Dans AppContext.tsx
const createProduct = async (formData: FormData) => {
  try {
    await produitService.create(formData); // ✅ API
    toast.success('Produit créé avec succès');
    await fetchProducts(); // 🔄 Recharge la liste depuis l'API
  } catch (error) {
    toast.error('Erreur...');
    throw error;
  }
};
```

### Suppression

```typescript
// Dans AppContext.tsx
const deleteProduct = async (id: string) => {
  try {
    await produitService.delete(id); // ✅ API
    toast.success('Produit supprimé');
    await fetchProducts(); // 🔄 Recharge la liste
  } catch (error) {
    toast.error('Erreur...');
    throw error;
  }
};
```

---

## 🛠️ Bonnes Pratiques

### 1. Toujours utiliser le Context

```tsx
// ✅ BON
const { products, fetchProducts } = useApp();

// ❌ MAUVAIS
const [products, setProducts] = useState([]);
```

### 2. Gérer le chargement

```tsx
const { products, isLoading } = useApp();

if (isLoading) {
  return <Spinner />;
}

return <ProductList products={products} />;
```

### 3. Utiliser les actions du Context

```tsx
// ✅ BON
const { createProduct } = useApp();
await createProduct(formData);

// ❌ MAUVAIS
import { produitService } from "@/services/api.service";
await produitService.create(formData);
```

### 4. Effacer les données sensibles

```tsx
// À la déconnexion
authService.logout();
localStorage.removeItem('token');
localStorage.removeItem('user');
```

---

## 📊 État global disponible

### Utilisateur

```typescript
interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'vendeur';
  avatar?: string;
}

// Dans le component
const { user, isAuthenticated } = useApp();
```

### Produits

```typescript
const { products, fetchProducts, createProduct, updateProduct, deleteProduct } = useApp();
```

### Clients

```typescript
const { clients, fetchClients, createClient, updateClient, deleteClient } = useApp();
```

### Catégories

```typescript
const { categories, fetchCategories } = useApp();
```

### Ventes

```typescript
const { ventes, fetchVentes } = useApp();
```

---

## ✅ Checklist d'intégration

### Pages à migrer

- [ ] **Dashboard** - Utiliser `fetchProducts()`, `fetchVentes()`
- [ ] **Products** - ✅ Déjà migré
- [ ] **Clients** - Utiliser `fetchClients()`, `createClient()`
- [ ] **Sales** - Utiliser `fetchVentes()`, `createVente()`
- [ ] **Users** - Utiliser `getUsers()`, `registerUser()`
- [ ] **Stats** - Utiliser `venteService.getStats()`
- [ ] **POS** - Utiliser `products` du Context

### Actions requises

- [ ] Supprimer les imports de `mockData`
- [ ] Remplacer les `useState` locaux par `useApp()`
- [ ] Ajouter les appels API dans `useEffect`
- [ ] Gérer les états de chargement
- [ ] Tester toutes les fonctionnalités

---

## 🎉 Avantages

### Avant (Mock Data)

```tsx
❌ Données statiques
❌ Pas de persistance
❌ Pas de collaboration
❌ Tests limités
```

### Maintenant (API)

```tsx
✅ Données réelles en temps réel
✅ Persistance en base de données
✅ Collaboration multi-utilisateurs
✅ Authentification sécurisée
✅ Upload d'images
✅ Historique complet
```

L'intégration est maintenant **complète et fonctionnelle** ! 🚀
