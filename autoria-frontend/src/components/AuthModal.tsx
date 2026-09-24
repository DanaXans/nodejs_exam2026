import {useState} from 'react';
import type {FormEvent} from 'react';
import type {UserRole} from '../types';

interface AuthModalProps {
    isOpen: boolean;
    isRegisterMode: boolean;
    onClose: () => void;
    onToggleMode: () => void;
    onSubmit: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
}

export const AuthModal = ({isOpen, isRegisterMode, onClose, onToggleMode, onSubmit}: AuthModalProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('SELLER');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        try {
            await onSubmit(name, email, password, role);
            setName('');
            setEmail('');
            setPassword('');
            setRole('SELLER');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">{isRegisterMode ? 'Реєстрація' : 'Вхід'}</h2>
                <form className="form" onSubmit={handleSubmit}>
                    {isRegisterMode && (
                        <input placeholder="Ім'я" value={name} onChange={(event) => setName(event.target.value)} required/>
                    )}
                    <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required/>
                    <input type="password" placeholder="Пароль" value={password} onChange={(event) => setPassword(event.target.value)} required/>
                    {isRegisterMode && (
                        <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                            <option value="SELLER">Продавець</option>
                            <option value="BUYER">Покупець</option>
                        </select>
                    )}
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Зачекайте...' : isRegisterMode ? 'Зареєструватися' : 'Увійти'}
                    </button>
                    <button className="link-button" type="button" onClick={onToggleMode}>
                        {isRegisterMode ? 'Вже є акаунт. Увійти' : 'Немає акаунта. Зареєструватися'}
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={onClose}>Скасувати</button>
                </form>
            </div>
        </div>
    );
};
