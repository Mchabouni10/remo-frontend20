import { getToken } from './users-service';

const API_URL = process.env.REACT_APP_API_URL;

export default async function sendRequest(endpoint, method = 'GET', payload = null) {
  const url = `${API_URL}${endpoint}`; // Works with relative endpoints
  console.log(`Requesting: ${url}`);
  const options = { method };
  if (payload) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(payload);
  }
  const token = getToken();
  if (token) {
    options.headers = options.headers || {};
    options.headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, options);
  if (res.ok) return res.json();
  const errorText = await res.text();
  throw new Error(`Request failed: ${res.status} - ${errorText}`);
}