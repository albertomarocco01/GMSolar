import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Zap, Bot, User } from 'lucide-react';
import { Message } from '../types';
import { generateResponse } from '../data';
import { ProductCard } from './ProductCard';
import { ComparisonTable } from './ComparisonTable';

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Ciao! 👋 Dicci che auto elettrica guidi (es. Tesla Model 3, Fiat 500e) o dove ricarichi di solito, e ti consiglierò il cavo perfetto per te.',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    setMessages(prev => [...prev, { id: Math.random().toString(), role: 'user', text: userText }]);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(userText);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto h-[85vh] md:h-[750px] bg-zinc-950 border border-zinc-800 md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center gap-3 shrink-0 z-10">
        <div className="w-10 h-10 rounded-full bg-acid/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-acid" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-white leading-tight">EV Cable Advisor</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-acid animate-pulse"></span>
            <span className="text-xs text-zinc-400 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}
            >
              <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-zinc-800' : 'bg-acid text-zinc-950'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Text Bubble */}
                <div className={`px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-zinc-800 text-zinc-100 rounded-tr-sm' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>

              {/* Dynamic UI Recommendations */}
              {msg.role === 'assistant' && msg.recommendation && (
                <div className="w-full pl-11 pr-2 mt-2">
                  <ProductCard product={msg.recommendation} />
                  {msg.comparison && (
                    <ComparisonTable 
                      products={msg.comparison} 
                      recommendedId={msg.recommendation.id} 
                    />
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex gap-3 max-w-[85%]"
          >
            <div className="w-8 h-8 rounded-full bg-acid shrink-0 flex items-center justify-center">
              <Bot className="w-4 h-4 text-zinc-950" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 rounded-tl-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-900 shrink-0 z-10">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Scrivi il tuo modello di EV..."
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:border-acid focus:ring-1 focus:ring-acid transition-all"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 p-2 rounded-full bg-acid text-zinc-950 hover:bg-acid-hover disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-zinc-600 mt-3 font-medium uppercase tracking-wider">
          Powered by Mennekes
        </p>
      </div>

    </div>
  );
};
