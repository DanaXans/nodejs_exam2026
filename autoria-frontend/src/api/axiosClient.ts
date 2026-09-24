const BASE_URL = 'http://localhost:5000/api';
export const apiCall = async <T>(
    endpoint: string,
    options: RequestInit = {}): Promise<T> => {

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${cleanEndpoint}`, {
        ...options,
        headers,
    });
    const contentType = response.headers.get('content-type');

    let data: any;
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        const errorText = await response.text();
        console.error('Помилка сервера (HTML/Текст):', errorText);
        throw new Error(`Помилка сервера (${response.status}).`);
    }
    if (!response.ok) {
        throw new Error(data?.message || `Помилка ${response.status}`);
    }
    return data as T;
};

export const deleteAdRequest = async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/ads/${id}`, {
        method: 'DELETE', headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Неможливо видалити оголошення');
    }
    return await response.json();
};