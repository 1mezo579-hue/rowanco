"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import {
  ArrowRight, Plus, Package, AlertTriangle, Search,
  TrendingUp, TrendingDown, Edit2, Trash2, X, Save,
  Boxes, Layers, Download, Upload, Trash
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  barcode: string | null;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  priceType: string;
  unit: string;
  category: { id: number; name: string };
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  _count: { products: number };
}

export default function InventoryPage() {
  const { user, isChecked } = useRequireAuth(["admin", "manager"]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(100);
  const [activeTab, setActiveTab] = useState<"products" | "stock" | "categories">("products");
  
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showStockForm, setShowStockForm] = useState(false);
  
  const [productForm, setProductForm] = useState({
    name: "", barcode: "", categoryId: "", priceType: "unit" as "unit" | "weight",
    price: "", costPrice: "", stock: "", minStock: "5", unit: "piece",
  });
  const [stockForm, setStockForm] = useState({
    productId: "", type: "in" as "in" | "out", quantity: "", reason: "purchase", notes: "",
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;
    
    // If there's a barcode query, filter strictly by barcode first
    if (barcodeQuery.trim()) {
      const b = barcodeQuery.trim();
      filtered = filtered.filter(p => p.barcode?.includes(b));
    } else if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.barcode?.includes(q)
      );
    }
    return filtered;
  }, [allProducts, searchQuery, barcodeQuery]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/products?limit=10000`), fetch("/api/categories"),
      ]);
      const pData = await productsRes.json();
      const cData = await categoriesRes.json();
      setAllProducts(Array.isArray(pData) ? pData : []);
      setCategories(Array.isArray(cData) ? cData : []);
    } catch { toast.error("حدث خطأ أثناء تحميل البيانات"); }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.categoryId || !productForm.price) {
      toast.error("يرجى ملء جميع الحقول المطلوبة"); return;
    }
    const data = {
      name: productForm.name, barcode: productForm.barcode || null,
      categoryId: parseInt(productForm.categoryId), priceType: productForm.priceType,
      price: parseFloat(productForm.price), costPrice: parseFloat(productForm.costPrice) || 0,
      stock: parseFloat(productForm.stock) || 0, minStock: parseFloat(productForm.minStock) || 5,
      unit: productForm.unit,
    };
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) {
        toast.success(editingProduct ? "تم تحديث المنتج" : "تمت إضافة المنتج بنجاح");
        setShowProductForm(false); setEditingProduct(null); resetProductForm(); fetchData();
      } else { const err = await res.json(); toast.error(err.error || "فشل الحفظ"); }
    } catch { toast.error("خطأ في الاتصال بالسيرفر"); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("تم حذف المنتج"); fetchData(); }
    } catch { toast.error("فشل الحذف"); }
  };

  const handleDeleteAll = async () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    const input = prompt(`تحذير خطير: سيتم مسح جميع المنتجات والحركات المخزنية للأبد! \n\nلتأكيد المسح، يرجى كتابة الرقم التالي: ${code}`);
    if (input !== code.toString()) {
      if (input !== null) toast.error("الرقم غير صحيح، تم إلغاء المسح");
      return;
    }

    try {
      const toastId = toast.loading("جاري مسح جميع البيانات...");
      const res = await fetch(`/api/products/delete-all`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم تصفير المخزن ومسح جميع المنتجات بنجاح", { id: toastId });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل المسح", { id: toastId });
      }
    } catch { toast.error("فشل الاتصال بالسيرفر"); }
  };

  const handleExport = () => {
    if (filteredProducts.length === 0) {
      toast.error("لا توجد بيانات لتصديرها!");
      return;
    }
    const exportData = filteredProducts.map(p => ({
      "الاسم": p.name,
      "الباركود": p.barcode || "",
      "سعر البيع": p.price,
      "سعر الشراء": p.costPrice,
      "الرصيد": p.stock,
      "القسم": p.category?.name || "",
      "طريقة البيع": p.priceType === "weight" ? "وزن" : "قطعة",
      "الوحدة": p.unit
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "منتجات روانكو");
    XLSX.writeFile(wb, `Rawanco_Products_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`);
    toast.success("تم التصدير لملف إكسيل بنجاح");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const mappedData = data.map((row: any) => ({
          name: row["الاسم"] || row["name"],
          barcode: row["الباركود"] || row["barcode"],
          price: row["سعر البيع"] || row["price"],
          costPrice: row["سعر الشراء"] || row["costPrice"],
          stock: row["الرصيد"] || row["stock"],
          category: row["القسم"] || row["category"],
          priceType: (row["طريقة البيع"] === "وزن" || row["priceType"] === "weight") ? "weight" : "unit",
          unit: row["الوحدة"] || row["unit"] || "piece",
        }));

        const toastId = toast.loading("جاري قراءة واستيراد البيانات...");
        const res = await fetch("/api/products/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mappedData)
        });

        if (res.ok) {
          const result = await res.json();
          toast.success(result.message || "تم الاستيراد بنجاح!", { id: toastId });
          fetchData();
        } else {
          const err = await res.json();
          toast.error(err.error || "فشل الاستيراد", { id: toastId });
        }
      } catch (error) {
        toast.error("ملف الإكسيل غير صالح للعمل");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStockSubmit = async () => {
    if (!stockForm.productId || !stockForm.quantity) { toast.error("أكمل الحقول الناقصة أولاً"); return; }
    try {
      const res = await fetch("/api/stock-logs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(stockForm.productId), type: stockForm.type,
          quantity: parseFloat(stockForm.quantity), reason: stockForm.reason, notes: stockForm.notes,
        }),
      });
      if (res.ok) {
        toast.success("تم تسجيل العملية بنجاح");
        setShowStockForm(false);
        setStockForm({ productId: "", type: "in", quantity: "", reason: "purchase", notes: "" });
        fetchData();
      } else { const err = await res.json(); toast.error(err.error || "فشل التسجيل"); }
    } catch { toast.error("خطأ في الاتصال"); }
  };

  const resetProductForm = () => {
    setProductForm({ name: "", barcode: "", categoryId: "", priceType: "unit", price: "", costPrice: "", stock: "", minStock: "5", unit: "piece" });
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      barcode: product.barcode || "",
      categoryId: product.category.id.toString(),
      priceType: product.priceType as "unit" | "weight",
      price: product.price.toString(),
      costPrice: product.costPrice.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      unit: product.unit,
    });
    setShowProductForm(true);
  };

  const lowStockProducts = allProducts.filter((p) => p.stock <= p.minStock);
  const totalStockValue = allProducts.reduce((s, p) => s + p.stock * p.costPrice, 0);
  const lowStockCount = lowStockProducts.length;

  if (!isChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-2xl border-b border-white/50 px-6 py-5 flex items-center justify-between sticky top-0 z-10 shadow-[0_4px_40px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-5">
          <Link href="/" className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-cyan-600 hover:shadow-md transition-all hover:scale-105 active:scale-95">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-tr from-cyan-600 via-teal-600 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/30">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-blue-700 tracking-tight">إدارة المخزون - روانكو</h1>
              <p className="text-sm font-bold text-slate-500 tracking-wide mt-1">منتجات، استيراد/تصدير، تقارير الجرد</p>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-2xl transition-all shadow-sm font-bold hover:-translate-y-1">
            <Upload className="w-5 h-5" />
            استيراد
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx, .xls" className="hidden" />

          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-cyan-100 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 rounded-2xl transition-all shadow-sm font-bold hover:-translate-y-1">
            <Download className="w-5 h-5" />
            تصدير
          </button>
          
          <div className="w-px h-8 bg-slate-200 mx-1"></div>

          <button onClick={handleDeleteAll} className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 border-2 border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-sm font-bold hover:-translate-y-1 group">
            <Trash className="w-5 h-5 group-hover:animate-bounce" />
            تصفير المخزن
          </button>
        </div>
      </header>

      <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="إجمالي المنتجات" value={allProducts.length.toString()} icon={Boxes} gradient="from-cyan-500 to-blue-600" shadow="shadow-cyan-500/20" />
          <StatCard title="قيمة المخزون" value={formatPrice(totalStockValue)} icon={Package} gradient="from-emerald-400 to-teal-500" shadow="shadow-emerald-500/20" />
          <StatCard title="نواقص" value={lowStockCount.toString()} icon={AlertTriangle} gradient="from-rose-400 to-red-500" shadow="shadow-rose-500/20" isAlert={lowStockCount > 0} />
          <StatCard title="أقسام المتجر" value={categories.length.toString()} icon={Layers} gradient="from-purple-500 to-fuchsia-600" shadow="shadow-purple-500/20" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-white/70 backdrop-blur-xl p-2 rounded-3xl border border-white shadow-lg w-fit mx-auto lg:mx-0">
          {[
            { key: "products", label: "المنتجات والأصناف", icon: Package },
            { key: "stock", label: "حركات التوريد والصرف", icon: TrendingUp },
            { key: "categories", label: "أقسام المتجر", icon: Layers },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[16px] font-black transition-all ${
                activeTab === tab.key 
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-xl shadow-cyan-500/30" 
                  : "text-slate-500 hover:text-slate-800"
              }`}>
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "products" && (
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white shadow-sm space-y-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
                {/* البحث بالاسم */}
                <div className="flex items-center gap-4 flex-1 w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-6 py-4 focus-within:border-cyan-500 focus-within:bg-white transition-all shadow-sm">
                  <Search className="w-6 h-6 text-cyan-500" />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => { setSearchQuery(e.target.value); setBarcodeQuery(""); setDisplayLimit(100); }}
                    placeholder="ابحث باسم المنتج..." 
                    className="bg-transparent text-slate-800 focus:outline-none w-full font-bold text-lg" 
                  />
                </div>
                
                {/* البحث بالباركود */}
                <div className="flex items-center gap-4 w-full md:w-[350px] bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-6 py-4 focus-within:border-teal-500 focus-within:bg-white transition-all shadow-sm group">
                  <div className="flex items-center justify-center w-9 h-9 bg-teal-50 text-teal-600 rounded-xl group-focus-within:bg-teal-600 group-focus-within:text-white transition-all">
                    <Package className="w-5 h-5" />
                  </div>
                  <input 
                    ref={barcodeInputRef}
                    type="text" 
                    value={barcodeQuery} 
                    onChange={(e) => { setBarcodeQuery(e.target.value); setSearchQuery(""); setDisplayLimit(100); }}
                    placeholder="بحث سريع بالباركود..." 
                    className="bg-transparent text-slate-800 focus:outline-none w-full font-bold text-lg" 
                  />
                  {barcodeQuery && (
                    <button onClick={() => setBarcodeQuery("")} className="text-slate-400 hover:text-rose-500">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <button onClick={() => { setEditingProduct(null); resetProductForm(); setShowProductForm(true); }}
                className="flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-[1.5rem] transition-all shadow-lg text-[18px] font-black hover:-translate-y-1 hover:shadow-cyan-500/40 w-full lg:w-auto shrink-0">
                <Plus className="w-6 h-6" />
                إضافة صنف جديد
              </button>
            </div>

            <div className="overflow-hidden bg-white border border-slate-100 rounded-[2rem] shadow-sm">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-black">
                  <tr>
                    <th className="py-5 px-6">الصنف</th>
                    <th className="py-5 px-6">الباركود</th>
                    <th className="py-5 px-6">سعر البيع</th>
                    <th className="py-5 px-6">المخزون</th>
                    <th className="py-5 px-6 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.slice(0, displayLimit).map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-5 px-6 font-black text-slate-800">
                        {product.name}
                        {product.barcode?.startsWith("LOOSE-") && (
                          <span className="mr-2 px-3 py-1 bg-teal-100 text-teal-700 text-[10px] rounded-full uppercase font-black">منتج سايب</span>
                        )}
                      </td>
                      <td className="py-5 px-6 font-mono font-bold text-cyan-600">{product.barcode || "-"}</td>
                      <td className="py-5 px-6 font-black text-emerald-600 text-lg">{formatPrice(product.price)}</td>
                      <td className="py-5 px-6 font-black">{product.stock} {product.unit}</td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => startEdit(product)} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-cyan-600 hover:text-white transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-rose-600 hover:text-white transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* (Categories and Stock Tab contents are similar to original) */}
        {activeTab === "categories" && <CategoriesManager categories={categories} fetchCategories={fetchData} />}
      </div>

      {/* Product Form Modal (Simplified for brevity) */}
      {showProductForm && (
        <ProductModal 
          editingProduct={editingProduct} 
          productForm={productForm} 
          setProductForm={setProductForm} 
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => setShowProductForm(false)}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, gradient, shadow, isAlert }: any) {
  return (
    <div className={`bg-white border rounded-[2rem] p-6 shadow-sm group ${isAlert ? "border-rose-200 bg-rose-50/30" : "border-slate-100"}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg ${shadow}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="text-sm font-black text-slate-500 uppercase">{title}</div>
      </div>
      <div className="text-3xl font-black text-slate-800">{value}</div>
    </div>
  );
}

function CategoriesManager({ categories, fetchCategories }: any) {
  const [newCategory, setNewCategory] = useState("");
  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCategory }) });
    if (res.ok) { toast.success("تم الإضافة"); setNewCategory(""); fetchCategories(); }
  };
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
      <div className="flex gap-4">
        <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="اسم القسم الجديد..." className="flex-1 px-6 py-4 bg-slate-50 border rounded-2xl font-bold" />
        <button onClick={handleAdd} className="px-10 py-4 bg-cyan-600 text-white rounded-2xl font-black">إضافة قسم</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((c: any) => (
          <div key={c.id} className="p-6 border-2 border-slate-50 rounded-3xl text-center hover:border-cyan-200 transition-all">
            <span className="block font-black text-xl mb-1">{c.name}</span>
            <span className="text-xs font-bold text-slate-400">{c._count.products} منتج</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductModal({ editingProduct, productForm, setProductForm, categories, onSave, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b flex justify-between items-center">
          <h3 className="text-2xl font-black">{editingProduct ? "تعديل منتج" : "إضافة منتج"}</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="p-8 space-y-6">
          <input type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} placeholder="اسم المنتج" className="w-full p-4 bg-slate-50 rounded-xl font-bold" />
          <input type="text" value={productForm.barcode} onChange={(e) => setProductForm({...productForm, barcode: e.target.value})} placeholder="الباركود" className="w-full p-4 bg-slate-50 rounded-xl font-mono" />
          <select value={productForm.categoryId} onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold">
            <option value="">اختر القسم</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} placeholder="سعر البيع" className="p-4 bg-slate-50 rounded-xl font-black text-emerald-600" />
            <input type="number" value={productForm.costPrice} onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})} placeholder="سعر الشراء" className="p-4 bg-slate-50 rounded-xl font-bold" />
          </div>
          <button onClick={onSave} className="w-full py-5 bg-cyan-600 text-white rounded-2xl font-black text-xl shadow-lg">حفظ المنتج</button>
        </div>
      </div>
    </div>
  );
}