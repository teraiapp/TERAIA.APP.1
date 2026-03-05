
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ShoppingCart, Info, CheckCircle, X, ChevronsRight, Phone, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import { initialOrders, suppliers, Order, OrderStatus, OrderCategory, Supplier } from '../../hooks/ordiniData';

// Custom hook for localStorage persistence
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) return JSON.parse(storedValue);
            localStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
}

const statusConfig: { [key in OrderStatus]: { color: string; icon: React.ElementType } } = {
    'In attesa': { color: 'bg-blue-100 text-blue-800', icon: Info },
    'Accettato': { color: 'bg-yellow-100 text-yellow-800', icon: CheckCircle },
    'Spedito': { color: 'bg-indigo-100 text-indigo-800', icon: ChevronsRight },
    'Completato': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    'Annullato': { color: 'bg-red-100 text-red-800', icon: X },
};

const allStatuses: OrderStatus[] = ['In attesa', 'Accettato', 'Spedito', 'Completato', 'Annullato'];
const allCategories: OrderCategory[] = ['Vivai', 'Concimi', 'Sensori', 'Altro'];

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string }> = ({ title, onClose, children, maxWidth = 'max-w-lg' }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className={`bg-surface rounded-xl shadow-2xl p-6 w-full ${maxWidth}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{title}</h3>
                <button onClick={onClose}><X size={24}/></button>
            </div>
            {children}
        </div>
    </div>
);


const OrdiniPage: React.FC = () => {
    const [orders, setOrders] = usePersistentState<Order[]>('teraia_orders', initialOrders);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [modal, setModal] = useState<'detail' | 'new' | 'contact' | null>(null);
    const navigate = useNavigate();

    const findSupplier = (providerId: number) => suppliers.find(s => s.id === providerId);

    const handleSaveOrder = (order: Order) => {
        setOrders(prev => {
            const exists = prev.some(o => o.id === order.id);
            if (exists) {
                return prev.map(o => o.id === order.id ? order : o);
            }
            return [order, ...prev];
        });
        alert('Ordine salvato!');
    };
    
    const handleUpdateStatus = (orderId: number, status: OrderStatus) => {
        const orderToUpdate = orders.find(o => o.id === orderId);
        if(orderToUpdate) {
            handleSaveOrder({...orderToUpdate, status});
        }
    };
    
    const handleNavigateToModule = (category: OrderCategory) => {
        let route = '';
        if (category === 'Vivai') route = '/marketplace';
        else if (category === 'Concimi') route = '/produzione';
        
        if (route) {
            navigate(route);
        } else {
            alert('Modulo non disponibile');
        }
        setModal(null);
    };

    const renderNewOrderModal = () => (
        <Modal title="Crea Nuovo Ordine" onClose={() => setModal(null)}>
            <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newOrder: Order = {
                    id: Date.now(),
                    providerId: Number(formData.get('providerId')),
                    category: formData.get('category') as OrderCategory,
                    status: 'In attesa',
                    date: new Date().toISOString().split('T')[0],
                    amount: 0,
                    items: [{ name: formData.get('item') as string, quantity: formData.get('quantity') as string }],
                    notes: formData.get('notes') as string,
                };
                handleSaveOrder(newOrder);
                setModal(null);
            }} className="space-y-4">
                <select name="category" defaultValue={allCategories[0]} className="w-full p-2 border rounded-md bg-white"><option disabled>Seleziona Categoria</option>{allCategories.map(c=><option key={c} value={c}>{c}</option>)}</select>
                <select name="providerId" defaultValue={suppliers[0].id} className="w-full p-2 border rounded-md bg-white"><option disabled>Seleziona Fornitore</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
                <input name="item" type="text" placeholder="Articolo" className="w-full p-2 border rounded-md" required/>
                <input name="quantity" type="text" placeholder="Quantità" className="w-full p-2 border rounded-md" required/>
                <textarea name="notes" placeholder="Note (opzionale)" rows={3} className="w-full p-2 border rounded-md"></textarea>
                <button type="submit" className="w-full p-2 bg-primary text-white font-bold rounded-lg">Crea Ordine</button>
            </form>
        </Modal>
    );
    
    const renderContactModal = (supplier: Supplier) => (
         <Modal title={`Contatta ${supplier.name}`} onClose={() => setModal('detail')}>
             <div className="space-y-3">
                 <a href={`tel:${supplier.contact.phone}`} className="w-full flex items-center justify-center p-3 bg-blue-500 text-white font-bold rounded-lg"><Phone size={18} className="mr-2"/> Chiama</a>
                 <a href={`mailto:${supplier.contact.email}`} className="w-full flex items-center justify-center p-3 bg-gray-600 text-white font-bold rounded-lg"><Mail size={18} className="mr-2"/> Email</a>
                 <a href={`https://wa.me/${supplier.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center p-3 bg-green-500 text-white font-bold rounded-lg"><MessageSquare size={18} className="mr-2"/> WhatsApp</a>
             </div>
         </Modal>
    );

    const renderDetailModal = (order: Order, supplier: Supplier) => (
        <Modal title={`Dettaglio Ordine #${order.id}`} onClose={() => setModal(null)} maxWidth="max-w-2xl">
            <div className="space-y-4">
                <p><strong>Fornitore:</strong> {supplier.name}</p>
                <p><strong>Data:</strong> {new Date(order.date).toLocaleDateString('it-IT')}</p>
                <p><strong>Prodotti:</strong></p>
                <ul className="list-disc list-inside bg-gray-50 p-3 rounded-md">
                    {order.items.map((item, i) => <li key={i}>{item.name} (Qt: {item.quantity})</li>)}
                </ul>
                {order.notes && <p><strong>Note:</strong> {order.notes}</p>}
                
                <div className="flex items-center gap-3 border-t pt-4">
                    <label htmlFor="status-select" className="font-semibold">Stato:</label>
                    <select id="status-select" value={order.status} onChange={e => handleUpdateStatus(order.id, e.target.value as OrderStatus)} className="p-2 border rounded-md bg-white">
                        {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                    <button onClick={() => setModal('contact')} className="flex-1 p-2 bg-blue-500 text-white rounded-lg font-semibold">Contatta Fornitore</button>
                    <button onClick={() => { if(window.confirm('Sei sicuro?')) handleUpdateStatus(order.id, 'Annullato')}} className="flex-1 p-2 bg-red-500 text-white rounded-lg font-semibold">Annulla Ordine</button>
                    <button onClick={() => handleUpdateStatus(order.id, 'Completato')} className="flex-1 p-2 bg-green-500 text-white rounded-lg font-semibold">Conferma Completato</button>
                    <button onClick={() => handleNavigateToModule(order.category)} className="flex-1 p-2 bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center"><ExternalLink size={16} className="mr-2"/> Vai al Modulo</button>
                </div>
            </div>
        </Modal>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Ordini</h1>
                <button onClick={() => setModal('new')} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark">
                    <PlusCircle size={20} className="mr-2" /> Nuovo Ordine
                </button>
            </div>
            
            <div className="bg-surface rounded-xl shadow-md p-6">
                <div className="space-y-3">
                    {orders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(order => {
                        const supplier = findSupplier(order.providerId);
                        const statusInfo = statusConfig[order.status];
                        return (
                            <div key={order.id} onClick={() => { setSelectedOrder(order); setModal('detail'); }} className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <div className="md:col-span-2">
                                    <p className="font-bold">{order.items.map(i => i.name).join(', ')}</p>
                                    <p className="text-sm text-text-secondary">{supplier?.name}</p>
                                </div>
                                <div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full inline-flex items-center ${statusInfo.color}`}>
                                        <statusInfo.icon size={12} className="mr-1.5" />
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="font-bold">{order.amount > 0 ? `${order.amount.toFixed(2)} €` : 'Da definire'}</p>
                                </div>
                                 <div className="text-left md:text-right">
                                     <p className="text-sm text-text-secondary">{new Date(order.date).toLocaleDateString('it-IT')}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            {modal === 'new' && renderNewOrderModal()}
            {modal === 'detail' && selectedOrder && renderDetailModal(selectedOrder, findSupplier(selectedOrder.providerId)!)}
            {modal === 'contact' && selectedOrder && renderContactModal(findSupplier(selectedOrder.providerId)!)}
        </div>
    );
};

export default OrdiniPage;
