import React from 'react';

interface AuthModalProps {
    isOpen: boolean;
    isRegisterMode: boolean;
    onClose: () => void;
    onToggleMode: () => void;
    onSubmit: (name: string, email: string, password: string) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({isOpen, isRegisterMode, onClose, onToggleMode, onSubmit}) => {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(name, email, password);
        } finally {
            setLoading(false);
            setName('');
            setEmail('');
            setPassword('');
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
            <div style={{backgroundColor: '#2d2d2d', border: '1px solid #404040', borderRadius: '12px', padding: '32px', maxWidth: '420px', width: '90%', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.3)'}}>
                <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#e0e0e0'}}>
                    {isRegisterMode ? 'Реєстрація' : 'Вхід в систему'}
                </h2>

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {isRegisterMode && (
                        <input type="text" placeholder="Ваше ім'я" value={name} onChange={(e) => setName(e.target.value)} required style={{padding: '10px 12px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit'}}/>
                    )}

                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{padding: '10px 12px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit'}}/>
                    <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required style={{padding: '10px 12px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit'}}/>
                    <button type="submit" disabled={loading} style={{padding: '10px 16px', backgroundColor: loading ? '#5a5a5a' : '#2b7dd4', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'}}>
                        {loading ? 'Завантаження...' : (isRegisterMode ? 'Зареєструватися' : 'Увійти')}
                    </button>
                    <div style={{textAlign: 'center', fontSize: '12px'}}>
                        <button type="button" onClick={onToggleMode} style={{color: '#2b7dd4', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px'}}>
                            {isRegisterMode
                                ? 'Вже маю аккаунт. Увійти'
                                : 'Не маю аккаунта. Зареєструватися'}
                        </button>
                    </div>
                    <button type="button" onClick={onClose} style={{padding: '10px 16px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginTop: '8px'}}>Скасувати</button>
                </form>
            </div>
        </div>
    );
};
