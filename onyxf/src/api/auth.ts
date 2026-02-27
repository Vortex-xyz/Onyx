import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const BACKEND_URL = 'https://your-backend.com'; // Change to your deployed backend URL

export async function firebaseGoogleLogin() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  if (!user) throw new Error('No user');
  const idToken = await user.getIdToken();
  // Send token to backend
  const res = await fetch(`${BACKEND_URL}/api/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });
  const data = await res.json();
  if (data.token) localStorage.setItem('token', data.token);
  return data;
}

export function getJWT() {
  return localStorage.getItem('token');
}

export async function apiFetch(path: string, options: any = {}) {
  const token = getJWT();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  return fetch(`${BACKEND_URL}${path}`, { ...options, headers });
}