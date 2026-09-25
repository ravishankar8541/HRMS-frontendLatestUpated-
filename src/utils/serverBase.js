const configured = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')).replace(/\/+$/, '');
export const getApiUrl = () => configured;
export const getServerBase = () => configured.replace(/\/api$/, '');
