import React, {useEffect, useState} from 'react';
import {AccountType, type AdAnalytics, type CarAd, type User, UserRole} from './types';
import {Navbar} from './components/NavBar';
import {AdCard} from './components/AdCard';
import {AdForm} from './components/AdForm';
import {AnalyticsView} from './components/AnalyticsView';
import {apiCall, deleteAdRequest} from './api/axiosClient';

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
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        loadAds();
    }, []);

    const loadAds = async () => {
        try {
            const data = await apiCall<CarAd[]>('/ads');
            setAds(data);
        } catch (err) {
            console.error('Помилка завантаження оголошень:', err);
            setAds([]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
        const payload = isRegisterMode
            ? {name, email, password, role: UserRole.SELLER}
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
            setName('');
            setEmail('');
            setPassword('');

            alert(isRegisterMode ? 'Успішна реєстрація!' : 'Успішний вхід!');
        }
        catch (err: any) {
            alert(err.message || 'Помилка виконання запиту');
        }
    };

    const handleCreateAd = async (adData: any) => {
        try {
            await apiCall('/ads', {method: 'POST', body: JSON.stringify(adData)});
            alert('Оголошення додано!');
            setIsFormOpen(false);
            await loadAds();
        }
        catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Помилка при додаванні';
            alert(errorMessage);
        }
    };

    const handleShowAnalytics = async (ad: CarAd) => {
        try {
            const res = await apiCall<AdAnalytics>(`/ads/${ad._id}/analytics`);
            setAnalytics(res);
        }
        catch {
            setAnalytics({
                views: ad.views,
                avgPriceRegion: ad.calculatedPrices.USD * 0.96,
                avgPriceUkraine: ad.calculatedPrices.USD * 0.98,
                regionName: ad.region,
            });
        }
    };

    const handleDeleteAd = async (id: string) => {
        try {
            await deleteAdRequest(id);
            setAds(prevAds => prevAds.filter(ad => ((ad as any)._id || (ad as any).id) !== id));
        }
        catch (error: any) {
            console.error('Помилка при видаленні:', error);
            alert(error.message || 'Сталася помилка під час видалення');
        }
    };
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar user={user} onOpenForm={() => {
                    if (!user) {
                        alert('Спочатку увійдіть або зареєструйтесь!');
                        setIsLoginOpen(true);
                        return;
                    }
                    setIsFormOpen(true);
            }} onRequestBrand={() => {const brand = prompt('Вкажіть марку/модель:');if (brand) alert('Запит надіслано адміністрації!');}} onLogout={handleLogout}/>
            {!user && (
                <div className="bg-amber-50 border-b border-amber-200 py-3 text-center text-sm text-amber-800 flex items-center justify-center gap-4">
                    <span>Ви не авторизовані. Увійдіть або зареєструйтеся, щоб створювати оголошення.</span>
                    <button onClick={() => setIsLoginOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold">Увійти / Зареєструватися</button>
                </div>
            )}
            {user && (
                <div className="bg-white border-b py-2 text-center text-xs text-gray-600">
                    Переключити підписку:{' '}
                    <button onClick={() => setUser({...user, accountType: AccountType.BASIC})} className={`ml-2 px-2 py-0.5 rounded border ${user.accountType === AccountType.BASIC ? 'bg-blue-600 text-white font-bold' : ''}`}>BASIC</button>

                    <button onClick={() => setUser({...user, accountType: AccountType.PREMIUM})} className={`ml-2 px-2 py-0.5 rounded border ${user.accountType === AccountType.PREMIUM ? 'bg-amber-600 text-white font-bold' : ''}`}>PREMIUM</button>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 py-6 w-full">
                <h1 className="text-xl font-bold text-gray-800 mb-4">Оголошення про продаж авто</h1>
                {ads.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">Оголошень поки що немає. Створіть своє перше оголошення.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ads.map((ad: CarAd) => (
                            <AdCard key={(ad as any)._id || (ad as any).id} ad={ad} user={user} onShowAnalytics={handleShowAnalytics} onDelete={handleDeleteAd}/>))}
                    </div>
                )}
            </main>{isLoginOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
                        <h2 className="text-lg font-bold mb-4">{isRegisterMode ? 'Реєстрація' : 'Вхід у систему'}</h2>

                        <form onSubmit={handleAuthSubmit} className="space-y-3">
                            {isRegisterMode && (

                            <input type="text" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded text-sm" required/>)}
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded text-sm" required/>
                            <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded text-sm" required/>

                            <div className="pt-2 text-xs text-center">
                                <button type="button" onClick={() => setIsRegisterMode(!isRegisterMode)} className="text-blue-600 hover:underline">
                                    {isRegisterMode
                                        ? 'Уже есть аккаунт? Войти'
                                        : 'Нет аккаунта? Зарегистрироваться'}
                                </button>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsLoginOpen(false)} className="px-3 py-1.5 text-xs border rounded">Отмена</button>
                                <button type="submit" className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded font-bold">{isRegisterMode ? 'Зарегистрироваться' : 'Войти'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AdForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleCreateAd}/>
            <AnalyticsView analytics={analytics} onClose={() => setAnalytics(null)}/>
        </div>
    );
};

export default App;