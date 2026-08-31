import React, {useState} from 'react';
import {Currency} from '../types';

interface AdFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export const AdForm: React.FC<AdFormProps> = ({isOpen, onClose, onSubmit}) => {
    const [title, setTitle] = useState('');
    const [brand, setBrand] = useState('BMW');
    const [model, setModel] = useState('X5');
    const [region, setRegion] = useState('Киев');
    const [price, setPrice] = useState(12000);
    const [currency, setCurrency] = useState<Currency>(Currency.USD);
    const [description, setDescription] = useState('');

    if (!isOpen) return null;
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({title, brand, model, region, originalPrice: Number(price), currency, description,});
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl">
                <div className="flex justify-between items-center pb-3 border-b mb-4">
                    <h2 className="font-bold text-gray-800">Подати оголошення</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                    <div>
                        <label className="block font-medium mb-1">Заголовок</label>
                        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                               className="w-full border rounded p-2 text-xs" placeholder="Продам авто"/>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block font-medium mb-1">Марка</label>
                            <select value={brand} onChange={(e) => setBrand(e.target.value)}
                                    className="w-full border rounded p-2 text-xs">
                                <option value="BMW">BMW</option>
                                <option value="Audi">Audi</option>
                                <option value="Mercedes-Benz">Mercedes-Benz</option>
                                <option value="Toyota">Toyota</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Модель</label>
                            <input type="text" required value={model} onChange={(e) => setModel(e.target.value)}
                                   className="w-full border rounded p-2 text-xs"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                            <label className="block font-medium mb-1">Ціна</label>
                            <input type="number" required value={price}
                                   onChange={(e) => setPrice(Number(e.target.value))}
                                   className="w-full border rounded p-2 text-xs"/>
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Валюта</label>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}
                                    className="w-full border rounded p-2 text-xs font-bold text-blue-600">
                                <option value={Currency.USD}>USD ($)</option>
                                <option value={Currency.UAH}>UAH (грн)</option>
                                <option value={Currency.EUR}>EUR (€)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Регіон продажу</label>
                        <input type="text" required value={region} onChange={(e) => setRegion(e.target.value)}
                               className="w-full border rounded p-2 text-xs"/>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Опис</label>
                        <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)}
                                  className="w-full border rounded p-2 text-xs" placeholder="Опис автомобіля..."/>
                    </div>

                    <div className="flex justify-end space-x-2 pt-3 border-t">
                        <button type="button" onClick={onClose}
                                className="px-3 py-1.5 border rounded text-gray-600">Скасування
                        </button>
                        <button type="submit"
                                className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium">Зберегти
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};