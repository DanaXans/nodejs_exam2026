import React from 'react';
import type {User, AccountType} from '../types';

interface NavbarProps {
    user: User | null;
    onOpenForm: () => void;
    onLogout: () => void;
    accountType?: AccountType;
    onSwitchAccount: (type: AccountType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({user, onOpenForm, onLogout, accountType, onSwitchAccount}) => {
    return (
        <nav style={{backgroundColor: '#2d2d2d', borderBottom: '1px solid #404040', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 40}}>
            <div style={{maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#2b7dd4', margin: 0}}>AUTORIA.clone</h1>
                <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                    {user && (
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <span style={{fontSize: '14px', color: '#b0b0b0'}}>
                                 {user.name} • {accountType || user.accountType}
                            </span>
                            <button onClick={() => onSwitchAccount(accountType === 'BASIC' ? 'PREMIUM' : 'BASIC')} style={{padding: '4px 12px', backgroundColor: accountType === 'PREMIUM' ? '#2d8a4f' : '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2b7dd4'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#404040'}>Переключити</button>
                        </div>
                    )}

                    {user ? (
                        <>
                            <button onClick={onOpenForm} style={{padding: '8px 16px', backgroundColor: '#2b7dd4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e5aa8'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2b7dd4'}>Додати оголошення</button>
                            <button onClick={onLogout} style={{padding: '8px 16px', backgroundColor: '#3a3a3a', color: '#e0e0e0', border: '1px solid #404040', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'}} onMouseEnter={(e) => {e.currentTarget.style.borderColor = '#c41c1c';e.currentTarget.style.color = '#ef4444';}} onMouseLeave={(e) => {e.currentTarget.style.borderColor = '#404040';e.currentTarget.style.color = '#e0e0e0';}}>Вихід</button></>
                    ) : (
                        <button onClick={() => {}} style={{padding: '8px 16px', backgroundColor: '#2b7dd4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}>Вхід / Реєстрація</button>
                    )}
                </div>
            </div>
        </nav>
    );
};
