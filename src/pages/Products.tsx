import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types";
import { Plus, Search, Edit, Trash2, Package, Upload, X, Image, Tag, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { categorieService, produitService } from "@/services/api.service";

type CategoryItem = { id: string; name: string };

const formatCFA = (amount: number) => amount.toLocaleString('fr-FR') + ' F';

const emptyProduct = (): Omit<Product, 'id'> => ({
  name: '', reference: '', description: '', category: '', brand: '',
  compatibleVehicles: [], buyPrice: 0, sellPrice: 0, stock: 0, minStock: 5,
  imageUrl: '', available: true,
});

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState("");
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyProduct());
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const normalizeCategories = (raw: any): CategoryItem[] => {
    const payload = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    return payload
      .map((item: any) => ({
        id: String(item?.id ?? item?._id ?? item?.nom ?? item?.name ?? ""),
        name: String(item?.nom ?? item?.name ?? "").trim(),
      }))
      .filter((item: CategoryItem) => Boolean(item.id && item.name));
  };

  const loadProducts = async () => {
    try {
      const response = await produitService.getAll();
      setProducts(response.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors du chargement des produits");
      setProducts([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categorieService.getAll();
      const items = normalizeCategories(response);
      setCategoryItems(items);
      setCategories(items.map((item) => item.name));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors du chargement des cat��gories");
      setCategoryItems([]);
      setCategories([]);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleAvailability = async (id: string) => {
    const current = products.find((p) => p.id === id);
    if (!current) return;

    try {
      await produitService.update(id, { available: !current.available });
      setProducts(products.map((p) => (p.id === id ? { ...p, available: !p.available } : p)));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddDialog = () => {
    setFormData(emptyProduct());
    setPreviewImage("");
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setPreviewImage(product.imageUrl);
    setIsEditDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.reference) {
      toast.error("Nom et r��f��rence obligatoires !");
      return;
    }
    if (!formData.category) {
      toast.error("Veuillez selectionner une categorie !");
      return;
    }

    const selectedFile = fileInputRef.current?.files?.[0];
    const payload = selectedFile
      ? (() => {
          const form = new FormData();
          form.append("name", formData.name);
          form.append("reference", formData.reference);
          form.append("description", formData.description || "");
          form.append("category", formData.category);
          form.append("brand", formData.brand || "N/A");
          form.append("buyPrice", String(Number(formData.buyPrice || 0)));
          form.append("sellPrice", String(Number(formData.sellPrice || 0)));
          form.append("stock", String(Number(formData.stock || 0)));
          form.append("minStock", String(Number(formData.minStock || 5)));
          form.append("available", String(Boolean(formData.available)));
          form.append("image", selectedFile);
          return form;
        })()
      : {
          name: formData.name,
          reference: formData.reference,
          description: formData.description || "",
          category: formData.category,
          brand: formData.brand || "N/A",
          buyPrice: Number(formData.buyPrice || 0),
          sellPrice: Number(formData.sellPrice || 0),
          stock: Number(formData.stock || 0),
          minStock: Number(formData.minStock || 5),
          available: Boolean(formData.available),
          imageUrl: /^https?:\/\//.test(formData.imageUrl || "") ? formData.imageUrl : "",
        };

    try {
      await produitService.create(payload);
      await loadProducts();
      setIsAddDialogOpen(false);
      toast.success("Produit ajouté avec succés !");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de l'ajout du produit");
    }
  };

  const handleEdit = async () => {
    if (!editingProduct) return;
    try {
      await produitService.update(editingProduct.id, {
        name: formData.name,
        reference: formData.reference,
        description: formData.description || "",
        category: formData.category,
        brand: formData.brand || "N/A",
        buyPrice: Number(formData.buyPrice || 0),
        sellPrice: Number(formData.sellPrice || 0),
        stock: Number(formData.stock || 0),
        minStock: Number(formData.minStock || 5),
        imageUrl:
          /^https?:\/\//.test(formData.imageUrl || "") || (formData.imageUrl || "").startsWith("/uploads/")
            ? formData.imageUrl
            : editingProduct.imageUrl || "",
        available: Boolean(formData.available),
      });
      await loadProducts();
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      toast.success("Produit modifié avec succés !");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de la modification du produit");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await produitService.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Produit supprimé !");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      toast.error("Cette catégorie existe déjà !");
      return;
    }
    try {
      await categorieService.create({ nom: newCategory.trim(), description: "" });
      await loadCategories();
      setNewCategory("");
      toast.success("Catégorie ajoutée !");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de l'ajout de la cat��gorie");
    }
  };

  const updateCategory = async (index: number) => {
    if (!editingCategoryValue.trim()) return;
    const category = categoryItems[index];
    if (!category?.id) return;
    try {
      await categorieService.update(category.id, { nom: editingCategoryValue.trim() });
      await Promise.all([loadCategories(), loadProducts()]);
      setEditingCategoryIndex(null);
      setEditingCategoryValue("");
      toast.success("Catégorie modifiée !");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de la modification de la cat��gorie");
    }
  };

  const deleteCategory = async (index: number) => {
    const category = categoryItems[index];
    if (!category?.id) return;
    try {
      await categorieService.delete(category.id);
      await Promise.all([loadCategories(), loadProducts()]);
      toast.success(`Catégorie "${category.name}" supprimée`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de la suppression de la catégorie");
    }
  };

  const ProductFormFields = () => (
    <div className="space-y-6 py-2 max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin">
      {/* Section: Image */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Image className="w-4 h-4 text-primary" />
          Photo du produit
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-border bg-muted/30">
          <div
            className="w-24 h-24 rounded-xl border-2 border-dashed border-primary/30 bg-background flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200 group"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Upload className="w-6 h-6 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] text-muted-foreground mt-1 block">Ajouter</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => fileInputRef.current?.click()} asChild={false}>
              <Upload className="w-4 h-4 mr-2" />
              Choisir une image
            </Button>
            {previewImage && (
              <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setPreviewImage(""); setFormData(prev => ({ ...prev, imageUrl: "" })); } } asChild={false}>
                <X className="w-4 h-4 mr-2" />
                Retirer
              </Button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <p className="text-xs text-muted-foreground">JPG, PNG ou WebP. Max 5 MB.</p>
          </div>
        </div>
      </div>

      {/* Section: Infos principales */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Package className="w-4 h-4 text-primary" />
          Informations principales
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nom du produit <span className="text-destructive">*</span></Label>
            <Input placeholder="Ex: Plaquettes de frein AV" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Référence <span className="text-destructive">*</span></Label>
            <Input placeholder="Ex: PF-TOY-001" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea placeholder="Décrivez le produit, compatibilités, spécifications..." rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <Textarea placeholder="Décrivez le produit, compatibilités, spécifications..." rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>
      </div>

      {/* Section: Classification */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Tag className="w-4 h-4 text-primary" />
          Classification
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Catégorie <span className="text-destructive">*</span></Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Marque</Label>
            <Input placeholder="Ex: Bosch, Valeo..." value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Section: Prix & Stock */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">â‚£</span>
          Prix & Stock
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Prix de vente (FCFA)</Label>
            <Input type="number" placeholder="0" value={formData.sellPrice || ""} onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Stock initial</Label>
            <Input type="number" placeholder="0" value={formData.stock || ""} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Seuil d'alerte stock</Label>
          <Input type="number" placeholder="5" value={formData.minStock || ""} onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })} className="max-w-[200px]" />
          <p className="text-[11px] text-muted-foreground">Vous serez alerté quand le stock descend sous ce seuil</p>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Catalogue Produits" subtitle="Gérez votre inventaire de pièces détachées">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher par nom, référence, marque..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button className="gradient-primary text-primary-foreground shadow-glow" onClick={openAddDialog} asChild={false}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
          <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)} asChild={false}>
            <Tag className="w-4 h-4 mr-2" />
            Gérer catégories
          </Button>
        </div>
      </div>

      {/* Products count */}
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouv{filteredProducts.length > 1 ? 's' : ''}.</span>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className="group bg-card rounded-xl border shadow-card overflow-hidden animate-scale-in hover:shadow-lg transition-all duration-300"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <div className="relative h-36 md:h-40 bg-secondary">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                {product.stock <= product.minStock ? (
                  <Badge variant="destructive" className="text-[10px]">Stock bas ({product.stock})</Badge>
                ) : (
                  <Badge variant="success" className="text-[10px]">En stock ({product.stock})</Badge>
                )}
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md" onClick={() => openEditDialog(product)} asChild={false}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDelete(product.id)} asChild={false}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-3 md:p-4">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate text-sm md:text-base">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.reference} · {product.brand}</p>
                </div>
                <span className="text-base md:text-lg font-bold text-primary ml-2 whitespace-nowrap">{formatCFA(product.sellPrice)}</span>
              </div>
              <Badge variant="secondary" className="mt-1 mb-2 text-[10px]">{product.category}</Badge>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-muted-foreground">
                  <span>Achat: {formatCFA(product.buyPrice)}</span>
                  {product.buyPrice > 0 && (
                    <span className="ml-2 text-success font-medium">
                      +{Math.round(((product.sellPrice - product.buyPrice) / product.buyPrice) * 100)}%
                    </span>
                  )}
                </div>
                <Switch checked={product.available} onCheckedChange={() => toggleAvailability(product.id)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
         <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>    
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Nouveau produit</DialogTitle>
            <DialogDescription>Ajoutez une pièce détachée au catalogue</DialogDescription>
          </DialogHeader>
          <ProductFormFields />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} asChild={false}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleAdd} asChild={false}>Ajouter le produit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit className="w-5 h-5 text-primary" />Modifier le produit</DialogTitle>
            <DialogDescription>Modifiez les informations du produit</DialogDescription>
          </DialogHeader>
          <ProductFormFields />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} asChild={false}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleEdit} asChild={false}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary" />Gérer les catégories</DialogTitle>
            <DialogDescription>Ajoutez, modifiez ou supprimez des catégories de produits</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Add new */}
            <div className="flex gap-2">
              <Input
                placeholder="Nouvelle catégorie..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
              />
              <Button onClick={addCategory} className="gradient-primary text-primary-foreground shrink-0" asChild={false}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {/* List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {categories.map((cat, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  {editingCategoryIndex === index ? (
                    <>
                      <Input
                        value={editingCategoryValue}
                        onChange={(e) => setEditingCategoryValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && updateCategory(index)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={() => updateCategory(index)} className="shrink-0 h-8" asChild={false}>OK</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCategoryIndex(null)} className="shrink-0 h-8" asChild={false}><X className="w-3 h-3" /></Button>
                    </>
                  ) : (
                    <>
                      <Tag className="w-4 h-4 text-primary shrink-0" />
                      <span className="flex-1 text-sm font-medium text-foreground">{cat}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {products.filter(p => p.category === cat).length}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingCategoryIndex(index); setEditingCategoryValue(cat); }} asChild={false}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteCategory(index)} asChild={false}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

