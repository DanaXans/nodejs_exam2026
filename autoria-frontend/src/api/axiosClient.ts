const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${cleanEndpoint}`, {...options, headers});
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = typeof data?.message === 'string' ? data.message : `Помилка ${response.status}`;
        throw new Error(message);
    }
    return data as T;
};
