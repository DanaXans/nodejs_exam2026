import React from 'react';
import type {CarAd, User} from '../types';

interface AdCardProps {
    ad: CarAd;
    user: User | null;
    onShowAnalytics: (ad: CarAd) => void;
    onDelete: (id: string) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ad, user, onShowAnalytics, onDelete}) => {
    const [showMore, setShowMore] = React.useState(false);
    const adId = (ad as any)._id || (ad as any).id;
    const isOwner = user && String(user.id) === String(ad.sellerId);

    return (
        <div style={{backgroundColor: '#2d2d2d', border: '1px solid #404040', borderRadius: '8px', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default'}} onMouseEnter={(e) => {e.currentTarget.style.borderColor = '#2b7dd4';e.currentTarget.style.boxShadow = '0 10px 20px rgba(43, 125, 212, 0.15)';}} onMouseLeave={(e) => {e.currentTarget.style.borderColor = '#404040';e.currentTarget.style.boxShadow = 'none';}}>
            <div style={{padding: '16px', borderBottom: '1px solid #404040'}}>
                <h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#e0e0e0', margin: 0}}>{ad.title}</h3>
            </div>
            <div style={{padding: '16px'}}>
                <div style={{marginBottom: '12px'}}>
                    <p style={{fontSize: '14px', color: '#b0b0b0', margin: '0 0 8px 0'}}>
                        <strong>Марка:</strong> {ad.brand || ad.make}
                    </p>
                    <p style={{fontSize: '14px', color: '#b0b0b0', margin: '0 0 8px 0'}}>
                        <strong>Модель:</strong> {ad.model}
                    </p>
                    <p style={{fontSize: '14px', color: '#b0b0b0', margin: '0 0 8px 0'}}>
                        <strong>Регіон:</strong> {ad.region}
                    </p>
                </div>
                <div style={{backgroundColor: '#3a3a3a', padding: '12px', borderRadius: '6px', marginBottom: '12px', borderLeft: '3px solid #2b7dd4'}}>
                    <p style={{fontSize: '18px', fontWeight: 'bold', color: '#2b7dd4', margin: 0}}>
                        {ad.originalPrice} {ad.originalCurrency}
                    </p>
                    <p style={{fontSize: '12px', color: '#b0b0b0', margin: '6px 0 0 0'}}>
                        ≈ {Math.round(ad.calculatedPrices.USD)} USD | {Math.round(ad.calculatedPrices.UAH)} UAH | {ad.calculatedPrices.EUR} EUR
                    </p>
                </div>
                <div>
                    <p style={{fontSize: '13px', color: '#b0b0b0', margin: 0, maxHeight: showMore ? 'auto' : '60px', overflow: 'hidden', lineHeight: '1.5'}}>
                        {ad.description}
                    </p>
                    {ad.description && ad.description.length > 100 && (
                        <button onClick={() => setShowMore(!showMore)} style={{background: 'none', border: 'none', color: '#2b7dd4', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: '4px 0', marginTop: '4px'}}>
                            {showMore ? 'Менше' : 'Більше'}
                        </button>
                    )}
                </div>
                {typeof ad.views === 'number' && (
                    <p style={{fontSize: '12px', color: '#b0b0b0', margin: '12px 0 0 0', paddingTop: '12px', borderTop: '1px solid #404040'}}>
                         Переглядів: <strong>{ad.views}</strong>
                    </p>
                )}
            </div>
            <div style={{padding: '12px 16px', backgroundColor: '#3a3a3a', borderTop: '1px solid #404040', display: 'flex', gap: '8px'}}>
                {user?.accountType === 'PREMIUM' && isOwner && (
                    <button onClick={() => onShowAnalytics(ad)} style={{flex: 1, padding: '8px 12px', backgroundColor: '#2d8a4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'all 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                        Аналітика
                    </button>
                )}
                {isOwner && (
                    <button onClick={() => onDelete(adId)} style={{flex: 1, padding: '8px 12px', backgroundColor: '#c41c1c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'all 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Видалити</button>
                )}
            </div>
        </div>
    );
};
