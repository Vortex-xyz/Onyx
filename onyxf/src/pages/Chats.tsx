
import { MessageCircle } from 'lucide-react';

export default function Chats() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 py-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <MessageCircle className="text-4xl text-pink-500 mb-2 animate-bounce" />
          <h2 className="text-3xl font-bold text-indigo-700 mb-4">Chats</h2>
          <div className="mb-2 text-gray-700">Chat with friends, join anime groups, etc.</div>
          {/* Add chat UI here */}
        </div>
      </div>
    </div>
  );
}