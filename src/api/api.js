// src/api/api.js
const BASE_URL = 'https://arbitroshandball.com.ar/api/api.php'
function obtenerHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  }
  const token = sessionStorage.getItem('token_aaab')
  if (!token) {
    return headers
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

async function request(metodo, datos = {}) {
  console.log(datos)
  const config = {
    method: metodo,
    headers: obtenerHeaders(),
  };
  if (metodo === 'GET') {
    datos.payload = JSON.stringify(datos.payload) ?? {}
    const query = new URLSearchParams(datos).toString();
    const url = query ? `${BASE_URL}?${query}` : BASE_URL;
    const respuesta = await fetch(url, config);
    return respuesta.json();
  }
  config.body = JSON.stringify(datos);
  const respuesta = await fetch(BASE_URL, config);
  return respuesta.json();
}

export const api = {
  get: (params = {}) => request('GET', params),
  post: (data = {}) => request('POST', data),
};
