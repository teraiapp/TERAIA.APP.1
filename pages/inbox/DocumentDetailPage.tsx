
import React, { useState, useEffect } from 'react';
import { 
    ChevronLeft, Save, CheckCircle2, Archive, 
    Plus, Trash2, FileText, Info, AlertCircle,
    Package, Banknote, Link as LinkIcon
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { inboxService } from '../../services/inboxService';
import { InboxDocument, InboxDocRow, InboxDocType, LedgerCategory } from '../../types';
import { WAREHOUSE_CATEGORIES, COST_CATEGORIES } from '../../constants';

const DocumentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [doc, setDoc] = useState<InboxDocument | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const documents = inboxService.getDocuments();
        const found = documents.find(d => d.id === id);
        if (found) {
            setDoc({ ...found });
        } else {
            navigate('/inbox');
        }
    }, [id, navigate]);

    if (!doc) return null;

    const handleSaveDraft = () => {
        setIsSaving(true);
        inboxService.updateDocument(doc);
        setTimeout(() => {
            setIsSaving(false);
            alert("Bozza salvata con successo!");
        }, 500);
    };

    const handleConfirm = () => {
        if (!doc.supplierName || doc.totalAmount <= 0) {
            alert("Compila Fornitore e Totale prima di confermare.");
            return;
        }
        if (confirm("Confermare e registrare il documento in Bilancio e Magazzino?")) {
            inboxService.confirmAndRegister(doc);
            navigate('/inbox');
        }
    };

    const handleAddRow = () => {
        const newRow: InboxDocRow = {
            id: `row-${Date.now()}`,
            description: '',
            category: 'altro',
            qty: 1,
            unit: 'pz',
            unitPrice: 0,
            total: 0
        };
        setDoc({ ...doc, rows: [...doc.rows, newRow] });
    };

    const handleRemoveRow = (rowId: string) => {
        setDoc({ ...doc, rows: doc.rows.filter(r => r.id !== rowId) });
    };

    const updateRow = (rowId: string, field: keyof InboxDocRow, value: any) => {
        const updatedRows = doc.rows.map(r => {
            if (r.id === rowId) {
                const updated = { ...r, [field]: value };
                if (field === 'qty' || field === 'unitPrice') {
                    updated.total = updated.qty * updated.unitPrice;
                }
                return updated;
            }
            return r;
        });
        setDoc({ ...doc, rows: updatedRows });
    };

    const allCategories = [
        ...WAREHOUSE_CATEGORIES.COMUNI,
        ...WAREHOUSE_CATEGORIES.AGRICOLTURA,
        ...WAREHOUSE_CATEGORIES.ALLEVAMENTO
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* TOP BAR */}
            <div className="flex justify-between items-center">
                <button onClick={() => navigate('/inbox')} className="flex items-center gap-2 text-text-secondary hover:text-primary font-black text-[10px] uppercase tracking-widest transition-colors">
                    <ChevronLeft size={16}/> Torna a Inbox
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={() => { if(confirm('Archiviare il documento?')) { inboxService.updateDocument({...doc, status: 'ARCHIVED'}); navigate('/inbox'); } }}
                        className="px-5 py-3 bg-white border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Archive size={16}/> Archivia
                    </button>
                    <button 
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                        className="px-5 py-3 bg-white border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Save size={16}/> {isSaving ? 'Salvataggio...' : 'Salva Bozza'}
                    </button>
                    {doc.status !== 'CONFIRMED' && (
                        <button 
                            onClick={handleConfirm}
                            className="px-5 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <CheckCircle2 size={16}/> Conferma e Registra
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* PREVIEW & INFO */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-black text-[10px] uppercase tracking-widest text-text-secondary">Preview Documento</h3>
                            <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${doc.status === 'NEW' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {doc.status}
                            </span>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center min-h-[300px] bg-gray-100/50">
                            {doc.fileDataUrl ? (
                                <img src={doc.fileDataUrl} alt="Preview" className="max-w-full rounded-2xl shadow-lg" />
                            ) : (
                                <div className="text-center space-y-4">
                                    <FileText size={64} className="text-gray-300 mx-auto" />
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{doc.fileName}</p>
                                    <a href={doc.fileDataUrl} target="_blank" rel="noreferrer" className="text-primary font-black text-[10px] uppercase underline">Apri File Originale</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-8 space-y-6">
                        <h3 className="font-black text-[10px] uppercase tracking-widest text-text-secondary border-b border-gray-50 pb-4">Dati Generali</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Tipo Documento</label>
                                <select 
                                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-primary"
                                    value={doc.docType}
                                    onChange={e => setDoc({...doc, docType: e.target.value as InboxDocType})}
                                >
                                    <option value="FATTURA">Fattura</option>
                                    <option value="SCONTRINO">Scontrino</option>
                                    <option value="DDT">DDT</option>
                                    <option value="BOLLETTA">Bolletta</option>
                                    <option value="PREVENTIVO">Preventivo</option>
                                    <option value="CONTRATTO">Contratto</option>
                                    <option value="ALTRO">Altro</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Fornitore</label>
                                <input 
                                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-primary"
                                    value={doc.supplierName}
                                    onChange={e => setDoc({...doc, supplierName: e.target.value})}
                                    placeholder="Es: AgroForniture Rossi"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Data Doc.</label>
                                    <input 
                                        type="date"
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-primary"
                                        value={doc.docDateISO}
                                        onChange={e => setDoc({...doc, docDateISO: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Totale (€)</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-primary text-xl font-black"
                                        value={doc.totalAmount}
                                        onChange={e => setDoc({...doc, totalAmount: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-text-secondary ml-1">Note</label>
                                <textarea 
                                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                                    value={doc.notes}
                                    onChange={e => setDoc({...doc, notes: e.target.value})}
                                    placeholder="Aggiungi note interne..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROWS & ACTIONS */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-xl uppercase tracking-tighter text-text-primary">Righe Documento</h3>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Dettaglio prodotti e servizi</p>
                            </div>
                            <button 
                                onClick={handleAddRow}
                                className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                            >
                                <Plus size={14}/> Aggiungi Riga
                            </button>
                        </div>

                        <div className="p-8 space-y-4">
                            {doc.rows.length > 0 ? (
                                <div className="space-y-4">
                                    {doc.rows.map((row, index) => (
                                        <div key={row.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative group">
                                            <button 
                                                onClick={() => handleRemoveRow(row.id)}
                                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                <div className="md:col-span-5">
                                                    <label className="text-[8px] font-black uppercase text-text-secondary ml-1">Descrizione Articolo</label>
                                                    <input 
                                                        className="w-full p-3 bg-white rounded-xl font-bold border-none text-sm"
                                                        value={row.description}
                                                        onChange={e => updateRow(row.id, 'description', e.target.value)}
                                                        placeholder="Es: Concime NPK 20-20-20"
                                                    />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <label className="text-[8px] font-black uppercase text-text-secondary ml-1">Categoria Magazzino</label>
                                                    <select 
                                                        className="w-full p-3 bg-white rounded-xl font-bold border-none text-sm"
                                                        value={row.category}
                                                        onChange={e => updateRow(row.id, 'category', e.target.value)}
                                                    >
                                                        {allCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                                    </select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-[8px] font-black uppercase text-text-secondary ml-1">Quantità</label>
                                                    <div className="flex gap-1">
                                                        <input 
                                                            type="number"
                                                            className="w-full p-3 bg-white rounded-xl font-bold border-none text-sm"
                                                            value={row.qty}
                                                            onChange={e => updateRow(row.id, 'qty', Number(e.target.value))}
                                                        />
                                                        <input 
                                                            className="w-12 p-3 bg-white rounded-xl font-bold border-none text-[10px] uppercase"
                                                            value={row.unit}
                                                            onChange={e => updateRow(row.id, 'unit', e.target.value)}
                                                            placeholder="kg"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-[8px] font-black uppercase text-text-secondary ml-1">Prezzo Un.</label>
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full p-3 bg-white rounded-xl font-bold border-none text-sm"
                                                        value={row.unitPrice}
                                                        onChange={e => updateRow(row.id, 'unitPrice', Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center gap-2 pt-2">
                                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Totale Riga:</span>
                                                <span className="text-lg font-black text-text-primary">€ {row.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                                    <Info size={32} className="text-gray-200 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Nessuna riga inserita</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Aggiungi righe per aggiornare il magazzino automaticamente.</p>
                                </div>
                            )}
                        </div>

                        {['FATTURA', 'SCONTRINO', 'DDT'].includes(doc.docType) && (
                            <div className="p-8 bg-primary/5 border-t border-primary/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                        <Package size={20}/>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-tighter text-text-primary">Aggiornamento Magazzino</h4>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Crea movimenti IN per ogni riga confermata</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={doc.updateInventory}
                                        onChange={e => setDoc({...doc, updateInventory: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                                <Banknote size={20}/>
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-tighter text-text-primary">Impatto Economico</h4>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Riepilogo costi per il bilancio</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">Totale Documento</p>
                                <p className="text-2xl font-black text-text-primary">€ {doc.totalAmount.toFixed(2)}</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">Totale Righe</p>
                                <p className="text-2xl font-black text-text-primary">€ {doc.rows.reduce((sum, r) => sum + r.total, 0).toFixed(2)}</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1">Sorgente</p>
                                <div className="flex items-center gap-2 text-primary font-black text-sm">
                                    <LinkIcon size={14}/> {doc.docType}
                                </div>
                            </div>
                        </div>

                        {Math.abs(doc.totalAmount - doc.rows.reduce((sum, r) => sum + r.total, 0)) > 0.01 && doc.rows.length > 0 && (
                            <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 text-orange-700">
                                <AlertCircle size={18}/>
                                <p className="text-[10px] font-bold uppercase tracking-widest">Attenzione: Il totale del documento non coincide con la somma delle righe.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentDetailPage;
