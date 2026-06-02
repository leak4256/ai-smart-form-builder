const DEVELOPMENT_API_BASE_URL = 'http://localhost:5000/api';
const PRODUCTION_API_BASE_URL = 'https://my-ai-form-backend.onrender.com/api';

const normalizeApiBaseUrl = (url: string) => url.trim().replace(/\/+$/, '');

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const defaultApiBaseUrl = import.meta.env.DEV ? DEVELOPMENT_API_BASE_URL : PRODUCTION_API_BASE_URL;

export const API_BASE_URL = normalizeApiBaseUrl(
    typeof configuredApiBaseUrl === 'string' && configuredApiBaseUrl.trim()
        ? configuredApiBaseUrl
        : defaultApiBaseUrl
);

export const buildApiUrl = (endpoint: string) => {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${normalizedEndpoint}`;
};