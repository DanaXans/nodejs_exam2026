import type {AdAnalytics} from '../types';

interface AnalyticsViewProps {
    analytics: AdAnalytics | null;
    onClose: () => void;
}

export const AnalyticsView = ({analytics, onClose}: AnalyticsViewProps) => {
    if (!analytics) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">Аналітика оголошення</h2>
                <div className="form">
                    <p className="ad-card-info">Усього переглядів: <strong>{analytics.views}</strong></p>
                    <p className="ad-card-info">За день: <strong>{analytics.viewsDay}</strong></p>
                    <p className="ad-card-info">За тиждень: <strong>{analytics.viewsWeek}</strong></p>
                    <p className="ad-card-info">За місяць: <strong>{analytics.viewsMonth}</strong></p>
                    <p className="ad-card-info">Середня ціна у {analytics.regionName}: <strong>{analytics.avgPriceRegion} USD</strong></p>
                    <p className="ad-card-info">Середня ціна по Україні: <strong>{analytics.avgPriceUkraine} USD</strong></p>
                    <button className="btn btn-secondary" type="button" onClick={onClose}>Закрити</button>
                </div>
            </div>
        </div>
    );
};
