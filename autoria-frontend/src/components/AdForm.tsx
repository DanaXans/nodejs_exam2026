import {useEffect, useState} from 'react';
import type {FormEvent} from 'react';
import type {AdInput, CarAd, Currency} from '../types';

interface AdFormProps {
    isOpen: boolean;
    brands: Record<string, string[]>;
    initialAd: CarAd | null;
    onClose: () => void;
    onSubmit: (data: AdInput) => Promise<void>;
    onReportMissing: (make: string, model: string) => Promise<void>;
}

export const AdForm = ({isOpen, brands, initialAd, onClose, onSubmit, onReportMissing}: AdFormProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [region, setRegion] = useState('');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState<Currency>('USD');
    const [missingMake, setMissingMake] = useState('');
    const [missingModel, setMissingModel] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setTitle(initialAd?.title ?? '');
        setDescription(initialAd?.description ?? '');
        setMake(initialAd?.make ?? '');
        setModel(initialAd?.model ?? '');
        setRegion(initialAd?.region ?? '');
        setPrice(initialAd ? String(initialAd.originalPrice) : '');
        setCurrency(initialAd?.originalCurrency ?? 'USD');
        setShowReport(false);
        setMissingMake('');
        setMissingModel('');
    }, [isOpen, initialAd]);

    if (!isOpen) return null;

    const models = brands[make] ?? [];

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
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
        } finally {
            setLoading(false);
        }
    };

    const handleReport = async () => {
        setLoading(true);
        try {
            await onReportMissing(missingMake, missingModel);
            setMissingMake('');
            setMissingModel('');
            setShowReport(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">{initialAd ? 'Редагувати оголошення' : 'Нове оголошення'}</h2>
                <form className="form" onSubmit={handleSubmit}>
                    <input placeholder="Заголовок" value={title} onChange={(event) => setTitle(event.target.value)}/>
                    <select value={make} onChange={(event) => {
                        setMake(event.target.value);
                        setModel('');
                    }} required>
                        <option value="">Марка</option>
                        {Object.keys(brands).map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                    </select>
                    <select value={model} onChange={(event) => setModel(event.target.value)} required disabled={!make}>
                        <option value="">Модель</option>
                        {models.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <input placeholder="Регіон" value={region} onChange={(event) => setRegion(event.target.value)} required/>
                    <div className="row">
                        <input type="number" min="1" placeholder="Ціна" value={price} onChange={(event) => setPrice(event.target.value)} required/>
                        <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="UAH">UAH</option>
                        </select>
                    </div>
                    <textarea placeholder="Опис" value={description} onChange={(event) => setDescription(event.target.value)} required maxLength={1000}/>
                    <div className="row">
                        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Збереження...' : 'Зберегти'}</button>
                        <button className="btn btn-secondary" type="button" onClick={onClose}>Скасувати</button>
                    </div>
                </form>
                <div className="section">
                    <button className="link-button" type="button" onClick={() => setShowReport((value) => !value)}>
                        Немає потрібної марки або моделі
                    </button>
                    {showReport && (
                        <div className="form" style={{marginTop: 12}}>
                            <input placeholder="Марка" value={missingMake} onChange={(event) => setMissingMake(event.target.value)}/>
                            <input placeholder="Модель" value={missingModel} onChange={(event) => setMissingModel(event.target.value)}/>
                            <button className="btn btn-secondary" type="button" onClick={handleReport} disabled={loading || !missingMake}>
                                Повідомити адміністратора
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
