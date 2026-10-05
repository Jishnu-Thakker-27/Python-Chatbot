import React, { useState, useEffect, useRef } from 'react';
import { ClayAvatar } from './ClayAvatar';
import { audioEngine } from '../utils/audioEngine';
import { Send, Sparkles, Volume2, VolumeX, LogOut, RotateCcw, ArrowLeft, Bot, User } from 'lucide-react';

interface ChatbotScreenProps {
  username: string;
  userEmail: string;
  onBackToAuth: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const ChatbotScreen: React.FC<ChatbotScreenProps> = ({
  username,
  userEmail,
  onBackToAuth,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ambientAudioOn, setAmbientAudioOn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Time-aware greeting calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = username.trim() || 'Friend';
  const greeting = getGreeting();

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-1',
        role: 'assistant',
        content: `Good morning, ${displayName}! 🌅 I'm Aether, your tactile mind & focus companion. How can I help clarify your thoughts, plan your day, or guide your mindfulness today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [displayName]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputText;
    if (!message.trim() || isLoading) return;

    audioEngine.playHapticClick(450, 0.05);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          username: displayName,
          history: messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Server response failed');
      }

      const data = await response.json();
      audioEngine.playChime(528, 1.0);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || `Good morning, ${displayName}! What would you like to explore next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      audioEngine.playHapticClick(280);
      const fallbackMsg: ChatMessage = {
        id: `bot-fb-${Date.now()}`,
        role: 'assistant',
        content: `Good morning, ${displayName}! Focus on taking one steady, mindful breath. I'm here to help you outline your priorities and keep your mind grounded today.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAmbientAudio = () => {
    audioEngine.playHapticClick(ambientAudioOn ? 280 : 440);
    if (ambientAudioOn) {
      audioEngine.stopSoundscape();
      setAmbientAudioOn(false);
    } else {
      audioEngine.playSoundscape('deep-orbit');
      setAmbientAudioOn(true);
    }
  };

  const handlePromptChipClick = (prompt: string) => {
    audioEngine.playHapticClick(400);
    handleSendMessage(prompt);
  };

  const handleClearChat = () => {
    audioEngine.playHapticClick(260);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Good morning, ${displayName}! Fresh slate. What are we diving into today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="w-full flex flex-col justify-between px-6 pt-5 pb-5 relative min-h-screen sm:min-h-[820px]" data-purpose="mobile-clay-container">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between mb-3" data-purpose="top-navigation">
        <button
          type="button"
          onClick={() => {
            audioEngine.playHapticClick(260);
            if (ambientAudioOn) audioEngine.stopSoundscape();
            onBackToAuth();
          }}
          aria-label="Back to Sign In and Sign Up"
          className="w-11 h-11 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
          title="Back to Login / Signup"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Pill App Logo/Badge */}
        <div className="px-4 py-2 rounded-full clay-surface-sm flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              ambientAudioOn ? 'bg-[#4bb390] shadow-[0_0_10px_#4bb390] animate-pulse' : 'bg-[#52a6ba] shadow-[0_0_8px_#52a6ba]'
            }`}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4d657d] text-subtle-debossed">
            Aether AI Chatbot
          </span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Ambient Soundscape Toggle */}
          <button
            type="button"
            onClick={toggleAmbientAudio}
            aria-label="Toggle ambient focus audio"
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              ambientAudioOn ? 'clay-badge-active' : 'clay-surface-sm text-[#4a637a]'
            }`}
            title={ambientAudioOn ? 'Mute 432Hz Ambient Sound' : 'Play 432Hz Ambient Sound'}
          >
            {ambientAudioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Reset / Sign Out */}
          <button
            type="button"
            onClick={handleClearChat}
            aria-label="Reset chat"
            className="w-11 h-11 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* BEGIN: "Good morning [username]" Box (Requested by user) */}
      <section
        className="clay-surface rounded-3xl p-5 mb-3.5 relative overflow-hidden"
        data-purpose="good-morning-username-box"
      >
        {/* Embossed Ambient Highlight */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <ClayAvatar size="md" isOnline={true} isAnimated={true} />

          <div className="flex-1 pr-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full clay-tag mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4bb390] shadow-[0_0_4px_#4bb390]" />
              <span className="text-[10px] font-bold text-[#355b66] uppercase tracking-wide">
                Sound &amp; Mind
              </span>
            </div>
            {/* Prominent Good morning [username] Title */}
            <h1 className="text-xl font-extrabold text-debossed leading-tight truncate">
              Good morning, {displayName}!
            </h1>
            <p className="text-xs text-subtle-debossed font-medium mt-0.5">
              Enter your thoughts or choose a focus prompt below.
            </p>
          </div>
        </div>

        {/* Quick Suggestion Chips inside the Good Morning Box */}
        <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-[#aab9c7]/40">
          <button
            onClick={() => handlePromptChipClick(`Help me organize my top 3 morning priorities for today.`)}
            className="py-2 px-2.5 rounded-xl clay-card-pill text-[11px] font-bold text-[#374f63] text-left truncate hover:text-[#1e3040] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🌅 Morning Focus</span>
          </button>
          <button
            onClick={() => handlePromptChipClick(`Recommend a calming spatial soundscape for deep study.`)}
            className="py-2 px-2.5 rounded-xl clay-card-pill text-[11px] font-bold text-[#374f63] text-left truncate hover:text-[#1e3040] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🎧 Audio Remedy</span>
          </button>
          <button
            onClick={() => handlePromptChipClick(`Guide me through a quick 2-minute mindful breathing exercise.`)}
            className="py-2 px-2.5 rounded-xl clay-card-pill text-[11px] font-bold text-[#374f63] text-left truncate hover:text-[#1e3040] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🧘 Box Breathing</span>
          </button>
          <button
            onClick={() => handlePromptChipClick(`Share an inspiring, uplifting quote to start my morning with clarity.`)}
            className="py-2 px-2.5 rounded-xl clay-card-pill text-[11px] font-bold text-[#374f63] text-left truncate hover:text-[#1e3040] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>✨ Morning Spark</span>
          </button>
        </div>
      </section>
      {/* END: "Good morning [username]" Box */}

      {/* Messages Stream Container */}
      <div
        className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 max-h-[360px] sm:max-h-[420px] scroll-smooth"
        data-purpose="chat-messages-scroll"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}
            >
              <div
                className={`max-w-[86%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                  isUser
                    ? 'clay-badge-active text-white rounded-br-xs'
                    : 'clay-surface-sm text-[#304557] rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              <span className="text-[10px] text-[#71879a] font-medium px-2">
                {isUser ? displayName : 'Aether'} · {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Loading / Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-left">
            <div className="clay-surface-sm rounded-2xl py-3 px-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5fa5b8] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#5fa5b8] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#5fa5b8] animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] font-bold text-[#62778a] ml-1">Aether is reflecting...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Inset Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="space-y-2"
        data-purpose="chat-input-bar"
      >
        <div className="clay-inset rounded-2xl flex items-center px-3.5 py-2.5 gap-2.5 border border-white/20 transition-all focus-within:ring-2 focus-within:ring-[#5fa5b8]/50">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message Aether, ${displayName}...`}
            className="bg-transparent border-none p-0 w-full text-sm font-semibold text-[#304557] placeholder-[#8195a6] focus:ring-0 focus:outline-none"
            disabled={isLoading}
          />

          {/* Tactile Cyan Send Pill Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-xl clay-button-cyan flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 transition-all active:scale-95"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 fill-white stroke-white translate-x-0.5" />
          </button>
        </div>

        {/* Soft iOS Home Indicator */}
        <div className="w-32 h-1.5 rounded-full clay-inset mx-auto mt-2" />
      </form>
    </div>
  );
};
