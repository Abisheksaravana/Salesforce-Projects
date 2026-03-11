import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { createSession, sendMessage, endSession } from './agentforceService';

const BOT_AVATAR = 'https://upload.wikimedia.org/wikipedia/commons/7/76/Salesforce.com_logo.svg';

export default function AgentforceChat() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      if (!sessionId) initSession();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    return () => {
      if (sessionId) endSession(sessionId).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function initSession() {
    setInitializing(true);
    setError(null);
    try {
      const { sessionId: id } = await createSession();
      setSessionId(id);
      setMessages([
        {
          role: 'agent',
          text: "Hi! I'm your Agentforce assistant. Ask me anything about Abishek's Salesforce skills, projects, or certifications!",
        },
      ]);
    } catch (e) {
      setError('Failed to connect to Agentforce. Check your credentials in .env.');
    } finally {
      setInitializing(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading || !sessionId) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);
    setError(null);

    try {
      const reply = await sendMessage(sessionId, text);
      setMessages((prev) => [...prev, { role: 'agent', text: reply }]);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="relative">
                <img
                  src={BOT_AVATAR}
                  alt="Agentforce"
                  className="w-9 h-9 rounded-full bg-white p-1"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm leading-none">Agentforce</p>
                <p className="text-blue-100 text-xs mt-0.5">
                  {initializing ? 'Connecting...' : 'Online'}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Messages area */}
            <div className="overflow-y-auto p-4 space-y-3 h-80 bg-gray-50">
              {initializing && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  Starting session...
                </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.role === 'agent' && (
                    <img
                      src={BOT_AVATAR}
                      alt="Agent"
                      className="w-7 h-7 rounded-full bg-white border border-blue-100 p-0.5 flex-shrink-0 mt-1"
                    />
                  )}
                  <div
                    className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-2 items-center">
                  <img
                    src={BOT_AVATAR}
                    alt="Agent"
                    className="w-7 h-7 rounded-full bg-white border border-blue-100 p-0.5 flex-shrink-0"
                  />
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-xs text-center bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                  {error}
                </p>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-gray-100 bg-white flex gap-2 items-end">
              <textarea
                ref={inputRef}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent max-h-24 leading-relaxed"
                rows={1}
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || initializing || !sessionId}
              />
              <motion.button
                onClick={handleSend}
                disabled={!input.trim() || loading || initializing || !sessionId}
                className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                whileTap={{ scale: 0.9 }}
                aria-label="Send message"
              >
                <FaPaperPlane className="text-sm" />
              </motion.button>
            </div>

            <p className="text-center text-gray-300 text-xs pb-2 select-none">
              Powered by Salesforce Agentforce
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating messaging launcher button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 transition-colors"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        aria-label={open ? 'Close chat' : 'Open Agentforce Chat'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <FaTimes className="text-xl" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <FaCommentDots className="text-xl" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
