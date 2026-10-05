import React, { useState } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { ChatbotScreen } from './components/ChatbotScreen';

export default function App() {
  // Navigation flow: starts on 'auth', can ONLY proceed to 'chatbot' after being signed in
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'chatbot'>('auth');
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const handleAuthSuccess = (name: string, email: string) => {
    setUsername(name);
    setUserEmail(email);
    setCurrentScreen('chatbot');
  };

  const handleBackToAuth = () => {
    setCurrentScreen('auth');
  };

  return (
    <div className="min-h-screen bg-[#c5d2dc] text-[#3f556b] flex flex-col justify-center items-center select-none overflow-x-hidden p-2 sm:p-6">
      {/* Auto-responsive Main Container: Fits mobile perfectly and centers as a tactile clay card on PC / Laptop */}
      <main className="w-full max-w-md sm:max-w-lg mx-auto sm:clay-surface sm:rounded-[36px] sm:p-3 sm:border sm:border-white/30 sm:shadow-2xl flex flex-col transition-all duration-300">
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
    </div>
  );
}
