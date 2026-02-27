import React, { useState } from "react";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userId] = useState(() => {
    // Generate a unique user ID (UUID v4 simple implementation)
    return 'user-' + Math.random().toString(36).substr(2, 9);
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save settings to backend
    alert(`Settings saved! Your user ID: ${userId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-pink-500">
      <form onSubmit={handleSave} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-purple-700">Settings</h2>
        <div className="mb-4 text-sm text-gray-500">User ID: <span className="font-mono text-purple-700">{userId}</span></div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-purple-400"
          required
        />
        <textarea
          placeholder="Bio"
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-purple-400"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="w-full mb-4"
        />
        {avatar && <img src={avatar} alt="Avatar Preview" className="mb-4 rounded-full w-20 h-20 object-cover mx-auto" />}
        <button type="submit" className="w-full bg-purple-700 text-white py-2 rounded font-bold hover:bg-purple-800 transition">Save Settings</button>
      </form>
    </div>
  );
}
