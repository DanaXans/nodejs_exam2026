import {useState} from 'react';
import type {CarAd, User} from '../types';

interface AdCardProps {
    ad: CarAd;
    user: User | null;
    onOpen: (ad: CarAd) => void;
    onEdit: (ad: CarAd) => void;
    onShowAnalytics: (ad: CarAd) => void;
    onDelete: (id: string) => void;
}

const statusLabel: Record<CarAd['status'], string> = {
    ACTIVE: 'Активне',
    PENDING_EDIT: 'Потрібна правка',
    INACTIVE: 'Неактивне',
};

export const AdCard = ({ad, user, onOpen, onEdit, onShowAnalytics, onDelete}: AdCardProps) => {
    const [showMore, setShowMore] = useState(false);
    const isOwner = user?.id === ad.sellerId;
    const isStaff = user?.role === 'MANAGER' || user?.role === 'ADMIN';
    const canDelete = isOwner || isStaff;
    const canEdit = isOwner && ad.status !== 'INACTIVE';
    const canSeeAnalytics = isOwner && user?.accountType === 'PREMIUM';

    return (
        <article className="ad-card">
            <div className="ad-card-header">
                <h3 className="ad-card-title">{ad.title}</h3>
            </div>
            <div className="ad-card-body">
                <p className="ad-card-info"><strong>Марка:</strong> {ad.make}</p>
                <p className="ad-card-info"><strong>Модель:</strong> {ad.model}</p>
                <p className="ad-card-info"><strong>Регіон:</strong> {ad.region}</p>
                <p className="ad-card-price">Ціна продавця: {ad.originalPrice} {ad.originalCurrency}</p>
                <p className="muted">
                    {Math.round(ad.calculatedPrices.USD)} USD · {Math.round(ad.calculatedPrices.EUR)} EUR · {Math.round(ad.calculatedPrices.UAH)} UAH
                </p>
                {ad.exchangeRatesUsed && (
                    <p className="muted">
                        Курс на {ad.exchangeRatesUsed.date}: 1 USD = {ad.exchangeRatesUsed.USD_UAH} UAH, 1 EUR = {ad.exchangeRatesUsed.EUR_UAH} UAH
                        ({ad.exchangeRatesUsed.source === 'mock' ? 'mock' : 'ПриватБанк'})
                    </p>
                )}
                <p className="ad-card-info" style={{maxHeight: showMore ? 'none' : 60, overflow: 'hidden'}}>{ad.description}</p>
                {ad.description.length > 100 && (
                    <button className="link-button" type="button" onClick={() => setShowMore((value) => !value)}>
                        {showMore ? 'Менше' : 'Більше'}
                    </button>
                )}
                <p className="muted">Контакт продавця: {ad.sellerName || '—'}{ad.sellerEmail ? ` · ${ad.sellerEmail}` : ''}</p>
                {ad.status !== 'ACTIVE' && (
                    <p>
                        <span className={ad.status === 'INACTIVE' ? 'badge badge-bad' : 'badge badge-warn'}>
                            {statusLabel[ad.status]}
                            {ad.status === 'PENDING_EDIT' ? ` · спроба ${ad.badWordsAttempts} з 3` : ''}
                        </span>
                    </p>
                )}
            </div>
            <div className="ad-card-footer">
                <button className="btn btn-secondary" type="button" onClick={() => onOpen(ad)}>Відкрити</button>
                {canSeeAnalytics && (
                    <button className="btn btn-primary" type="button" onClick={() => onShowAnalytics(ad)}>Аналітика</button>
                )}
                {canEdit && (
                    <button className="btn btn-secondary" type="button" onClick={() => onEdit(ad)}>Редагувати</button>
                )}
                {canDelete && (
                    <button className="btn btn-danger" type="button" onClick={() => onDelete(ad._id)}>Видалити</button>
                )}
            </div>
        </article>
    );
};
