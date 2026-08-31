import React from 'react';
import { type AdAnalytics } from '../types';

interface AnalyticsViewProps {
    analytics: AdAnalytics | null;
    onClose: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, onClose }) => {
    if (!analytics) return null;
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-5 max-w-sm w-full shadow-xl">
                <h3 className="font-bold text-base text-gray-800 mb-3">Статистика та аналітика цін</h3>

                <div className="space-y-2 text-xs">
                    <div className="bg-blue-50 p-2.5 rounded border border-blue-100">
                        <div className="text-gray-500">Середня ціна по області ({analytics.regionName}):</div>
                        <div className="text-base font-bold text-blue-700">
                            $ {Math.round(analytics.avgPriceRegion).toLocaleString()}
                        </div>
                    </div>

                    <div className="bg-green-50 p-2.5 rounded border border-green-100">
                        <div className="text-gray-500">Середня ціна по всій Україні:</div>
                        <div className="text-base font-bold text-green-700">
                            $ {Math.round(analytics.avgPriceUkraine).toLocaleString()}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                        <div className="text-gray-500 mb-1 font-medium">Перегляди оголошення:</div>
                        <div className="grid grid-cols-3 gap-1 text-center">
                            <div>
                                <div className="font-bold">{analytics.views?.daily || 0}</div>
                                <div className="text-[10px] text-gray-400">За день</div>
                            </div>
                            <div>
                                <div className="font-bold">{analytics.views?.weekly || 0}</div>
                                <div className="text-[10px] text-gray-400">За тиждень</div>
                            </div>
                            <div>
                                <div className="font-bold">{analytics.views?.monthly || 0}</div>
                                <div className="text-[10px] text-gray-400">За місяць</div>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={onClose} className="mt-4 w-full bg-gray-100 hover:bg-gray-200 py-2 rounded text-xs font-semibold text-gray-700">Закрыть</button>
            </div>
        </div>
    );
};