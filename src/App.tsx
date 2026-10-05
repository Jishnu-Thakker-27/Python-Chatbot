import React, { useState } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { ChatbotScreen } from './components/ChatbotScreen';
import { audioEngine } from './utils/audioEngine';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  // Two-screen flow: 'auth' (login & signup) and 'chatbot' (chatbot with Good morning [username] box)
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'chatbot'>('auth');
  const [username, setUsername] = useState('Aryan');
  const [userEmail, setUserEmail] = useState('aryan@musicverse.io');
  const [viewMode, setViewMode] = useState<'device' | 'fluid'>('device');

  const handleAuthSuccess = (name: string, email: string) => {
    setUsername(name);
    setUserEmail(email);
    setCurrentScreen('chatbot');
  };

  const handleBackToAuth = () => {
    setCurrentScreen('auth');
  };

  return (
    <div className="min-h-screen bg-[#c5d2dc] text-[#3f556b] flex flex-col justify-between items-center select-none overflow-x-hidden p-0 sm:py-6">
      {/* Top Desktop Presentation Bar */}
      <div className="hidden md:flex items-center justify-between w-full max-w-xl px-6 py-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#52a6ba] shadow-[0_0_8px_#52a6ba]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4d657d] text-subtle-debossed">
            Aether Space
          </span>
        </div>

        {/* Two Screen Switcher for Easy Review */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl clay-surface-sm">
          <button
            onClick={() => {
              audioEngine.playHapticClick(320);
              setCurrentScreen('auth');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentScreen === 'auth' ? 'clay-badge-active shadow-xs' : 'text-[#4e6478] hover:text-[#2d4052]'
            }`}
          >
            1. Login &amp; Signup
          </button>
          <button
            onClick={() => {
              audioEngine.playHapticClick(320);
              setCurrentScreen('chatbot');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentScreen === 'chatbot' ? 'clay-badge-active shadow-xs' : 'text-[#4e6478] hover:text-[#2d4052]'
            }`}
          >
            2. Good Morning Chatbot
          </button>
        </div>

        {/* View Mode Toggle: Device vs Fluid */}
        <div className="flex items-center gap-1 p-1 rounded-xl clay-surface-sm">
          <button
            onClick={() => {
              audioEngine.playHapticClick(300);
              setViewMode('device');
            }}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'device' ? 'clay-badge-active' : 'text-[#50667a]'
            }`}
            title="iPhone Clay Viewport"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              audioEngine.playHapticClick(300);
              setViewMode('fluid');
            }}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'fluid' ? 'clay-badge-active' : 'text-[#50667a]'
            }`}
            title="Expanded Fluid View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main
        className={`w-full transition-all duration-300 ${
          viewMode === 'device'
            ? 'iphone-frame sm:rounded-[42px] sm:clay-surface sm:p-2 sm:border sm:border-white/30 sm:shadow-2xl'
            : 'max-w-xl sm:clay-surface sm:rounded-3xl sm:p-4 sm:border sm:border-white/30'
        }`}
      >
        {currentScreen === 'auth' ? (
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        ) : (
          <ChatbotScreen
            username={username}
            userEmail={userEmail}
            onBackToAuth={handleBackToAuth}
          />
        )}
      </main>

      {/* Mobile Switcher Footer */}
      <div className="sm:hidden flex items-center justify-center gap-2 py-2">
        <button
          onClick={() => {
            audioEngine.playHapticClick(300);
            setCurrentScreen(currentScreen === 'auth' ? 'chatbot' : 'auth');
          }}
          className="text-[10px] font-bold text-[#62778a] px-3 py-1 rounded-full clay-surface-sm cursor-pointer"
        >
          {currentScreen === 'auth' ? 'Switch to Chatbot Screen →' : '← Switch to Login & Signup Screen'}
        </button>
      </div>
    </div>
  );
}
