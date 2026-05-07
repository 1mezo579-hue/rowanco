"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import toast from "react-hot-toast";
import { formatPrice, formatDate } from "@/lib/utils";
import { ArrowRight, Plus, Contact, Search, Phone, FileText, ChevronDown, Package, X } from "lucide-react";

interface Trader {
  id: number;
  name: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  balance: number;
  createdAt: string;
}

interface TraderInvoice {
  id: number;
  invoiceNo: string;
  total: number;
  paid: number;
  remaining: number;
  createdAt: string;
  items: any[];
}

interface TraderPayment {
  id: number;
  amount: number;
  method: string;
  notes: string | null;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  costPrice: number;
}

export default function TradersPage() {
  const { user, isChecked } = useRequireAuth(["admin", "manager"]);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showTraderForm, setShowTraderForm] = useState(false);
  const [editingTrader, setEditingTrader] = useState<Trader | null>(null);
  const [traderForm, setTraderForm] = useState({ name: "", phone: "", company: "", address: "", notes: "" });
  
  const [showInvoiceModal, setShowInvoiceModal] = useState<Trader | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [invoiceForm, setInvoiceForm] = useState({ total: "", paid: "", notes: "" });
  const [selectedProduct, setSelectedProduct] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState<Trader | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", notes: "", method: "cash" });

  const [showHistoryModal, setShowHistoryModal] = useState<Trader | null>(null);
  const [traderHistory, setTraderHistory] = useState<{invoices: TraderInvoice[], payments: TraderPayment[]}>({invoices: [], payments: []});
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchTraders();
    fetchProducts();
  }, []);

  const fetchTraders = async () => {
    try {
      const res = await fetch("/api/traders");
      const data = await res.json();
      setTraders(Array.isArray(data) ? data : []);
    } catch { toast.error("فشل تحميل الموردين"); }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { console.error("Failed to load products"); }
  };

  const saveTrader = async () => {
    if (!traderForm.name) return toast.error("اسم التاجر مطلوب");
    try {
      const url = editingTrader ? `/api/traders/${editingTrader.id}` : "/api/traders";
      const method = editingTrader ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(traderForm),
      });
      if (!res.ok) throw new Error();
      toast.success(editingTrader ? "تم تعديل بيانات التاجر" : "تمت إضافة التاجر");
      setShowTraderForm(false);
      setEditingTrader(null);
      setTraderForm({ name: "", phone: "", company: "", address: "", notes: "" });
      fetchTraders();
    } catch { toast.error("فشل حفظ بيانات التاجر"); }
  };

  const deleteTrader = async (id: number) => {
    if (!confirm("هل أنت متأكد من مسح هذا التاجر نهائياً؟ سيتم مسح جميع فواتيره المرتبطة به أيضاً.")) return;
    try {
      const res = await fetch(`/api/traders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("تم مسح التاجر بنجاح");
      fetchTraders();
    } catch { toast.error("فشل مسح التاجر"); }
  };

  const addInvoiceItem = () => {
    if (!selectedProduct) return;
    const p = products.find(x => x.id.toString() === selectedProduct);
    if (!p) return;
    
    setInvoiceItems([...invoiceItems, { 
      productId: p.id, 
      name: p.name, 
      description: p.name,
      quantity: 1, 
      price: p.costPrice, 
      total: p.costPrice 
    }]);
    setSelectedProduct("");
  };

  const updateItem = (index: number, field: string, value: string) => {
    const num = parseFloat(value) || 0;
    const newItems = [...invoiceItems];
    newItems[index][field] = num;
    if (field === "quantity" || field === "price") {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }
    setInvoiceItems(newItems);
  };

  const saveInvoice = async () => {
    if (!showInvoiceModal) return;
    const totalAmount = parseFloat(invoiceForm.total) || 0;
    const paidAmount = parseFloat(invoiceForm.paid) || 0;
    
    if (totalAmount <= 0) return toast.error("يجب إدخال إجمالي الفاتورة");

    try {
      const res = await fetch("/api/traders/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traderId: showInvoiceModal.id,
          total: totalAmount,
          paid: paidAmount,
          notes: invoiceForm.notes,
          items: invoiceItems,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("تم تسجيل الفاتورة بنجاح وتحديث الرصيد والمخزون");
      setShowInvoiceModal(null);
      setInvoiceItems([]);
      setInvoiceForm({ total: "", paid: "", notes: "" });
      fetchTraders(); // Refresh balances
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الفاتورة");
    }
  };

  const savePayment = async () => {
    if (!showPaymentModal) return;
    const amount = parseFloat(paymentForm.amount) || 0;
    if (amount <= 0) return toast.error("يجب إدخال المبلغ");

    try {
      const res = await fetch("/api/traders/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traderId: showPaymentModal.id,
          amount,
          method: paymentForm.method,
          notes: paymentForm.notes,
          userId: user?.id,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("تم تسجيل الدفعة بنجاح");
      setShowPaymentModal(null);
      setPaymentForm({ amount: "", notes: "", method: "cash" });
      fetchTraders();
    } catch {
      toast.error("فشل تسجيل الدفعة");
    }
  };

  const fetchHistory = async (trader: Trader) => {
    setShowHistoryModal(trader);
    setLoadingHistory(true);
    try {
      // For now we fetch all and filter client side, or we can make specific APIs
      // Let's assume we have endpoints for these or use the existing ones if they support filtering
      const [invRes, payRes] = await Promise.all([
        fetch("/api/traders/invoices"),
        fetch("/api/traders/payments")
      ]);
      const allInvoices: TraderInvoice[] = await invRes.json();
      const allPayments: TraderPayment[] = await payRes.json();
      
      setTraderHistory({
        invoices: allInvoices.filter((i: any) => i.trader.id === trader.id),
        payments: allPayments.filter((p: any) => (p as any).traderId === trader.id || (p as any).trader?.id === trader.id)
      });
    } catch {
      toast.error("فشل تحميل سجل المعاملات");
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isChecked) return null;

  const filtered = traders.filter(t => t.name.includes(searchQuery) || (t.company && t.company.includes(searchQuery)));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-slate-200">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shadow-lg shadow-slate-800/20">
              <Contact className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">التجار والموردين</h1>
              <p className="text-sm text-slate-500 font-medium">إدارة الحسابات والفواتير</p>
            </div>
          </div>
        </div>
        <button onClick={() => {
          setEditingTrader(null);
          setTraderForm({ name: "", phone: "", company: "", address: "", notes: "" });
          setShowTraderForm(true);
        }} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-all shadow-sm font-bold">
          <Plus className="w-5 h-5" />
          تاجر جديد
        </button>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="relative max-w-md">
          <input type="text" placeholder="بحث باسم التاجر أو الشركة..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-slate-500 outline-none shadow-sm" />
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{t.name}</h3>
                  {t.company && <div className="text-sm font-bold text-slate-500 mt-1">{t.company}</div>}
                </div>
              </div>
              
              <div className={`mt-4 p-4 rounded-xl border ${t.balance > 0 ? 'bg-rose-50 border-rose-100' : t.balance < 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className="text-sm font-bold mb-1">{t.balance > 0 ? "عليه لنا (دائن)" : t.balance < 0 ? "له عندنا (مدين)" : "الرصيد مصفر"}</div>
                <div className={`text-2xl font-black ${t.balance > 0 ? 'text-rose-600' : t.balance < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {formatPrice(Math.abs(t.balance))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={() => setShowInvoiceModal(t)} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold transition-colors text-sm">
                  <FileText className="w-4 h-4" /> فاتورة
                </button>
                <button onClick={() => setShowPaymentModal(t)} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2.5 rounded-xl font-bold transition-colors text-sm">
                  <Package className="w-4 h-4" /> سداد دفعة
                </button>
                <button onClick={() => fetchHistory(t)} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2.5 rounded-xl font-bold transition-colors text-sm">
                  <Search className="w-4 h-4" /> السجل
                </button>
                <button onClick={() => {
                  setEditingTrader(t);
                  setTraderForm({ name: t.name, phone: t.phone || "", company: t.company || "", address: t.address || "", notes: t.notes || "" });
                  setShowTraderForm(true);
                }} className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold transition-colors">
                  تعديل
                </button>
                <button onClick={() => deleteTrader(t.id)} className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition-colors">
                  مسح
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">فاتورة مشتريات جديدة</h2>
                <p className="text-slate-500 text-sm mt-1">التاجر: <span className="font-bold text-slate-700">{showInvoiceModal.name}</span></p>
              </div>
              <button onClick={() => {setShowInvoiceModal(null); setInvoiceItems([]);}} className="p-2 text-slate-400 hover:bg-white rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Product Selector */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">إضافة منتج للفاتورة (لتحديث المخزون تلقائياً)</label>
                  <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-slate-500 outline-none">
                    <option value="">-- اختر منتج --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <button onClick={addInvoiceItem} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4" /> إضافة
                </button>
              </div>

              {/* Items Table */}
              {invoiceItems.length > 0 && (
                <table className="w-full text-right border border-slate-200 rounded-xl overflow-hidden block">
                  <thead className="bg-slate-50 border-b border-slate-200 block">
                    <tr className="flex w-full">
                      <th className="p-3 w-1/3 font-bold text-slate-600">المنتج</th>
                      <th className="p-3 w-1/6 font-bold text-slate-600">الكمية</th>
                      <th className="p-3 w-1/6 font-bold text-slate-600">سعر الوحدة</th>
                      <th className="p-3 w-1/6 font-bold text-slate-600">الإجمالي</th>
                      <th className="p-3 w-1/6"></th>
                    </tr>
                  </thead>
                  <tbody className="block max-h-48 overflow-y-auto w-full">
                    {invoiceItems.map((item, i) => (
                      <tr key={i} className="flex w-full border-b border-slate-100 items-center">
                        <td className="p-3 w-1/3 font-bold">{item.name}</td>
                        <td className="p-3 w-1/6"><input type="number" value={item.quantity} onChange={e=>updateItem(i, "quantity", e.target.value)} className="w-full border rounded px-2 py-1" /></td>
                        <td className="p-3 w-1/6"><input type="number" value={item.price} onChange={e=>updateItem(i, "price", e.target.value)} className="w-full border rounded px-2 py-1" /></td>
                        <td className="p-3 w-1/6 font-black text-slate-700">{formatPrice(item.total)}</td>
                        <td className="p-3 w-1/6 text-left"><button onClick={() => setInvoiceItems(invoiceItems.filter((_, idx)=>idx!==i))} className="text-red-500 hover:text-red-700 text-sm font-bold">حذف</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Invoice Totals Form */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">إجمالي الفاتورة (المطلوب)</label>
                  <input type="number" value={invoiceForm.total} onChange={e => setInvoiceForm({...invoiceForm, total: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xl font-black focus:ring-2 focus:ring-slate-500 outline-none text-left" dir="ltr" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">المدفوع نقداً للتاجر</label>
                  <input type="number" value={invoiceForm.paid} onChange={e => setInvoiceForm({...invoiceForm, paid: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xl font-black text-emerald-600 focus:ring-2 focus:ring-slate-500 outline-none text-left" dir="ltr" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات / رقم الفاتورة الورقية</label>
                <input type="text" value={invoiceForm.notes} onChange={e => setInvoiceForm({...invoiceForm, notes: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-slate-500 outline-none" />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex gap-3 justify-between items-center">
              <div className="text-sm font-bold text-slate-500">
                المتبقي (سيضاف للرصيد): <span className="text-lg text-rose-600">{formatPrice(Math.max(0, (parseFloat(invoiceForm.total)||0) - (parseFloat(invoiceForm.paid)||0)))}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => {setShowInvoiceModal(null); setInvoiceItems([]);}} className="px-6 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors">إلغاء</button>
                <button onClick={saveInvoice} className="px-8 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold transition-colors">حفظ الفاتورة</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
              <div>
                <h2 className="text-xl font-bold text-emerald-900">سداد دفعة للتاجر</h2>
                <p className="text-emerald-700 text-sm mt-1">{showPaymentModal.name}</p>
              </div>
              <button onClick={() => setShowPaymentModal(null)} className="p-2 text-emerald-400 hover:bg-white rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">المبلغ المدفوع</label>
                <input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xl font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none text-left" dir="ltr" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">طريقة الدفع</label>
                <select value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="cash">نقداً (Cash)</option>
                  <option value="transfer">تحويل بنكي</option>
                  <option value="check">شيك</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات</label>
                <input type="text" value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="مثلاً: دفعة تحت الحساب" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={savePayment} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all">تأكيد الدفع</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900">سجل المعاملات</h2>
                <p className="text-slate-500 text-sm mt-1">التاجر: <span className="font-bold text-slate-700">{showHistoryModal.name}</span></p>
              </div>
              <button onClick={() => setShowHistoryModal(null)} className="p-2 text-slate-400 hover:bg-white rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Combine and sort history */}
                  {[
                    ...traderHistory.invoices.map(inv => ({ ...inv, type: 'invoice' as const })),
                    ...traderHistory.payments.map(pay => ({ ...pay, type: 'payment' as const }))
                  ]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${item.type === 'invoice' ? 'border-rose-100 bg-rose-50/30' : 'border-emerald-100 bg-emerald-50/30'} flex justify-between items-center`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'invoice' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {item.type === 'invoice' ? <FileText className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {item.type === 'invoice' ? `فاتورة مشتريات #${(item as any).invoiceNo}` : `دفعة نقدية (${(item as any).method})`}
                          </div>
                          <div className="text-xs text-slate-500">{formatDate(item.createdAt)}</div>
                          {item.notes && <div className="text-sm text-slate-600 mt-1">{item.notes}</div>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-black ${item.type === 'invoice' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {item.type === 'invoice' ? `+ ${formatPrice((item as any).total)}` : `- ${formatPrice((item as any).amount)}`}
                        </div>
                        {item.type === 'invoice' && (item as any).paid > 0 && (
                          <div className="text-xs text-slate-400">مدفوع منها: {formatPrice((item as any).paid)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {traderHistory.invoices.length === 0 && traderHistory.payments.length === 0 && (
                    <div className="text-center py-10 text-slate-400 font-medium">لا توجد معاملات مسجلة لهذا التاجر</div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-between items-center">
              <div className="text-slate-500 font-bold">إجمالي الرصيد الحالي:</div>
              <div className={`text-2xl font-black ${showHistoryModal.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatPrice(Math.abs(showHistoryModal.balance))} {showHistoryModal.balance > 0 ? '(دائن)' : '(مدين)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Trader Form Modal */}
      {showTraderForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingTrader ? "تعديل بيانات التاجر" : "إضافة تاجر جديد"}</h2>
              <button onClick={() => setShowTraderForm(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <input type="text" placeholder="اسم التاجر أو المندوب *" value={traderForm.name} onChange={e => setTraderForm({...traderForm, name: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-500" />
              <input type="text" placeholder="اسم الشركة (اختياري)" value={traderForm.company} onChange={e => setTraderForm({...traderForm, company: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-500" />
              <input type="tel" placeholder="رقم التليفون" value={traderForm.phone} onChange={e => setTraderForm({...traderForm, phone: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-500" />
              <textarea placeholder="ملاحظات إضافية" value={traderForm.notes} onChange={e => setTraderForm({...traderForm, notes: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-500 min-h-[100px]" />
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={saveTrader} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold">حفظ البيانات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
