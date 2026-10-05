import React, { useState, useEffect, useRef } from 'react';
import { ClayAvatar } from './ClayAvatar';
import { audioEngine } from '../utils/audioEngine';
import { Send, Volume2, VolumeX, RotateCcw, ArrowLeft, Copy, Check, Volume1 } from 'lucide-react';
import { API_BASE } from '../config/api';

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clean speech synthesis cleanup
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Helper to format bold, bullets, and paragraphs in bot messages
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      let text = line.trim();
      if (isBullet) {
        text = text.substring(2);
      }

      // Match **bold text**
      const parts = text.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-extrabold text-[#1f3447]">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 ml-1 my-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#52a6ba] shrink-0 mt-1.5" />
            <span className="flex-1">{formattedParts}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return <p key={idx} className="my-0.5">{formattedParts}</p>;
    });
  };

  // IST (Indian Standard Time) helpers
  const getISTFormattedTime = () => {
    return new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getISTHour = () => {
    const istDateString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    return new Date(istDateString).getHours();
  };

  // Time-aware greeting calculation strictly in IST
  const getGreeting = () => {
    const hour = getISTHour();
    if (hour >= 4 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = username.trim() || 'Friend';
  const greeting = getGreeting();

  // Initial welcome message or load history from backend
  useEffect(() => {
    async function loadHistory() {
      try {
        if (userEmail) {
          const res = await fetch(`${API_BASE}/api/history?email=${encodeURIComponent(userEmail)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.history && data.history.length > 0) {
              const loaded = data.history.map((h: any) => ({
                id: `hist-${h.id}`,
                role: h.role,
                content: h.message,
                timestamp: h.created_at || getISTFormattedTime(),
              }));
              setMessages(loaded);
              return;
            }
          }
        }
      } catch {
        // Fallback to welcome message
      }

      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content: `${greeting}, ${displayName}! 🌅 I'm Aether, your mindful AI focus and daily guidance companion. How can I support your thoughts, day planning, or studies today?`,
          timestamp: getISTFormattedTime(),
        },
      ]);
    }

    loadHistory();
  }, [displayName, userEmail, greeting]);

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
      timestamp: getISTFormattedTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          username: displayName,
          email: userEmail,
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
        content: data.reply || `${greeting}, ${displayName}! How else can I help?`,
        timestamp: getISTFormattedTime(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      audioEngine.playHapticClick(280);
      const fallbackMsg: ChatMessage = {
        id: `bot-fb-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Could not reach backend server (port 8000). Please ensure FastAPI is running.`,
        timestamp: getISTFormattedTime(),
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

  const handleClearChat = async () => {
    audioEngine.playHapticClick(260);
    try {
      if (userEmail) {
        await fetch(`${API_BASE}/api/history?email=${encodeURIComponent(userEmail)}`, {
          method: 'DELETE',
        });
      }
    } catch {
      // ignore
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `${greeting}, ${displayName}! Fresh slate. What are we diving into today?`,
        timestamp: getISTFormattedTime(),
      },
    ]);
  };

  return (
    <div className="w-full flex flex-col justify-between px-5 pt-4 pb-5 relative min-h-[640px] max-h-[88vh] h-full" data-purpose="mobile-clay-container">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between mb-3 shrink-0" data-purpose="top-navigation">
        <button
          type="button"
          onClick={() => {
            audioEngine.playHapticClick(260);
            if (ambientAudioOn) audioEngine.stopSoundscape();
            onBackToAuth();
          }}
          aria-label="Back to Sign In"
          className="w-10 h-10 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
          title="Sign out / Switch user"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Pill App Logo/Badge */}
        <div className="px-3.5 py-1.5 rounded-full clay-surface-sm flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              ambientAudioOn ? 'bg-[#4bb390] shadow-[0_0_8px_#4bb390] animate-pulse' : 'bg-[#52a6ba] shadow-[0_0_6px_#52a6ba]'
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
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              ambientAudioOn ? 'clay-badge-active text-emerald-700 shadow-sm' : 'clay-surface-sm text-[#4a637a]'
            }`}
            title={ambientAudioOn ? 'Mute 432Hz Soundscape' : 'Play 432Hz Focus Soundscape'}
          >
            {ambientAudioOn ? <Volume2 className="w-4.5 h-4.5 text-emerald-600 animate-pulse" /> : <VolumeX className="w-4.5 h-4.5" />}
          </button>

          {/* Reset Conversation */}
          <button
            type="button"
            onClick={handleClearChat}
            aria-label="Reset chat"
            className="w-10 h-10 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* Ambient Soundscape Status indicator if playing */}
      {ambientAudioOn && (
        <div className="mb-2 px-3 py-1 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            432Hz Deep Focus Soundscape is active
          </span>
          <button onClick={toggleAmbientAudio} className="text-emerald-700 underline cursor-pointer text-[10px]">
            Mute
          </button>
        </div>
      )}

      {/* BEGIN: Dynamic Greeting Box (Time-of-day + Username) */}
      <section
        className="clay-surface rounded-3xl p-4 mb-3 relative overflow-hidden shrink-0"
        data-purpose="good-morning-username-box"
      >
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5">
          <ClayAvatar size="md" isOnline={true} isAnimated={true} />

          <div className="flex-1 pr-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full clay-tag mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4bb390] shadow-[0_0_4px_#4bb390]" />
              <span className="text-[10px] font-bold text-[#355b66] uppercase tracking-wide">
                Sound &amp; Mind
              </span>
            </div>
            {/* Dynamic Time-of-day Greeting */}
            <h1 className="text-lg font-extrabold text-debossed leading-tight truncate">
              {greeting}, {displayName}!
            </h1>
            <p className="text-xs text-subtle-debossed font-medium mt-0.5">
              Enter your thoughts or select a focus prompt below.
            </p>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#aab9c7]/40">
          <button
            onClick={() => handlePromptChipClick(`Help me organize my top 3 priorities for today.`)}
            className="py-1.5 px-2.5 rounded-xl clay-card-pill text-[11px] font-bold text-[#374f63] text-left truncate hover:text-[#1e3040] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🌅 Daily Focus</span>
          </button>
          <button
            onClick={() => handlePromptChipClick(`Recommend a calming spatial soundscape for deep study.`)}
            className="py-1.5 px-2.5 rounded-xl clay-card-pill text-[11px] font-bold text-[#374f63] text-left truncate hover:text-[#1e3040] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🎧 Audio Remedy</span>
          </button>
          <button
            onClick={() => handlePromptChipClick(`Guide me through a quick 2-minute mindful breathing exercise.`)}
            className="py-1.5 px-2.5 rounded-xl clay-card-pill text-[11px] font-bold text-[#374f63] text-left truncate hover:text-[#1e3040] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🧘 Box Breathing</span>
          </button>
          <button
            onClick={() => handlePromptChipClick(`Share an inspiring, uplifting thought for today.`)}
            className="py-1.5 px-2.5 rounded-xl clay-card-pill text-[11px] font-bold text-[#374f63] text-left truncate hover:text-[#1e3040] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>✨ Spark Clarity</span>
          </button>
        </div>
      </section>
      {/* END: Dynamic Greeting Box */}

      {/* Messages Stream Container */}
      <div
        className="flex-1 overflow-y-auto space-y-3 mb-2 px-1 max-h-[380px] sm:max-h-[440px] scroll-smooth"
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
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                  isUser
                    ? 'clay-badge-active text-white rounded-br-xs'
                    : 'clay-surface-sm text-[#304557] rounded-bl-xs'
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="space-y-1">{renderFormattedContent(msg.content)}</div>
                )}
              </div>
              <div className="flex items-center gap-2 px-2 text-[10px] text-[#71879a] font-medium">
                <span>{isUser ? displayName : 'Aether'} · {msg.timestamp}</span>

                {!isUser && (
                  <div className="flex items-center gap-1.5 ml-1">
                    {/* Speak Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`p-1 rounded-md hover:bg-white/40 cursor-pointer transition-colors ${
                        speakingId === msg.id ? 'text-cyan-700 font-bold' : 'text-[#698094]'
                      }`}
                      title={speakingId === msg.id ? 'Stop audio' : 'Listen to response'}
                    >
                      <Volume1 className={`w-3.5 h-3.5 ${speakingId === msg.id ? 'animate-pulse' : ''}`} />
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded-md hover:bg-white/40 cursor-pointer transition-colors text-[#698094]"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading / Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-left">
            <div className="clay-surface-sm rounded-2xl py-2.5 px-3.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5fa5b8] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#5fa5b8] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#5fa5b8] animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] font-bold text-[#62778a] ml-1">Aether is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modern Centered Chat Input Dock */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-auto pt-1 shrink-0"
        data-purpose="chat-input-bar"
      >
        <div className="clay-inset rounded-2xl flex items-center px-4 py-2.5 gap-3 border border-white/20 transition-all focus-within:ring-2 focus-within:ring-[#5fa5b8]/50 shadow-inner">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message Aether, ${displayName}...`}
            className="bg-transparent border-none p-0 w-full text-sm font-semibold text-[#304557] placeholder-[#8195a6] focus:ring-0 focus:outline-none"
            disabled={isLoading}
          />

          {/* Cyan Send Pill Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-xl clay-button-cyan flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 transition-all active:scale-95 shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-4.5 h-4.5 fill-white stroke-white translate-x-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
