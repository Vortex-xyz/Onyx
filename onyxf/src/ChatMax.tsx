import React, { useState } from "react";

const ChatMax = () => {
  const [messages, setMessages] = useState([
    { user: "Alice", text: "Hello!" },
    { user: "Bob", text: "Hi Alice!" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { user: "You", text: input }]);
      setInput("");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chat Max</h2>
      <div className="space-y-2 mb-4 h-64 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-center">
            <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">{msg.user}:</span>
            <span className="text-gray-800 dark:text-gray-200">{msg.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatMax;
