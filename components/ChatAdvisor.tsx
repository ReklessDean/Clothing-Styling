import React, { useState, useRef, useEffect } from 'react';
import { ClothingItem } from '../types';
import { chatWithStylist } from '../services/geminiService';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface ChatAdvisorProps {
  wardrobe: ClothingItem[];
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatAdvisor: React.FC<ChatAdvisorProps> = ({ wardrobe }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hi! I\'m your personal stylist. Ask me anything about your wardrobe or style advice!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history for Gemini API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await chatWithStylist(history, wardrobe, userMsg.text);
      
      const botMsg: Message = { id: crypto.randomUUID(), role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: "Sorry, I'm having trouble connecting to the fashion server right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background pb-20">
      <div className="p-4 border-b border-zinc-800 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="text-indigo-500" /> Style Chat
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
            }`}>
                {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-zinc-800 p-4 rounded-2xl rounded-bl-none border border-zinc-700 flex items-center gap-2">
                    <Loader2 className="animate-spin text-indigo-400" size={16} />
                    <span className="text-xs text-zinc-400">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface border-t border-zinc-800">
        <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-full border border-zinc-800 focus-within:border-indigo-500 transition-colors">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your clothes..."
                className="flex-1 bg-transparent px-4 py-2 text-white focus:outline-none text-sm"
                disabled={isLoading}
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-indigo-600 rounded-full text-white disabled:opacity-50 hover:bg-indigo-500 transition"
            >
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};
