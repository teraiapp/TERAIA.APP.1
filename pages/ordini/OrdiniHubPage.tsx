
import React, { useState, useMemo, useEffect } from 'react';
import { 
    ShoppingCart, Truck, FileText, PlusCircle, Search, 
    Filter, MapPin, Phone, Mail, CheckCircle, X, 
    ArrowRight, Package, Calendar, Tag, Info, Trash2,
    Check
} from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
    Supplier, QuoteRequest, AgriOrder, SupplierCategory,
    INITIAL_SUPPLIERS
} from '../../data/teraiaModulesData';
import { regions } from '../../data/geo/italyGeoData';

const STORAGE_SUP = 'teraia_suppliers_v1';
const STORAGE_QUO = 'teraia_quotes_v1';
const STORAGE_ORD = 'teraia_orders_v1';

const OrdiniHubPage: React.FC = () => {
    const { companyProfile } = useAppContext();
    const [activeTab, setActiveTab] = useState<'catalog' | 'quotes' | 'orders'>('catalog');

    // --- STATE ---
    const [suppliers, setSuppliers] = useState<Supplier[]>(() => JSON.parse(localStorage.getItem(STORAGE_SUP) || JSON.stringify(INITIAL_SUPPLIERS)));
    const [quotes, setQuotes] = useState<QuoteRequest[]>(() => JSON.parse(localStorage.getItem(STORAGE_QUO) || '[]'));
    const [orders, setOrders] = useState<AgriOrder[]>(() => JSON.parse(localStorage.getItem(STORAGE_ORD) || '[]'));
    const units = useMemo(() => JSON.parse(localStorage.getItem('teraia_production_units_v1') || '[]'), []);

    // Modals
    const [modal, setModal] = useState<{ type: 'contact' | 'quote' | 'detail', data?: any } | null>(null);

    // Filter
    const [selRegion, setSelRegion] = useState('');
    const [selCat, setSelCat] = useState<string>('Tutte');

    // Persistence
    useEffect(() => { localStorage.setItem(STORAGE_SUP, JSON.stringify(suppliers)); }, [suppliers]);
    useEffect(() => { localStorage.setItem(STORAGE_QUO, JSON.stringify(quotes)); }, [quotes]);
    useEffect(() => { localStorage.setItem(STORAGE_ORD, JSON.stringify(orders)); }, [orders]);

    // Computed
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => {
            const mReg = !selRegion || s.region === selRegion;
            const mCat = selCat === 'Tutte' || s.category === selCat;
            return mReg && mCat;
        });
    }, [suppliers, selRegion, selCat]);

    // --- HANDLERS ---
    const handleSendQuote = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const newQuote: QuoteRequest = {
            id: `quo-${Date.now()}`,
            supplierId: modal?.data.id,
            supplierName: modal?.data.name,
            category: modal?.data.category,
            product: f.get('product') as string,
            quantity: Number(f.get('quantity')),
            unit: f.get('unit') as string,
            deliveryDate: f.get('deliveryDate') as string,
            unitId: f.get('unitId') as string,
            status: 'inviata',
            notes: f.get('notes') as string
        };
        setQuotes([newQuote, ...quotes]);
        setModal(null);
        setActiveTab('quotes');
        alert("Richiesta preventivo inviata al fornitore!");
    };

    const convertToOrder = (quote: QuoteRequest) => {
        const newOrder: AgriOrder = {
            id: `ord-${Date.now()}`,
            supplierName: quote.supplierName,
            amount: quote.priceOffer || 0,
            date: new Date().toISOString().split('T')[0],
            status: 'in_preparazione',
            quoteId: quote.id
        };
        setOrders([newOrder, ...orders]);
        setQuotes(quotes.map(q => q.id === quote.id ? { ...q, status: 'accettata' } : q));
        setActiveTab('orders');
        alert("Ordine creato con successo!");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <ShoppingCart className="text-primary" size={36} /> Gestione Ordini & Approvvigionamento
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Catalogo fornitori e logistica input tecnici.</p>
                </div>
            </div>

            {/* TAB NAV */}
            <div className="flex p-1 bg-gray-100 rounded-[24px] w-fit shadow-inner">
                {[
                    { id: 'catalog', label: 'Fornitori', icon: Truck },
                    { id: 'quotes', label: 'Preventivi', icon: FileText },
                    { id: 'orders', label: 'Ordini', icon: Package }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${
                            activeTab === tab.id ? 'bg-white text-primary shadow-md' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="space-y-8">
                {activeTab === 'catalog' && (
                    <div className="space-y-6">
                        {/* FILTERS */}
                        <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50 flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Filtra Regione</label>
                                <select className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary" value={selRegion} onChange={e=>setSelRegion(e.target.value)}>
                                    <option value="">Tutte le Regioni</option>
                                    {regions.map(r => <option key={r.code} value={r.name}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-[10px] font-black uppercase text-text-secondary mb-1 block ml-1">Categoria</label>
                                <select className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary" value={selCat} onChange={e=>setSelCat(e.target.value)}>
                                    <option value="Tutte">Tutte le Categorie</option>
                                    {['vivaio', 'concimi', 'sementi', 'fitosanitari', 'animali', 'mangimi', 'attrezzature'].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* LIST */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSuppliers.map(s => (
                                <div key={s.id} className="bg-white rounded-[32px] p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl bg-primary/10 text-primary`}>
                                            <Truck size={24}/>
                                        </div>
                                        <span className="px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">{s.category}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-text-primary mb-2 group-hover:text-primary transition-colors">{s.name}</h3>
                                    <p className="text-xs text-text-secondary flex items-center gap-1 mb-6 font-bold"><MapPin size={14}/> {s.city} ({s.province}), {s.region}</p>
                                    
                                    <div className="space-y-4 pt-4 border-t border-gray-50">
                                        <div className="flex gap-2">
                                            <button onClick={() => setModal({ type: 'contact', data: s })} className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black">Contatta</button>
                                            <button onClick={() => setModal({ type: 'quote', data: s })} className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark">Preventivo</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'quotes' && (
                    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black">
                                <tr>
                                    <th className="p-6">Fornitore</th>
                                    <th className="p-6">Prodotto</th>
                                    <th className="p-6">Unità Dest.</th>
                                    <th className="p-6">Stato</th>
                                    <th className="p-6 text-right">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {quotes.length > 0 ? quotes.map(q => (
                                    <tr key={q.id} className="hover:bg-gray-50">
                                        <td className="p-6 font-black">{q.supplierName}</td>
                                        <td className="p-6">
                                            <p className="font-bold">{q.product}</p>
                                            <p className="text-xs text-text-secondary font-medium">{q.quantity} {q.unit}</p>
                                        </td>
                                        <td className="p-6 font-bold text-text-secondary">
                                            {units.find((u:any)=>u.id === q.unitId)?.name || 'Generale'}
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                                q.status === 'risposta' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                                                q.status === 'accettata' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                                            }`}>
                                                {q.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {q.status === 'risposta' && (
                                                    <button onClick={() => convertToOrder(q)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><Check size={16}/></button>
                                                )}
                                                <button onClick={() => setQuotes(quotes.filter(curr=>curr.id !== q.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="p-20 text-center text-text-secondary italic">Nessuna richiesta inviata.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {orders.length > 0 ? orders.map(o => (
                            <div key={o.id} className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                                        <Package size={32}/>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-text-primary uppercase tracking-tighter">{o.supplierName}</h3>
                                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-2">{new Date(o.date).toLocaleDateString()}</p>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                o.status === 'consegnato' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {o.status.replace('_', ' ')}
                                            </span>
                                            <p className="text-lg font-black text-primary">€ {o.amount}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {o.status !== 'consegnato' && (
                                        <button onClick={() => setOrders(orders.map(curr=>curr.id===o.id?{...curr, status:'consegnato'}:curr))} className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase">Segna Consegnato</button>
                                    )}
                                    <button onClick={() => window.print()} className="px-4 py-2 bg-gray-100 text-text-primary rounded-xl text-[10px] font-black uppercase">Riepilogo PDF</button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center text-text-secondary italic bg-gray-50 rounded-[40px] border-2 border-dashed">
                                Nessun ordine attivo.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODALS */}
            {modal?.type === 'contact' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Contatta {modal.data.name}</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                <p className="text-sm font-bold flex items-center gap-2"><Phone size={14}/> {modal.data.phone}</p>
                                <p className="text-sm font-bold flex items-center gap-2 text-primary"><Mail size={14}/> {modal.data.email}</p>
                            </div>
                            <textarea placeholder="Scrivi il tuo messaggio..." rows={4} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary"></textarea>
                            <button onClick={() => { alert('Messaggio inviato!'); setModal(null); }} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Invia Messaggio</button>
                        </div>
                    </div>
                </div>
            )}

            {modal?.type === 'quote' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-white">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Richiedi Preventivo</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                        </div>
                        <form onSubmit={handleSendQuote} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Prodotto Richiesto*</label>
                                    <input name="product" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Es. Concime NPK 20-20-20"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Quantità*</label>
                                        <input name="quantity" type="number" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="0"/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Unità*</label>
                                        <select name="unit" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                            <option>kg</option><option>pz</option><option>litri</option><option>piantine</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Unità Destinazione</label>
                                    <select name="unitId" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
                                        <option value="">Nessuna</option>
                                        {units.map((u:any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Consegna Desiderata</label>
                                    <input name="deliveryDate" type="date" required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Note Extra</label>
                                <textarea name="notes" rows={3} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm" placeholder="Specifica dettagli logistici..."/>
                            </div>
                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-xl uppercase tracking-widest text-xs">Invia Richiesta Preventivo</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdiniHubPage;
