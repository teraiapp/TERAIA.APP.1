
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Boxes, PlusCircle, Scan, Search, Filter, AlertTriangle, 
    ArrowDownCircle, ArrowUpCircle, History, Trash2, Edit3, 
    X, Camera, Save, Info, Package, ChevronRight, Link as LinkIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services/inventoryService';
import { InventoryItem, InventoryMovement, MovementType, CompanyProfile } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import { WAREHOUSE_CATEGORIES } from '../../constants';

const InventoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { companyProfile } = useAppContext();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [view, setView] = useState<'stock' | 'history'>('stock');
    
    // Filtri
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('Tutte');
    const [showLowStock, setShowLowStock] = useState(false);

    // Modali
    const [itemModal, setItemModal] = useState<{show: boolean, data?: InventoryItem} | null>(null);
    const [movModal, setMovModal] = useState<{show: boolean, type: MovementType, item?: InventoryItem} | null>(null);
    const [photoModal, setPhotoModal] = useState(false);

    useEffect(() => {
        inventoryService.seed();
        refresh();
    }, []);

    const refresh = () => {
        setItems(inventoryService.getItems());
        setMovements(inventoryService.getMovements());
    };

    const categories = useMemo(() => {
        const type = companyProfile?.businessType || 'entrambi';
        const list = [...WAREHOUSE_CATEGORIES.COMUNI];
        if (type === 'agricoltura' || type === 'entrambi') list.push(...WAREHOUSE_CATEGORIES.AGRICOLTURA);
        if (type === 'allevamento' || type === 'entrambi') list.push(...WAREHOUSE_CATEGORIES.ALLEVAMENTO);
        return list;
    }, [companyProfile]);

    const filteredItems = useMemo(() => {
        return items.filter(i => {
            const mSearch = i.name.toLowerCase().includes(search.toLowerCase());
            const mCat = catFilter === 'Tutte' || i.category === catFilter;
            const mLow = !showLowStock || (i.minThreshold && i.currentQty <= i.minThreshold);
            return mSearch && mCat && mLow;
        });
    }, [items, search, catFilter, showLowStock]);

    const handleSaveItem = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const res = inventoryService.saveItem({
            name: f.get('name') as string,
            category: f.get('category') as string,
            unit: f.get('unit') as string,
            minThreshold: Number(f.get('threshold')) || undefined,
            tags: f.get('category').toString().includes('mangimi') ? ['allevamento'] : ['agricoltura']
        });
        if (res.error === 'DUPLICATE') alert("Articolo già esistente!");
        setItemModal(null);
        refresh();
    };

    const handleMovement = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        inventoryService.registerMovement({
            itemId: movModal!.item!.id,
            type: movModal!.type,
            qty: Number(f.get('qty')),
            unitCost: movModal!.type === 'IN' ? Number(f.get('cost')) : undefined,
            source: 'manual',
            note: f.get('note') as string
        });
        setMovModal(null);
        refresh();
    };

    const navigateToSource = (mov: InventoryMovement) => {
        if (!mov.sourceRef) return;
        const { module } = mov.sourceRef;
        
        switch (module) {
            case 'ALLEVAMENTO_ALIMENTAZIONE':
                navigate('/allevamento/alimentazione');
                break;
            case 'ALLEVAMENTO_SANITA':
                navigate('/allevamento/sanita');
                break;
            case 'INBOX':
                navigate(`/inbox/${mov.sourceRef.entityId}`);
                break;
            default:
                console.warn("Modulo sorgente non gestito:", module);
        }
    };

    const simulatePhotoUpload = () => {
        // Mock di scansione foto
        const found = items[0]; // Simula rilevamento primo articolo
        if (found) {
            setMovModal({ show: true, type: 'IN', item: found });
        }
        setPhotoModal(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Boxes className="text-primary" size={36} /> Magazzino & Stock
                    </h1>
                    <p className="text-text-secondary text-sm font-medium uppercase tracking-widest">v1.2 • Controllo Costi Integrato</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setView(view === 'stock' ? 'history' : 'stock')} className="px-5 py-3 bg-white border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-gray-50 flex items-center gap-2">
                        {view === 'stock' ? <><History size={16}/> Storico</> : <><Package size={16}/> Giacenze</>}
                    </button>
                    <button onClick={() => setPhotoModal(true)} className="px-5 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        <Camera size={16}/> Scansiona
                    </button>
                    <button onClick={() => setItemModal({show: true})} className="px-5 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        <PlusCircle size={16}/> Nuovo Articolo
                    </button>
                </div>
            </div>

            {view === 'stock' ? (
                <>
                    {/* FILTRI */}
                    <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50 flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18}/>
                            <input className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Cerca tra gli articoli..." value={search} onChange={e => setSearch(e.target.value)}/>
                        </div>
                        <select className="p-3 bg-gray-50 rounded-xl font-bold text-sm border-none outline-none focus:ring-2 focus:ring-primary" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                            <option>Tutte</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                        <button onClick={() => setShowLowStock(!showLowStock)} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${showLowStock ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-50 text-text-secondary'}`}>
                            Sotto Soglia
                        </button>
                    </div>

                    {/* GRID ARTICOLI */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                            <div key={item.id} className={`bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col justify-between group hover:border-primary transition-all relative overflow-hidden ${item.currentQty <= (item.minThreshold || 0) ? 'ring-2 ring-red-500/20' : ''}`}>
                                {item.currentQty <= (item.minThreshold || 0) && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-2xl font-black text-[8px] uppercase tracking-widest animate-pulse">Sotto Soglia</div>
                                )}
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="px-3 py-1 bg-gray-50 text-text-secondary rounded-full text-[9px] font-black uppercase tracking-widest">{item.category}</span>
                                        <button onClick={() => {if(confirm('Eliminare?')) { inventoryService.deleteItem(item.id); refresh(); }}} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                    <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter leading-none mb-4 truncate">{item.name}</h3>
                                    
                                    <div className="flex items-end gap-2 mb-8">
                                        <p className={`text-5xl font-black ${item.currentQty <= (item.minThreshold || 0) ? 'text-red-500' : 'text-text-primary'}`}>{item.currentQty}</p>
                                        <p className="text-sm font-black text-text-secondary uppercase mb-2">{item.unit}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6 mb-8">
                                        <div>
                                            <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Costo Medio</p>
                                            <p className="font-black text-sm text-primary">€ {item.avgCost.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Valore Tot.</p>
                                            <p className="font-black text-sm text-text-primary">€ {(item.currentQty * item.avgCost).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setMovModal({show: true, type: 'IN', item})} className="py-3 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-green-600 flex items-center justify-center gap-2">
                                        <ArrowDownCircle size={14}/> Carico
                                    </button>
                                    <button onClick={() => setMovModal({show: true, type: 'OUT', item})} className="py-3 bg-orange-500 text-white rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-orange-600 flex items-center justify-center gap-2">
                                        <ArrowUpCircle size={14}/> Scarico
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                /* TABELLA STORICO */
                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b text-text-secondary uppercase text-[10px] font-black tracking-widest">
                                <tr>
                                    <th className="p-6">Data</th>
                                    <th className="p-6">Articolo</th>
                                    <th className="p-6">Tipo</th>
                                    <th className="p-6">Quantità</th>
                                    <th className="p-6">Costo Uni.</th>
                                    <th className="p-6">Totale</th>
                                    <th className="p-6">Sorgente</th>
                                    <th className="p-6 text-right">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {movements.map(m => {
                                    const it = items.find(i => i.id === m.itemId);
                                    return (
                                        <tr key={m.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="p-6 font-bold">{new Date(m.date).toLocaleDateString()}</td>
                                            <td className="p-6 font-black uppercase text-xs">{it?.name || 'Sconosciuto'}</td>
                                            <td className="p-6">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${m.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{m.type}</span>
                                            </td>
                                            <td className="p-6 font-black">{m.qty} {it?.unit}</td>
                                            <td className="p-6 text-text-secondary">€ {m.unitCost?.toFixed(2)}</td>
                                            <td className="p-6 font-black text-text-primary">€ {m.totalCost?.toFixed(2)}</td>
                                            <td className="p-6">
                                                <span className={`px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                                    m.source === 'livestock_feeding' ? 'bg-blue-50 text-blue-600' : 
                                                    m.source === 'livestock_sanitary' ? 'bg-purple-50 text-purple-600' : 
                                                    m.source === 'invoice' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {m.source.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                {m.sourceRef && (
                                                    <button 
                                                        onClick={() => navigateToSource(m)} 
                                                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all" 
                                                        title="Vai al modulo correlato"
                                                    >
                                                        <LinkIcon size={16}/>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODALE NUOVO ARTICOLO */}
            {itemModal?.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <form onSubmit={handleSaveItem} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-lg border-2 border-white animate-in zoom-in">
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Nuovo Articolo</h2>
                        <div className="space-y-4">
                            <div><label className="text-[10px] font-black uppercase text-text-secondary ml-1">Nome*</label><input name="name" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" placeholder="Es: Nitrato Ammonico"/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Categoria*</label>
                                    <select name="category" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none">
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-[10px] font-black uppercase text-text-secondary ml-1">Unità*</label><input name="unit" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" placeholder="kg, lt, pz..."/></div>
                            </div>
                            <div><label className="text-[10px] font-black uppercase text-text-secondary ml-1">Soglia Minima (Giacenza)</label><input name="threshold" type="number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" placeholder="Avvisami sotto..."/></div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button type="button" onClick={() => setItemModal(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-xs uppercase">Annulla</button>
                            <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase shadow-lg">Crea</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODALE MOVIMENTO */}
            {movModal?.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <form onSubmit={handleMovement} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-lg border-2 border-white animate-in zoom-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-4 rounded-3xl ${movModal.type === 'IN' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                {movModal.type === 'IN' ? <ArrowDownCircle/> : <ArrowUpCircle/>}
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">{movModal.type === 'IN' ? 'Carico Merce' : 'Scarico Merce'}</h2>
                                <p className="text-xs font-bold text-text-secondary uppercase">{movModal.item?.name}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-black uppercase text-text-secondary ml-1">Quantità ({movModal.item?.unit})*</label><input name="qty" type="number" step="0.01" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none text-2xl" placeholder="0.00"/></div>
                                {movModal.type === 'IN' ? (
                                    <div><label className="text-[10px] font-black uppercase text-text-secondary ml-1">Costo Unitario (€)*</label><input name="cost" type="number" step="0.01" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none text-2xl" placeholder="0.00"/></div>
                                ) : (
                                    <div className="flex flex-col justify-center px-4"><p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Costo Stimato</p><p className="text-xl font-black text-orange-500">€ {movModal.item?.avgCost.toFixed(2)} / {movModal.item?.unit}</p></div>
                                )}
                            </div>
                            <div><label className="text-[10px] font-black uppercase text-text-secondary ml-1">Note / Rif. DDT / Lotto</label><input name="note" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none text-sm"/></div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button type="button" onClick={() => setMovModal(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-xs uppercase">Annulla</button>
                            <button type="submit" className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase shadow-lg ${movModal.type === 'IN' ? 'bg-green-600' : 'bg-orange-600'}`}>Conferma</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODALE FOTO */}
            {photoModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[48px] p-12 w-full max-w-lg text-center animate-in slide-in-from-bottom-10">
                        <div className="p-10 bg-primary/10 rounded-full w-fit mx-auto mb-8"><Scan size={64} className="text-primary"/></div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">Intelligenza Visiva</h2>
                        <p className="text-text-secondary font-medium mb-10 italic">"Punta l'etichetta del prodotto o lo scontrino per estrarre dati e costi automaticamente."</p>
                        <div className="space-y-3">
                            <button onClick={simulatePhotoUpload} className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-all">
                                <Camera size={20}/> Carica Foto
                            </button>
                            <button onClick={() => setPhotoModal(false)} className="w-full py-5 text-text-secondary font-black uppercase text-[10px] tracking-widest">Annulla</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
