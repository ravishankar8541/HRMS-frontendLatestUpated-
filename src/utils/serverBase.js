const configured = (
  import.meta.env.VITE_API_URL ||
  'https://hrms-backend.viraladsmedia.com/api'
).replace(/\/+$/, '');

export const getApiUrl = () => configured;
export const getServerBase = () => configured.replace(/\/api$/, '');