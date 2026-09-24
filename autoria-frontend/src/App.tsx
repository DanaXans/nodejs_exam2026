import {useEffect, useState} from 'react';
import type {AdAnalytics, AdInput, CarAd, User, UserRole} from './types';
import {Navbar} from './components/NavBar';
import {AdCard} from './components/AdCard';
import {AdForm} from './components/AdForm';
import {AnalyticsView} from './components/AnalyticsView';
import {AuthModal} from './components/AuthModal';
import {ModerationPanel} from './components/ModerationPanel';
import {apiCall} from './api/axiosClient';
import './index.css';

const savedUser = (): User | null => {
    const rawUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!rawUser || !token) return null;
    try {
        return JSON.parse(rawUser) as User;
    } catch {
        return null;
    }
};

const errorText = (error: unknown, fallback: string) => {
    return error instanceof Error ? error.message : fallback;
};

export const App = () => {
    const [user, setUser] = useState<User | null>(savedUser);
    const [ads, setAds] = useState<CarAd[]>([]);
    const [brands, setBrands] = useState<Record<string, string[]>>({});
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<CarAd | null>(null);
    const [openedAd, setOpenedAd] = useState<CarAd | null>(null);
    const [analytics, setAnalytics] = useState<AdAnalytics | null>(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadAds = async () => {
        setLoading(true);
        try {
            setAds(await apiCall<CarAd[]>('/ads'));
        } catch (error) {
            console.error(error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAds().catch(() => undefined);
        apiCall<Record<string, string[]>>('/brands').then(setBrands).catch(() => setBrands({}));
    }, [user?.id]);

    const storeSession = (token: string, nextUser: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(nextUser));
        setUser(nextUser);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const handleAuth = async (name: string, email: string, password: string, role: UserRole) => {
        const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
        const payload = isRegisterMode ? {name, email, password, role} : {email, password};
        try {
            const data = await apiCall<{token: string; user: User}>(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            storeSession(data.token, data.user);
            setIsLoginOpen(false);
            setIsRegisterMode(false);
        } catch (error) {
            alert(errorText(error, 'Помилка авторизації'));
            throw error;
        }
    };

    const handleUpgrade = async () => {
        try {
            const data = await apiCall<{token: string; user: User; message: string}>('/auth/upgrade-to-premium', {method: 'POST'});
            storeSession(data.token, data.user);
            alert(data.message);
        } catch (error) {
            alert(errorText(error, 'Не вдалося оновити акаунт'));
        }
    };

    const handleSaveAd = async (adData: AdInput) => {
        try {
            const endpoint = editingAd ? `/ads/${editingAd._id}` : '/ads';
            const method = editingAd ? 'PATCH' : 'POST';
            const saved = await apiCall<CarAd>(endpoint, {method, body: JSON.stringify(adData)});
            alert(saved.message || (editingAd ? 'Оголошення оновлено' : 'Оголошення додано'));
            setIsFormOpen(false);
            setEditingAd(null);
            await loadAds();
        } catch (error) {
            alert(errorText(error, 'Не вдалося зберегти оголошення'));
        }
    };

    const handleOpenAd = async (ad: CarAd) => {
        try {
            const fresh = await apiCall<CarAd>(`/ads/${ad._id}`);
            setOpenedAd(fresh);
            setAds((current) => current.map((item) => item._id === fresh._id ? {...item, views: fresh.views} : item));
        } catch (error) {
            alert(errorText(error, 'Не вдалося відкрити оголошення'));
        }
    };

    const handleShowAnalytics = async (ad: CarAd) => {
        try {
            setAnalytics(await apiCall<AdAnalytics>(`/ads/${ad._id}/analytics`));
        } catch (error) {
            alert(errorText(error, 'Аналітика недоступна'));
        }
    };

    const handleDeleteAd = async (id: string) => {
        if (!confirm('Видалити оголошення?')) return;
        try {
            await apiCall(`/ads/${id}`, {method: 'DELETE'});
            setAds((current) => current.filter((ad) => ad._id !== id));
            if (openedAd?._id === id) setOpenedAd(null);
        } catch (error) {
            alert(errorText(error, 'Не вдалося видалити оголошення'));
        }
    };

    const handleReportMissing = async (make: string, model: string) => {
        try {
            const result = await apiCall<{message: string}>('/brands/missing', {
                method: 'POST',
                body: JSON.stringify({make, model}),
            });
            alert(result.message);
        } catch (error) {
            alert(errorText(error, 'Не вдалося надіслати запит'));
        }
    };

    const isStaff = user?.role === 'MANAGER' || user?.role === 'ADMIN';

    return (
        <div>
            <Navbar
                user={user}
                onOpenForm={() => {
                    setEditingAd(null);
                    setIsFormOpen(true);
                }}
                onLogout={handleLogout}
                onUpgrade={handleUpgrade}
                onOpenLogin={() => setIsLoginOpen(true)}
            />
            <main className="page">
                <h1 className="page-title">Оголошення про продаж авто</h1>
                {loading && <p className="muted">Завантаження...</p>}
                {!loading && ads.length === 0 && <div className="empty">Оголошень поки що немає</div>}
                {!loading && ads.length > 0 && (
                    <div className="ads-grid">
                        {ads.map((ad) => (
                            <AdCard
                                key={ad._id}
                                ad={ad}
                                user={user}
                                onOpen={handleOpenAd}
                                onEdit={(item) => {
                                    setEditingAd(item);
                                    setIsFormOpen(true);
                                }}
                                onShowAnalytics={handleShowAnalytics}
                                onDelete={handleDeleteAd}
                            />
                        ))}
                    </div>
                )}
                {isStaff && user && <ModerationPanel user={user}/>}
            </main>
            <AuthModal
                isOpen={isLoginOpen}
                isRegisterMode={isRegisterMode}
                onClose={() => setIsLoginOpen(false)}
                onToggleMode={() => setIsRegisterMode((value) => !value)}
                onSubmit={handleAuth}
            />
            <AdForm
                isOpen={isFormOpen}
                brands={brands}
                initialAd={editingAd}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingAd(null);
                }}
                onSubmit={handleSaveAd}
                onReportMissing={handleReportMissing}
            />
            <AnalyticsView analytics={analytics} onClose={() => setAnalytics(null)}/>
            {openedAd && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2 className="modal-title">{openedAd.title}</h2>
                        <p className="ad-card-info">{openedAd.make} {openedAd.model} · {openedAd.region}</p>
                        <p className="ad-card-price">{openedAd.originalPrice} {openedAd.originalCurrency}</p>
                        <p className="muted">
                            {openedAd.calculatedPrices.USD} USD · {openedAd.calculatedPrices.EUR} EUR · {openedAd.calculatedPrices.UAH} UAH
                        </p>
                        <p className="ad-card-info">{openedAd.description}</p>
                        <p className="muted">Продавець: {openedAd.sellerName} · {openedAd.sellerEmail}</p>
                        <p className="muted">Переглядів: {openedAd.views}</p>
                        <button className="btn btn-secondary" type="button" onClick={() => setOpenedAd(null)}>Закрити</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
