import React, {useEffect, useState} from 'react';
import type {AdAnalytics, CarAd, User} from './types';
import {Navbar} from './components/NavBar';
import {AdCard} from './components/AdCard';
import {AdForm} from './components/AdForm';
import {AnalyticsView} from './components/AnalyticsView';
import {AuthModal} from './components/AuthModal';
import {apiCall, deleteAdRequest} from './api/axiosClient';
import './index.css';

export const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        return savedUser && token ? JSON.parse(savedUser) : null;
    });
    const [ads, setAds] = useState<CarAd[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [analytics, setAnalytics] = useState<AdAnalytics | null>(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        loadAds();
    }, []);

    const loadAds = async () => {
        try {
            setLoading(true);
            const data = await apiCall<CarAd[]>('/ads');
            setAds(data);
            setLoadError('');
        } catch (err) {
            console.error('Помилка завантаження оголошень:', err);
            setAds([]);
            setLoadError(err instanceof Error ? err.message : 'Не вдалося завантажити оголошення');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    const handleCreateAd = async (adData: {
        title: string;
        description: string;
        make: string;
        model: string;
        region: string;
        originalPrice: number;
        originalCurrency: string;
    }) => {
        try {
            const data = await apiCall<{message: string}>('/ads', {method: 'POST', body: JSON.stringify(adData)});
            alert(data.message || 'Оголошення додано');
            setIsFormOpen(false);
            await loadAds();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Помилка при додаванні';
            alert(errorMessage);
        }
    };

    const handleUpgrade = async () => {
        try {
            const data = await apiCall<{message: string; token: string; user: User}>('/auth/upgrade-to-premium', {method: 'POST'});
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            alert(data.message);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Не вдалося оновити акаунт');
        }
    };

    const handleShowAnalytics = async (ad: CarAd) => {
        try {
            const res = await apiCall<AdAnalytics>(`/ads/${ad._id}/analytics`);
            setAnalytics(res);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Аналітика доступна лише власнику з PREMIUM');
        }
    };

    const handleDeleteAd = async (id: string) => {
        if (!confirm('Ви впевнені?')) return;
        try {
            await deleteAdRequest(id);
            setAds(prevAds => prevAds.filter(ad => ((ad as any)._id || (ad as any).id) !== id));
            alert('Оголошення видалено');
        } catch (error: any) {
            alert(error.message || 'Помилка при видаленні');
        }
    };

    return (
        <div style={{backgroundColor: '#1a1a1a', color: '#e0e0e0', minHeight: '100vh'}}>
            <Navbar user={user} onOpenForm={() => {
                if (!user) {
                    alert('Спочатку увійдіть або зареєструйтесь!');
                    setIsLoginOpen(true);
                    return;
                }
                setIsFormOpen(true);
            }} onLogout={handleLogout} accountType={user?.accountType} onUpgrade={handleUpgrade} onOpenLogin={() => setIsLoginOpen(true)}/>
            <main style={{maxWidth: '1280px', margin: '0 auto', padding: '20px'}}>
                <h1 style={{fontSize: '28px', marginBottom: '20px', fontWeight: 'bold'}}>Оголошення про продаж авто</h1>
                {loadError && (
                    <div style={{marginBottom: '16px', padding: '12px 16px', backgroundColor: '#3a2a2a', borderRadius: '8px', color: '#f87171'}}>{loadError}</div>
                )}
                {loading && (
                    <div style={{textAlign: 'center', padding: '20px', color: '#b0b0b0'}}>Завантаження...</div>
                )}

                {!loading && ads.length === 0 && (
                    <div style={{textAlign: 'center', padding: '40px 20px', backgroundColor: '#2d2d2d', borderRadius: '8px', color: '#b0b0b0'}}>Оголошень поки що немає</div>
                )}

                {!loading && ads.length > 0 && (
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px'}}>
                        {ads.map((ad: CarAd) => (
                            <AdCard key={(ad as any)._id || (ad as any).id} ad={ad} user={user}
                                    onShowAnalytics={handleShowAnalytics} onDelete={handleDeleteAd}/>
                        ))}
                    </div>
                )}
            </main>
            {isLoginOpen && (
                <AuthModal isOpen={isLoginOpen} isRegisterMode={isRegisterMode} onClose={() => setIsLoginOpen(false)}
                           onToggleMode={() => setIsRegisterMode(!isRegisterMode)}
                           onSubmit={async (name, email, password) => {
                               const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
                               const payload = isRegisterMode
                                   ? {name, email, password}
                                   : {email, password};

                               try {
                                   const data = await apiCall<{ token: string; user: User }>(endpoint, {
                                       method: 'POST',
                                       body: JSON.stringify(payload),
                                   });

                                   localStorage.setItem('token', data.token);
                                   localStorage.setItem('user', JSON.stringify(data.user));

                                   setUser(data.user);
                                   setIsLoginOpen(false);
                                   setIsRegisterMode(false);
                                   alert(isRegisterMode ? 'Успішна реєстрація!' : 'Успішний вхід!');
                               } catch (err: any) {
                                   throw new Error(err.message || 'Помилка');
                               }
                           }}/>
            )}
            <AdForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleCreateAd}/>
            <AnalyticsView analytics={analytics} onClose={() => setAnalytics(null)}/>
        </div>
    );
};

export default App;
