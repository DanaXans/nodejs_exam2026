import type {AccountType, User} from '../types';

interface NavbarProps {
    user: User | null;
    onOpenForm: () => void;
    onLogout: () => void;
    onUpgrade: () => void;
    onOpenLogin: () => void;
}

const accountLabel: Record<AccountType, string> = {
    BASIC: 'BASIC',
    PREMIUM: 'PREMIUM',
};

export const Navbar = ({user, onOpenForm, onLogout, onUpgrade, onOpenLogin}: NavbarProps) => {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-brand">AUTORIA.clone</div>
                <div className="navbar-actions">
                    {user && (
                        <span className="muted">
                            {user.name} · {user.role} · {accountLabel[user.accountType]}
                        </span>
                    )}
                    {user?.role === 'SELLER' && user.accountType === 'BASIC' && (
                        <button className="btn btn-secondary" onClick={onUpgrade} type="button">Отримати PREMIUM</button>
                    )}
                    {user?.role === 'SELLER' && (
                        <button className="btn btn-primary" onClick={onOpenForm} type="button">Додати оголошення</button>
                    )}
                    {user ? (
                        <button className="btn btn-secondary" onClick={onLogout} type="button">Вихід</button>
                    ) : (
                        <button className="btn btn-primary" onClick={onOpenLogin} type="button">Вхід / Реєстрація</button>
                    )}
                </div>
            </div>
        </nav>
    );
};
