import React from 'react';
import {type CarAd, type User, AccountType} from '../types';

interface AdCardProps {
    ad: CarAd;
    user: User | null;
    onShowAnalytics: (ad: CarAd) => void;
    onDelete?: (id: string) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ad, user, onShowAnalytics, onDelete}) => {
    const isPremium = user?.accountType === AccountType.PREMIUM;
    const adSellerId = ad.sellerId || (ad as any).seller;
    const userId = user?.id || (user as any)?._id;
    const isOwner = userId && adSellerId && String(userId) === String(adSellerId);
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const handleDelete = () => {
        const adId = (ad as any)._id || (ad as any).id;
        if (adId && onDelete && window.confirm('Ви впевнені, що хочете видалити це оголошення?')) {
            onDelete(adId);
        }
    };
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">{(ad as any).brand || ad.brand}</span>
                        <h3 className="text-lg font-bold text-gray-900">{ad.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{ad.region}</span>
                        {(isOwner || isAdmin) && onDelete && (
                            <button onClick={handleDelete} title="Видалити оголошення" className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition text-xs font-bold">Видалити</button>
                        )}
                    </div>
                </div>
                <p className="text-gray-600 text-xs mb-4 line-clamp-2">{ad.description}</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-xl font-black text-green-700">
                        $ {(ad.calculatedPrices?.USD ?? ad.originalPrice ?? (ad as any).price ?? 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex space-x-2">
                        <span>
                            {(ad.calculatedPrices?.UAH ?? Math.round((ad.originalPrice ?? (ad as any).price ?? 0) * 41)).toLocaleString()} грн
                        </span>
                        <span>•</span>
                        <span>
                            € {(ad.calculatedPrices?.EUR ?? Math.round((ad.originalPrice ?? (ad as any).price ?? 0) * 0.92)).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Просмотры: {ad.views?.total || 0}</span>
                {isOwner && isPremium ? (
                    <button onClick={() => onShowAnalytics(ad)} className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-2.5 py-1 rounded transition">Аналітика</button>
                ) : isOwner ? (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Аналітика доступна в Premium</span>
                ) : null}
            </div>
        </div>
    );
};