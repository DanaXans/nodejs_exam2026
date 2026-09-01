import React from 'react';
import type {AdAnalytics} from '../types';

interface AnalyticsViewProps {
    analytics: AdAnalytics | null;
    onClose: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({analytics, onClose}) => {
    if (!analytics) return null;

    return (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
            <div style={{backgroundColor: '#2d2d2d', border: '1px solid #404040', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.3)'}}>
                <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#e0e0e0'}}>Аналітика оголошення</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    <div style={{backgroundColor: '#3a3a3a', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #2b7dd4'}}>
                        <h3 style={{fontSize: '14px', fontWeight: 'bold', color: '#b0b0b0', margin: '0 0 8px 0'}}>Переглядів</h3>
                        <p style={{fontSize: '24px', fontWeight: 'bold', color: '#2b7dd4', margin: 0}}>
                            {typeof analytics.views === 'number' ? analytics.views : 0}
                        </p>
                    </div>
                    <div style={{backgroundColor: '#3a3a3a', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #2d8a4f'}}>
                        <h3 style={{fontSize: '14px', fontWeight: 'bold', color: '#b0b0b0', margin: '0 0 8px 0'}}>Середня ціна у {analytics.regionName}</h3>
                        <p style={{fontSize: '18px', fontWeight: 'bold', color: '#4ade80', margin: 0}}>
                            ${Math.round(analytics.avgPriceRegion || 0)}
                        </p>
                    </div>
                    <div style={{backgroundColor: '#3a3a3a', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #fbbf24'}}>
                        <h3 style={{fontSize: '14px', fontWeight: 'bold', color: '#b0b0b0', margin: '0 0 8px 0'}}>Середня ціна по Україні</h3>
                        <p style={{fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', margin: 0}}>
                            ${Math.round(analytics.avgPriceUkraine || 0)}
                        </p>
                    </div>
                    <button onClick={onClose} style={{padding: '10px 16px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginTop: '8px'}}>Закрити</button>
                </div>
            </div>
        </div>
    );
};
