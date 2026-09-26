const configured = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'https://hrms-backend.viraladsmedia.com/api' : '/api')).replace(/\/+$/, '');
export const getApiUrl = () => configured;
export const getServerBase = () => configured.replace(/\/api$/, '');
