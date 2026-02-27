import React, { useState } from 'react';
import { firebaseGoogleLogin, apiFetch, getJWT } from '../api/auth';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await apiFetch(`/api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'signup' ? { email, password, username } : { email, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.reload();
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError('Network error');
    }
  }

  async function handleGoogle() {
    setError('');
    try {
      const data = await firebaseGoogleLogin();
      if (data.token) {
        window.location.reload();
      } else {
        setError(data.error || 'Google login failed');
      }
    } catch (err) {
      setError('Google login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          className="w-full border px-3 py-2 rounded"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border px-3 py-2 rounded"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
        <button type="button" onClick={handleGoogle} className="w-full bg-red-500 text-white py-2 rounded font-semibold hover:bg-red-600 transition">
          Continue with Google
        </button>
      </form>
      <div className="mt-4 text-center">
        <button className="text-blue-600 underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Create an account' : 'Already have an account? Login'}
        </button>
      </div>
      {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
    </div>
  );
}
