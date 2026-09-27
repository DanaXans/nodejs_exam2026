import React, {useEffect, useState} from 'react';
import {apiCall} from '../api/axiosClient';

interface AdFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        description: string;
        make: string;
        model: string;
        region: string;
        originalPrice: number;
        originalCurrency: string;
    }) => Promise<void>;
}

interface MakeItem {
    name: string;
    models: string[];
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
    const [makes, setMakes] = useState<MakeItem[]>([]);
    const [regions, setRegions] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [missingName, setMissingName] = useState('');
    const [missingType, setMissingType] = useState<'MAKE' | 'MODEL'>('MAKE');

    useEffect(() => {
        if (!isOpen) return;
        apiCall<MakeItem[]>('/catalog/makes').then(setMakes).catch(() => setMakes([]));
        apiCall<string[]>('/catalog/regions').then(setRegions).catch(() => setRegions([]));
    }, [isOpen]);

    useEffect(() => {
        const selected = makes.find((item) => item.name === make);
        setModels(selected?.models ?? []);
        setModel('');
    }, [make, makes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                title: title || `${make} ${model}`,
                description,
                make,
                model,
                region,
                originalPrice: Number(price),
                originalCurrency: currency,
            });
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

    const requestMissing = async () => {
        if (!missingName.trim()) {
            alert('Вкажіть назву марки або моделі');
            return;
        }
        try {
            const data = await apiCall<{message: string}>('/catalog/requests', {
                method: 'POST',
                body: JSON.stringify({
                    type: missingType,
                    name: missingName.trim(),
                    ...(missingType === 'MODEL' ? {make} : {}),
                }),
            });
            alert(data.message);
            setMissingName('');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Не вдалося надіслати запит');
        }
    };

    if (!isOpen) return null;

    const fieldStyle = {
        padding: '10px 12px',
        backgroundColor: '#3a3a3a',
        color: '#e0e0e0',
        border: '1px solid #404040',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'inherit',
    };

    return (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
            <div style={{backgroundColor: '#2d2d2d', border: '1px solid #404040', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.3)'}}>
                <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#e0e0e0'}}>Додати нове оголошення</h2>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    <input type="text" placeholder="Заголовок оголошення" value={title} onChange={(e) => setTitle(e.target.value)} style={fieldStyle}/>
                    <select value={make} onChange={(e) => setMake(e.target.value)} required style={fieldStyle}>
                        <option value="">Марка</option>
                        {makes.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                    </select>
                    <select value={model} onChange={(e) => setModel(e.target.value)} required style={fieldStyle}>
                        <option value="">Модель</option>
                        {models.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <select value={region} onChange={(e) => setRegion(e.target.value)} required style={fieldStyle}>
                        <option value="">Регіон</option>
                        {regions.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px'}}>
                        <input type="number" placeholder="Ціна" value={price} onChange={(e) => setPrice(e.target.value)} required min="1" style={fieldStyle}/>
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={fieldStyle}>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="UAH">UAH</option>
                        </select>
                    </div>
                    <textarea placeholder="Опис оголошення" value={description} onChange={(e) => setDescription(e.target.value)} required style={{...fieldStyle, minHeight: '100px', resize: 'vertical'}}/>
                    <div style={{display: 'flex', gap: '12px', marginTop: '8px'}}>
                        <button type="submit" disabled={loading} style={{flex: 1, padding: '10px 16px', backgroundColor: loading ? '#5a5a5a' : '#2b7dd4', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500'}}>{loading ? 'Завантаження...' : 'Додати'}</button>
                        <button type="button" onClick={onClose} style={{flex: 1, padding: '10px 16px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'}}>Скасувати</button>
                    </div>
                </form>
                <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <p style={{margin: 0, fontSize: '13px', color: '#b0b0b0'}}>Немає марки або моделі в списку? Повідомте адміністрацію.</p>
                    <select value={missingType} onChange={(e) => setMissingType(e.target.value as 'MAKE' | 'MODEL')} style={fieldStyle}>
                        <option value="MAKE">Немає марки</option>
                        <option value="MODEL">Немає моделі</option>
                    </select>
                    <input type="text" placeholder={missingType === 'MAKE' ? 'Назва марки' : 'Назва моделі'} value={missingName} onChange={(e) => setMissingName(e.target.value)} style={fieldStyle}/>
                    <button type="button" onClick={requestMissing} style={{padding: '8px 12px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'}}>Надіслати запит</button>
                </div>
            </div>
        </div>
    );
};
