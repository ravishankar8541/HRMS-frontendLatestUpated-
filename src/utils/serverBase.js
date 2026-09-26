const configured = (
  import.meta.env.VITE_API_URL ||
  'https://hrms-backend-25sept-fiyx.onrender.com/api'
).replace(/\/+$/, '');

export const getApiUrl = () => configured;
export const getServerBase = () => configured.replace(/\/api$/, '');