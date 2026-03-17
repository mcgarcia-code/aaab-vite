// src/api/api.js
import axios from 'axios';

const BASE_URL = "https://arbitroshandball.com.ar/api/";

// Creamos la instancia de Axios
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// INTERCEPTOR: Agrega el Token automáticamente a CADA petición
apiClient.interceptors.request.use((config) => {
  const userRaw = sessionStorage.getItem('user_aaab');
  if (userRaw) {
    const user = JSON.parse(userRaw);
    // Suponiendo que tu objeto usuario tiene un campo 'token'
    // Si usas una API Key o similar, ajusta el nombre del Header aquí
    if (user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    // Si tu backend necesita el ID del árbitro siempre, podés agregarlo también:
    // config.headers['X-Arbitro-ID'] = user.id;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Exportamos un objeto similar al que ya tenías para no romper tus componentes
export const api = {
  get: (url, params = {}) => apiClient.get(url, { params }).then(res => res.data),
  post: (url, data) => apiClient.post(url, data).then(res => res.data),
};