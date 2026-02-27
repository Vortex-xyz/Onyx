
import { FaCog, FaPalette } from 'react-icons/fa';

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-pink-200 to-purple-200 py-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <FaCog className="text-4xl text-indigo-500 mb-2 animate-spin" />
          <h2 className="text-3xl font-bold text-pink-600 mb-4">Settings</h2>
          <div className="mb-2 text-gray-700 flex items-center gap-2"><FaPalette /> Account settings, preferences, themes, etc.</div>
          {/* Add settings form here */}
        </div>
      </div>
    </div>
  );
}
