import React, {useState} from 'react';

interface AdFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export const AdForm: React.FC<AdFormProps> = ({isOpen, onClose, onSubmit}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [region, setRegion] = useState('');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({title: title || `${make} ${model}`, description, make, model, region, originalPrice: price, originalCurrency: currency});
            setTitle('');
            setDescription('');
            setMake('');
            setModel('');
            setRegion('');
            setPrice('');
            setCurrency('USD');
        } finally {
            setLoading(false);
        }
    };
    if (!isOpen) return null;
    return (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
            <div style={{backgroundColor: '#2d2d2d', border: '1px solid #404040', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', maxHeight: '80vh',overflowY: 'auto', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.3)'}}>
                <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#e0e0e0'}}>Додати нове оголошення</h2>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    <input type="text" placeholder="Заголовок оголошення (опціонально)" value={title} onChange={(e) => setTitle(e.target.value)} style={{padding: '10px 12px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit'}}/>
                    <input type="text" placeholder="Марка авто (наприклад BMW, Audi)" value={make} onChange={(e) => setMake(e.target.value)} required style={{padding: '10px 12px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit'}}/>
                    <input type="text" placeholder="Модель авто (наприклад X5, A4)" value={model} onChange={(e) => setModel(e.target.value)} required style={{padding: '10px 12px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit'}}/>
                    <input type="text" placeholder="Регіон (наприклад Київ, Львів)" value={region} onChange={(e) => setRegion(e.target.value)} required style={{padding: '10px 12px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit'}}/>
                        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px'}}>
                         <input type="number" placeholder="Ціна" value={price} onChange={(e) => setPrice(e.target.value)} required style={{padding: '10px 12px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit'}}/>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{padding: '10px 12px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit'}}>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="UAH">UAH</option>
                        </select>
                    </div>
                    <textarea placeholder="Опис оголошення (максимум 1000 символів)" value={description} onChange={(e) => setDescription(e.target.value)} required style={{padding: '10px 12px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', minHeight: '100px',resize: 'vertical'}}/>

                    <div style={{display: 'flex', gap: '12px', marginTop: '8px'}}>
                        <button type="submit" disabled={loading} style={{flex: 1, padding: '10px 16px', backgroundColor: loading ? '#5a5a5a' : '#2b7dd4', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'}}>
                            {loading ? ' Завантаження...' : ' Додати'}
                        </button>
                        <button type="button" onClick={onClose} style={{flex: 1, padding: '10px 16px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'}}>
                            Скасувати
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
