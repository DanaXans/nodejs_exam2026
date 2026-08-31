import React from 'react';
import { type User} from '../types';

interface NavbarProps {
    user: User | null;
    onOpenForm: () => void;
    onRequestBrand: () => void;
    onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onOpenForm, onRequestBrand, onLogout }) => {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-1 cursor-pointer">
                    <span className="bg-red-600 text-white font-extrabold px-2.5 py-1 rounded-l text-xl">AUTO</span>
                    <span className="bg-blue-600 text-white font-extrabold px-2.5 py-1 rounded-r text-xl">RIA</span>
                </div>
                <div className="flex items-center space-x-4">

                    <button onClick={onRequestBrand} className="text-xs text-gray-500 hover:text-blue-600 underline transition">Немає потрібної марки?</button>
                    {user && (

                        <div className="flex items-center space-x-3">
                            <div className="text-right text-xs">
                                <div className="font-bold text-gray-800">{user.name}</div>
                                <div className="text-gray-500">
                                    Тип: <span className="font-semibold text-blue-600">{user.accountType}</span>
                                </div>
                            </div>

                            <button onClick={onOpenForm} className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">+ Продати авто</button>
                            <button onClick={onLogout} className="text-xs text-red-600 hover:bg-red-50 px-2.5 py-2 rounded-lg border border-red-200 transition">Вийти</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};