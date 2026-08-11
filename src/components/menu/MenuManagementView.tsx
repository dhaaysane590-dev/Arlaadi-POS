import React, { useState, useRef } from 'react';
import { MenuItem, MenuCategory, Ingredient, RecipeIngredient } from '../../types';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  Tag,
  BookOpen,
  Image as ImageIcon,
  Upload,
  FolderPlus,
  Layers,
  Calculator,
  Percent,
  DollarSign,
  TrendingUp,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface MenuManagementViewProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  onAddMenuItem: (item: MenuItem) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onAddCategory?: (category: MenuCategory) => void;
  onUpdateCategory?: (category: MenuCategory) => void;
  onDeleteCategory?: (categoryId: string) => void;
  isDarkMode: boolean;
}

const PRESET_FOOD_IMAGES = [
  { label: 'Gourmet Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Woodfired Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80' },
  { label: 'Creamy Pasta', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80' },
  { label: 'T-Bone Steak', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' },
  { label: 'Fresh Green Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Fresh Mango Juice', url: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80' },
  { label: 'Chocolate Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80' },
  { label: 'Grilled Seafood', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80' },
];

export const MenuManagementView: React.FC<MenuManagementViewProps> = ({
  categories,
  menuItems,
  ingredients,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [search, setSearch] = useState<string>('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  // Margin Calculator Modal State
  const [showMarginModal, setShowMarginModal] = useState<boolean>(false);
  const [marginCalcItemName, setMarginCalcItemName] = useState<string>('');
  const [targetMarginPct, setTargetMarginPct] = useState<number>(60);
  const [calcMode, setCalcMode] = useState<'grossMargin' | 'markup'>('grossMargin');
  const [tempRecipe, setTempRecipe] = useState<RecipeIngredient[]>([]);
  const [selectedIngId, setSelectedIngId] = useState<string>('');
  const [ingQtyInput, setIngQtyInput] = useState<number>(0.25);
  const [isFromFormModal, setIsFromFormModal] = useState<boolean>(false);
  const [itemToUpdateId, setItemToUpdateId] = useState<string | null>(null);

  // Open Margin Calculator
  const handleOpenMarginModalForItem = (item: MenuItem | Partial<MenuItem>, fromForm = false) => {
    setMarginCalcItemName(item.name || 'Menu Item');
    setTempRecipe(item.recipe && item.recipe.length > 0 ? [...item.recipe] : []);
    setIsFromFormModal(fromForm);
    setItemToUpdateId(item.id || null);

    if (ingredients.length > 0) {
      setSelectedIngId(ingredients[0].id);
    }

    if (item.costPrice && item.sellingPrice && item.sellingPrice > item.costPrice) {
      const currentMargin = ((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100;
      setTargetMarginPct(Math.min(95, Math.max(10, Math.round(currentMargin))));
    } else {
      setTargetMarginPct(60);
    }

    setShowMarginModal(true);
  };

  const handleAddRecipeIngredient = () => {
    if (!selectedIngId || ingQtyInput <= 0) return;
    setTempRecipe(prev => {
      const existingIndex = prev.findIndex(r => r.ingredientId === selectedIngId);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantityRequired: Number((copy[existingIndex].quantityRequired + ingQtyInput).toFixed(3))
        };
        return copy;
      }
      return [...prev, { ingredientId: selectedIngId, quantityRequired: ingQtyInput }];
    });
  };

  const handleRemoveRecipeIngredient = (ingId: string) => {
    setTempRecipe(prev => prev.filter(r => r.ingredientId !== ingId));
  };

  // Compute Cost Price from Recipe Ingredients
  const computedCostPrice = tempRecipe.reduce((sum, item) => {
    const ing = ingredients.find(i => i.id === item.ingredientId);
    return sum + (ing ? ing.unitCost * item.quantityRequired : 0);
  }, 0);

  // Suggested Selling Price Calculation
  let suggestedSellingPrice = 0;
  if (calcMode === 'grossMargin') {
    const marginFrac = Math.min(0.99, Math.max(0.01, targetMarginPct / 100));
    suggestedSellingPrice = computedCostPrice > 0 ? computedCostPrice / (1 - marginFrac) : 0;
  } else {
    suggestedSellingPrice = computedCostPrice * (1 + (targetMarginPct / 100));
  }

  const computedProfit = Math.max(0, suggestedSellingPrice - computedCostPrice);

  const handleApplyMarginCalculation = () => {
    const finalCost = Number(computedCostPrice.toFixed(2));
    const finalSelling = Number(suggestedSellingPrice.toFixed(2));

    if (isFromFormModal) {
      setFormData(prev => ({
        ...prev,
        costPrice: finalCost,
        sellingPrice: finalSelling,
        recipe: tempRecipe
      }));
    } else if (itemToUpdateId) {
      const existing = menuItems.find(m => m.id === itemToUpdateId);
      if (existing) {
        onUpdateMenuItem({
          ...existing,
          costPrice: finalCost,
          sellingPrice: finalSelling,
          recipe: tempRecipe
        });
      }
    }
    setShowMarginModal(false);
  };

  // Hidden File Input Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modal Form State for Menu Item
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    sku: '',
    barcode: '',
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || '',
    costPrice: 0,
    sellingPrice: 0,
    prepTimeMinutes: 15,
    description: '',
    image: PRESET_FOOD_IMAGES[0].url,
    isAvailable: true,
    recipe: []
  });

  // Category Modal Form State
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');

  const handleOpenNewModal = () => {
    setFormData({
      id: 'm-' + Date.now(),
      name: '',
      sku: 'BISTRO-M' + Math.floor(100 + Math.random() * 900),
      barcode: '8930' + Math.floor(1000000 + Math.random() * 9000000),
      categoryId: categories[0]?.id || '',
      categoryName: categories[0]?.name || '',
      costPrice: 3.50,
      sellingPrice: 10.00,
      prepTimeMinutes: 12,
      description: '',
      image: PRESET_FOOD_IMAGES[0].url,
      isAvailable: true,
      recipe: []
    });
    setEditingItem(null);
    setShowItemModal(true);
  };

  // Image Upload File Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, WEBP, etc.)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setFormData(prev => ({ ...prev, image: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find(c => c.id === formData.categoryId);

    const saved: MenuItem = {
      id: formData.id || 'm-' + Date.now(),
      sku: formData.sku || 'BISTRO-M99',
      barcode: formData.barcode || '893000000',
      name: formData.name || 'New Menu Item',
      categoryId: formData.categoryId || categories[0]?.id || 'cat-1',
      categoryName: cat?.name || categories[0]?.name || 'General',
      description: formData.description || '',
      costPrice: Number(formData.costPrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      taxRate: 5,
      prepTimeMinutes: Number(formData.prepTimeMinutes) || 15,
      isAvailable: formData.isAvailable ?? true,
      image: formData.image || PRESET_FOOD_IMAGES[0].url,
      recipe: formData.recipe || []
    };

    if (editingItem) {
      onUpdateMenuItem(saved);
    } else {
      onAddMenuItem(saved);
    }

    setShowItemModal(false);
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setNewCatName('');
    setNewCatDesc('');
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat: MenuCategory) => {
    setEditingCategory(cat);
    setNewCatName(cat.name);
    setNewCatDesc(cat.description || '');
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (editingCategory) {
      const updated: MenuCategory = {
        ...editingCategory,
        name: newCatName.trim(),
        icon: '',
        description: newCatDesc.trim() || 'Custom menu category'
      };
      if (onUpdateCategory) onUpdateCategory(updated);
    } else {
      const newCategory: MenuCategory = {
        id: 'cat-' + Date.now(),
        name: newCatName.trim(),
        icon: '',
        description: newCatDesc.trim() || 'Custom menu category',
        itemCount: 0
      };
      if (onAddCategory) onAddCategory(newCategory);
    }

    setNewCatName('');
    setNewCatDesc('');
    setEditingCategory(null);
    setShowCategoryModal(false);
  };

  const handleDeleteCategoryClick = (catId: string, catName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setCategoryToDelete({ id: catId, name: catName });
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete && onDeleteCategory) {
      onDeleteCategory(categoryToDelete.id);
    }
    setCategoryToDelete(null);
  };

  return (
    <div className="container-fluid p-4">
      
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-primary text-white rounded-3 shadow-sm">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">Menu & Recipe Management</h1>
            <p className="text-muted small mb-0">Manage food items, upload custom dish images, create menu categories, and handle pricing</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => handleOpenMarginModalForItem(menuItems[0] || { name: 'New Item', costPrice: 3.50, sellingPrice: 10.00, recipe: [] }, false)}
            className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm fw-semibold"
            title="Open Margin & Recipe Cost Calculator"
          >
            <Calculator className="w-4 h-4 text-primary" />
            <span>Calculate Margin</span>
          </button>

          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm fw-semibold"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Category</span>
          </button>

          <button
            onClick={handleOpenNewModal}
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Menu Item</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs: Items vs Categories */}
      <div className="mb-3 d-flex align-items-center gap-2">
        <button
          onClick={() => setActiveTab('items')}
          className={`btn btn-sm px-3.5 py-2 rounded-3 fw-semibold ${
            activeTab === 'items' ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
          }`}
        >
          <Package className="w-4 h-4 d-inline me-1.5" />
          <span>Menu Items ({menuItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`btn btn-sm px-3.5 py-2 rounded-3 fw-semibold ${
            activeTab === 'categories' ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
          }`}
        >
          <Layers className="w-4 h-4 d-inline me-1.5" />
          <span>Categories ({categories.length})</span>
        </button>
      </div>

      {activeTab === 'items' && (
        <div className={`card border-0 shadow-sm rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
          <div className="card-header bg-transparent p-3 d-flex align-items-center justify-content-between">
            
            <div className="input-group style-badge" style={{ maxWidth: '320px' }}>
              <span className="input-group-text bg-transparent"><Search className="w-4 h-4 text-muted" /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search menu items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="small text-muted fw-semibold">
              Total Items: {menuItems.length}
            </div>

          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>SKU / Barcode</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Margin</th>
                  <th>Availability</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map((item) => {
                  const margin = item.sellingPrice - item.costPrice;
                  const marginPct = item.sellingPrice > 0 ? (margin / item.sellingPrice) * 100 : 0;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          <img src={item.image} alt={item.name} className="rounded-3 shadow-sm border" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                          <div>
                            <div className="fw-bold small">{item.name}</div>
                            <span className="text-muted style-badge">{item.prepTimeMinutes}m prep</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border">{item.categoryName}</span>
                      </td>

                      <td className="font-monospace small">
                        <div>{item.sku}</div>
                        <span className="text-muted style-badge">{item.barcode}</span>
                      </td>

                      <td className="font-monospace">${item.costPrice.toFixed(2)}</td>
                      <td className="font-monospace fw-bold text-primary">${item.sellingPrice.toFixed(2)}</td>

                      <td>
                        <button
                          type="button"
                          onClick={() => handleOpenMarginModalForItem(item, false)}
                          className="btn btn-xs border-0 p-0 text-start"
                          title="Click to calculate margin & recipe cost"
                        >
                          <span className="badge bg-success-subtle text-success hover-shadow transition-all cursor-pointer">
                            +${margin.toFixed(2)} ({marginPct.toFixed(0)}%)
                          </span>
                        </button>
                      </td>

                      <td>
                        <span className={`badge ${item.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                          {item.isAvailable ? 'Available' : 'Sold Out'}
                        </span>
                      </td>

                      <td className="text-end">
                        <button
                          onClick={() => handleOpenMarginModalForItem(item, false)}
                          className="btn btn-sm btn-outline-primary me-1 d-inline-flex align-items-center gap-1"
                          title="Calculate Margin & Recipe Cost"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span className="d-none d-xl-inline style-badge">Margin</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setFormData(item);
                            setShowItemModal(true);
                          }}
                          className="btn btn-sm btn-outline-secondary me-1"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteMenuItem(item.id)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Management Tab */}
      {activeTab === 'categories' && (
        <div className={`card border-0 shadow-sm rounded-3 p-4 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
          <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
            <div>
              <h5 className="h6 fw-bold mb-1">Menu Categories</h5>
              <p className="text-muted small mb-0">Organize menu items by custom categories</p>
            </div>
            <button
              onClick={handleOpenAddCategory}
              className="btn btn-sm btn-primary fw-bold d-flex align-items-center gap-1.5 px-3 py-2 shadow-sm"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>

          <div className="row g-3">
            {categories.map((cat) => {
              const itemCount = menuItems.filter(m => m.categoryId === cat.id).length;
              return (
                <div key={cat.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                  <div className={`card h-100 border shadow-sm rounded-3 overflow-hidden transition-all ${
                    isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white border-light-subtle'
                  }`}>
                    {/* Card Body */}
                    <div className="p-3.5 d-flex flex-column justify-content-between h-100">
                      <div>
                        {/* Top Row: Title & Action Buttons */}
                        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                          <h6 className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: '0.98rem', letterSpacing: '-0.2px' }}>
                            {cat.name}
                          </h6>
                          <div className="d-flex align-items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditCategory(cat);
                              }}
                              className="btn btn-xs btn-outline-secondary p-1 rounded-2"
                              title="Edit Category"
                              style={{ width: '28px', height: '28px' }}
                            >
                              <Edit2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCategoryClick(cat.id, cat.name, e)}
                              className="btn btn-xs btn-outline-danger p-1 rounded-2"
                              title="Delete Category"
                              style={{ width: '28px', height: '28px' }}
                            >
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        {cat.description && (
                          <p className="text-muted small mb-3 text-truncate-2" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                            {cat.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Footer: Item Count Pill */}
                      <div className="d-flex align-items-center justify-content-between pt-2.5 border-top mt-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
                          {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                        </span>
                        <span className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                          ID: {cat.id}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Item Modal with Image File Upload */}
      {showItemModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveItem}>
                <div className="modal-header bg-dark text-white p-3">
                  <h5 className="modal-title h6 fw-bold">
                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowItemModal(false)}></button>
                </div>

                <div className="modal-body p-4">
                  <div className="row g-3">
                    
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Food Item Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Signature Beef Burger"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Menu Category</label>
                      <select
                        className="form-select"
                        value={formData.categoryId || ''}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Cost Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control font-monospace"
                        value={formData.costPrice || 0}
                        onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Selling Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control font-monospace fw-bold text-primary"
                        value={formData.sellingPrice || 0}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    {/* Quick Calculate Margin Button */}
                    <div className="col-12">
                      <div className="p-2.5 bg-primary-subtle border border-primary-subtle rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <Calculator className="w-5 h-5 text-primary flex-shrink-0" />
                          <div>
                            <div className="fw-bold small text-primary mb-0">Recipe & Profit Margin Calculator</div>
                            <div className="text-muted style-badge">Compute cost from ingredients & suggest selling price</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenMarginModalForItem(formData, true)}
                          className="btn btn-sm btn-primary fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                        >
                          <Calculator className="w-4 h-4" />
                          <span>Calculate Margin</span>
                        </button>
                      </div>
                    </div>

                    {/* Dish Image Upload Section */}
                    <div className="col-12">
                      <label className="form-label small fw-bold text-dark d-flex align-items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-primary" />
                        <span>Dish Image (Upload Image File from Device)</span>
                      </label>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="d-none"
                        onChange={handleImageFileChange}
                      />

                      <div className="p-3 border rounded-3 bg-light d-flex flex-wrap align-items-center gap-3">
                        <img
                          src={formData.image || PRESET_FOOD_IMAGES[0].url}
                          alt="Dish Preview"
                          className="rounded-3 shadow-sm border object-cover"
                          style={{ width: '80px', height: '80px' }}
                        />

                        <div className="flex-grow-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-outline-primary btn-sm fw-bold d-flex align-items-center gap-2 mb-2"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Choose Image File From Device</span>
                          </button>
                          <div className="text-muted style-badge" style={{ fontSize: '0.72rem' }}>
                            Supports PNG, JPG, WEBP or GIF image files. Converts directly to image asset.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Ingredients overview, taste profile..."
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                  </div>
                </div>

                <div className="modal-footer bg-light p-3">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowItemModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm fw-bold px-4">Save Menu Item</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Category Modal */}
      {showCategoryModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveCategory}>
                <div className="modal-header bg-primary text-white p-3">
                  <h5 className="modal-title h6 fw-bold d-flex align-items-center gap-2">
                    <FolderPlus className="w-5 h-5" />
                    <span>{editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Menu Category'}</span>
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowCategoryModal(false)}></button>
                </div>

                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Cold Beverages, Seafood, Desserts..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category Description (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Brief description of category items..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light p-3">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm fw-bold px-4">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-danger text-white p-3">
                <h5 className="modal-title h6 fw-bold d-flex align-items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Category</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setCategoryToDelete(null)}></button>
              </div>
              <div className="modal-body p-3 text-center">
                <p className="mb-1 text-dark fw-semibold">Delete "{categoryToDelete.name}" category?</p>
                <p className="small text-muted mb-0">This action will remove the category from your menu.</p>
              </div>
              <div className="modal-footer bg-light p-2.5 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setCategoryToDelete(null)}>Cancel</button>
                <button type="button" className="btn btn-sm btn-danger fw-bold px-3" onClick={confirmDeleteCategory}>
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculate Margin Modal */}
      {showMarginModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1} style={{ zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white p-3">
                <h5 className="modal-title h6 fw-bold d-flex align-items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  <span>Margin & Recipe Cost Calculator - {marginCalcItemName}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowMarginModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                
                {/* Step 1: Recipe Ingredients Builder */}
                <div className="card border p-3 mb-4 rounded-3 bg-light-subtle">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>Recipe Ingredients (Cost Calculation)</span>
                    </h6>
                    <span className="badge bg-primary-subtle text-primary fw-semibold">
                      {tempRecipe.length} Ingredients
                    </span>
                  </div>
                  <p className="text-muted small mb-3">
                    Add ingredients required to prepare 1 serving of this dish. Cost price is calculated from inventory unit costs.
                  </p>

                  {/* Ingredient Selection Controls */}
                  <div className="row g-2 align-items-center mb-3">
                    <div className="col-12 col-md-6">
                      <select
                        className="form-select form-select-sm"
                        value={selectedIngId}
                        onChange={(e) => setSelectedIngId(e.target.value)}
                      >
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} (${ing.unitCost.toFixed(2)} / {ing.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-7 col-md-4 d-flex align-items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0.001"
                        className="form-control form-control-sm font-monospace"
                        placeholder="Qty"
                        value={ingQtyInput}
                        onChange={(e) => setIngQtyInput(parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-muted small fw-semibold text-nowrap">
                        {ingredients.find(i => i.id === selectedIngId)?.unit || 'unit'}
                      </span>
                    </div>

                    <div className="col-5 col-md-2">
                      <button
                        type="button"
                        onClick={handleAddRecipeIngredient}
                        className="btn btn-primary btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Ingredients Table */}
                  {tempRecipe.length > 0 ? (
                    <div className="table-responsive bg-white rounded-3 border">
                      <table className="table table-sm table-hover align-middle mb-0">
                        <thead className="table-light style-badge">
                          <tr>
                            <th>Ingredient</th>
                            <th>Qty Required</th>
                            <th>Unit Cost</th>
                            <th>Subtotal Cost</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tempRecipe.map((item) => {
                            const ing = ingredients.find(i => i.id === item.ingredientId);
                            const subtotal = ing ? ing.unitCost * item.quantityRequired : 0;
                            return (
                              <tr key={item.ingredientId}>
                                <td className="fw-semibold small">{ing?.name || 'Unknown'}</td>
                                <td className="font-monospace small">
                                  {item.quantityRequired} {ing?.unit}
                                </td>
                                <td className="font-monospace text-muted small">
                                  ${ing?.unitCost.toFixed(2)} / {ing?.unit}
                                </td>
                                <td className="font-monospace fw-bold text-dark small">
                                  ${subtotal.toFixed(2)}
                                </td>
                                <td className="text-end">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRecipeIngredient(item.ingredientId)}
                                    className="btn btn-xs btn-outline-danger p-1 rounded-2"
                                    title="Remove Ingredient"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="table-light fw-bold border-top">
                          <tr>
                            <td colSpan={3} className="text-end text-uppercase small text-muted">
                              Total Calculated Cost Price:
                            </td>
                            <td className="font-monospace text-primary h6 fw-bold mb-0">
                              ${computedCostPrice.toFixed(2)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-3 text-muted bg-white border rounded-3 small">
                      No recipe ingredients added yet. Select an ingredient above or adjust target profit margin.
                    </div>
                  )}
                </div>

                {/* Step 2: Target Profit Margin & Suggested Price */}
                <div className="card border p-3 rounded-3 bg-white">
                  <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span>Profit Margin & Price Suggestion Calculator</span>
                  </h6>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold d-flex justify-content-between align-items-center">
                        <span>Target Calculation Mode</span>
                      </label>
                      <div className="btn-group w-100" role="group">
                        <button
                          type="button"
                          className={`btn btn-sm ${calcMode === 'grossMargin' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setCalcMode('grossMargin')}
                        >
                          Gross Margin %
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${calcMode === 'markup' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setCalcMode('markup')}
                        >
                          Cost Markup %
                        </button>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold d-flex justify-content-between align-items-center">
                        <span>Desired {calcMode === 'grossMargin' ? 'Gross Margin' : 'Markup'} (%)</span>
                        <span className="badge bg-primary font-monospace fs-6">
                          {targetMarginPct}%
                        </span>
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="range"
                          className="form-range flex-grow-1"
                          min="5"
                          max={calcMode === 'grossMargin' ? 90 : 300}
                          step="5"
                          value={targetMarginPct}
                          onChange={(e) => setTargetMarginPct(parseInt(e.target.value) || 0)}
                        />
                        <input
                          type="number"
                          className="form-control form-control-sm font-monospace text-center fw-bold"
                          style={{ width: '70px' }}
                          value={targetMarginPct}
                          onChange={(e) => setTargetMarginPct(Math.max(1, parseInt(e.target.value) || 0))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="row g-2">
                    <div className="col-6 col-md-3">
                      <div className="p-2.5 bg-light rounded-3 border text-center">
                        <span className="text-muted style-badge d-block mb-1">Calculated Cost</span>
                        <div className="h6 font-monospace fw-bold mb-0 text-dark">
                          ${computedCostPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-2.5 bg-light rounded-3 border text-center">
                        <span className="text-muted style-badge d-block mb-1">Target Margin</span>
                        <div className="h6 font-monospace fw-bold mb-0 text-primary">
                          {targetMarginPct}%
                        </div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-2.5 bg-success-subtle rounded-3 border border-success-subtle text-center">
                        <span className="text-success style-badge d-block mb-1">Est. Profit / Dish</span>
                        <div className="h6 font-monospace fw-bold mb-0 text-success">
                          +${computedProfit.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-2.5 bg-primary text-white rounded-3 shadow-sm text-center">
                        <span className="style-badge d-block mb-1 opacity-75">Suggested Price</span>
                        <div className="h6 font-monospace fw-bold mb-0">
                          ${suggestedSellingPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="modal-footer bg-light p-3 d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm fw-semibold"
                  onClick={() => setShowMarginModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApplyMarginCalculation}
                  className="btn btn-success btn-sm fw-bold px-4 d-flex align-items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Prices & Recipe to Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
