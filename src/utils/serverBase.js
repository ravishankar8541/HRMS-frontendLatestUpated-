/** API root without trailing /api — for static assets like /uploads */
export const getServerBase = () => {
  const api = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return api.replace(/\/api\/?$/, "");
};

export const getApiUrl = () =>
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
