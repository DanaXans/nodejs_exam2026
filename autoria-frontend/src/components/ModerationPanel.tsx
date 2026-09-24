import {useEffect, useState} from 'react';
import type {FormEvent} from 'react';
import type {BrandRequest, PublicUser, SentEmail, User} from '../types';
import {apiCall} from '../api/axiosClient';

interface ModerationPanelProps {
    user: User;
}

export const ModerationPanel = ({user}: ModerationPanelProps) => {
    const [users, setUsers] = useState<PublicUser[]>([]);
    const [reports, setReports] = useState<BrandRequest[]>([]);
    const [emails, setEmails] = useState<SentEmail[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const load = async () => {
        const nextUsers = await apiCall<PublicUser[]>('/users');
        setUsers(nextUsers);
        setEmails(await apiCall<SentEmail[]>('/emails'));
        if (user.role === 'ADMIN') {
            setReports(await apiCall<BrandRequest[]>('/brands/missing'));
        }
    };

    useEffect(() => {
        load().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : 'Не вдалося завантажити модерацію';
            alert(message);
        });
    }, [user.role]);

    const toggleBan = async (person: PublicUser) => {
        await apiCall(`/users/${person.id}/ban`, {
            method: 'PATCH',
            body: JSON.stringify({isBanned: !person.isBanned}),
        });
        await load();
    };

    const createManager = async (event: FormEvent) => {
        event.preventDefault();
        try {
            await apiCall('/users/managers', {
                method: 'POST',
                body: JSON.stringify({name, email, password}),
            });
            setName('');
            setEmail('');
            setPassword('');
            await load();
            alert('Менеджера створено');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Не вдалося створити менеджера');
        }
    };

    return (
        <section className="section">
            <h2>Модерація</h2>
            {user.role === 'ADMIN' && (
                <form className="form" onSubmit={createManager} style={{maxWidth: 480, marginBottom: 24}}>
                    <h3>Новий менеджер</h3>
                    <input placeholder="Ім'я" value={name} onChange={(event) => setName(event.target.value)} required/>
                    <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required/>
                    <input type="password" placeholder="Пароль" value={password} onChange={(event) => setPassword(event.target.value)} required/>
                    <button className="btn btn-primary" type="submit">Створити менеджера</button>
                </form>
            )}
            <table className="table">
                <thead>
                <tr>
                    <th>Ім'я</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Статус</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {users.map((person) => (
                    <tr key={person.id}>
                        <td>{person.name}</td>
                        <td>{person.email}</td>
                        <td>{person.role}</td>
                        <td>{person.isBanned ? 'Заблокований' : 'Активний'}</td>
                        <td>
                            {person.role !== 'ADMIN' && person.id !== user.id && (
                                <button className="btn btn-secondary" type="button" onClick={() => toggleBan(person).catch((error: unknown) => {
                                    alert(error instanceof Error ? error.message : 'Помилка');
                                })}>
                                    {person.isBanned ? 'Розблокувати' : 'Заблокувати'}
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="section">
                <h3>Листи менеджеру</h3>
                {emails.length === 0 && <p className="muted">Листів немає</p>}
                {emails.map((email) => (
                    <p key={email.id} className="muted">{email.subject}: {email.body}</p>
                ))}
            </div>
            {user.role === 'ADMIN' && (
                <div className="section">
                    <h3>Запити на нові марки</h3>
                    {reports.length === 0 && <p className="muted">Запитів немає</p>}
                    {reports.map((report) => (
                        <p key={report.id} className="muted">{report.make} {report.model}</p>
                    ))}
                </div>
            )}
        </section>
    );
};
