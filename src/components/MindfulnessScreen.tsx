import React, { useState, useEffect } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { ChevronLeft, Play, Pause, RotateCcw, Heart, Sparkles, Wind } from 'lucide-react';

interface MindfulnessScreenProps {
  onBack: () => void;
}

type BreathPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export const MindfulnessScreen: React.FC<MindfulnessScreenProps> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(3);

  // Breathing Box Timer: 4s Inhale, 4s Hold, 4s Exhale, 4s Rest
  useEffect(() => {
    let timer: number;
    if (isActive) {
      timer = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Next phase
            setPhase((currPhase) => {
              if (currPhase === 'Inhale') {
                audioEngine.playChime(440, 1.5);
                return 'Hold';
              }
              if (currPhase === 'Hold') {
                audioEngine.playChime(392, 1.5);
                return 'Exhale';
              }
              if (currPhase === 'Exhale') {
                audioEngine.playChime(329.63, 1.5);
                return 'Rest';
              }
              // Completed a full box cycle
              audioEngine.playChime(528, 2.0);
              setCompletedCycles((c) => c + 1);
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const handleToggle = () => {
    audioEngine.playHapticClick(isActive ? 280 : 480);
    if (!isActive) {
      audioEngine.playChime(432, 2.0);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    audioEngine.playHapticClick(260);
    setIsActive(false);
    setPhase('Inhale');
    setSecondsLeft(4);
    setCompletedCycles(0);
  };

  const getSphereScale = () => {
    if (!isActive) return 'scale-90';
    switch (phase) {
      case 'Inhale':
        return 'scale-125 transition-transform duration-[4000ms] ease-out';
      case 'Hold':
        return 'scale-125';
      case 'Exhale':
        return 'scale-75 transition-transform duration-[4000ms] ease-in';
      case 'Rest':
        return 'scale-75';
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'Inhale':
        return 'Breathe in slowly through your nose';
      case 'Hold':
        return 'Keep lungs gently full and still';
      case 'Exhale':
        return 'Release tension softly through mouth';
      case 'Rest':
        return 'Stay relaxed in peaceful emptiness';
    }
  };

  return (
    <div className="w-full flex flex-col justify-between px-6 pt-6 pb-6 relative" data-purpose="mobile-clay-container">
      {/* Header */}
      <header className="w-full flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => {
            audioEngine.playHapticClick(260);
            setIsActive(false);
            onBack();
          }}
          className="w-11 h-11 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="px-4 py-2 rounded-full clay-surface-sm flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#5fa5b8] shadow-[0_0_8px_#5fa5b8]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4d657d] text-subtle-debossed">
            Tactile Breath
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-11 h-11 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
          title="Reset breath session"
        >
          <RotateCcw className="w-4 h-4 stroke-[2]" />
        </button>
      </header>

      {/* Main Breathing Visualizer Canvas */}
      <section className="clay-surface rounded-3xl p-6 mb-5 flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden">
        {/* Soft background aura */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-[#99c9d6] to-[#d6ebf7] blur-3xl animate-clay-pulse" />
        </div>

        {/* Ambient Ring */}
        <div className="relative flex items-center justify-center w-52 h-52">
          {/* Outer clay guide ring */}
          <div className="absolute inset-0 rounded-full clay-inset border border-white/30" />

          {/* Dynamic Breathing Clay Orb */}
          <div
            className={`w-36 h-36 rounded-full clay-surface flex flex-col items-center justify-center relative shadow-2xl z-10 ${getSphereScale()}`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#68b9cc] to-[#458897] shadow-inner flex items-center justify-center text-white mb-1">
              <Wind className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-sm font-extrabold text-[#32495d] text-debossed uppercase tracking-wider">
              {phase}
            </span>
            <span className="text-xs font-mono font-bold text-[#5fa5b8]">
              {secondsLeft}s
            </span>
          </div>
        </div>

        {/* Phase Guidance text */}
        <div className="mt-6 text-center z-10">
          <p className="text-xs font-bold text-[#3d5569] text-debossed">
            {getPhaseInstruction()}
          </p>
          <p className="text-[11px] text-[#6d8396] font-medium mt-1">
            Box Breathing 4-4-4-4 · {completedCycles} full cycles completed
          </p>
        </div>
      </section>

      {/* Controls & Session Length */}
      <section className="space-y-3.5 mb-5">
        <button
          type="button"
          onClick={handleToggle}
          className="w-full py-4 px-6 rounded-2xl clay-button-cyan font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-white stroke-white" />
              <span>Pause Breathing Flow</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white stroke-white translate-x-0.5" />
              <span>Begin Guided Session</span>
            </>
          )}
        </button>

        {/* Session Length Pills */}
        <div className="clay-surface-sm rounded-2xl p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-[#455c70] text-subtle-debossed px-1">
            Target Duration:
          </span>
          <div className="flex gap-1.5">
            {[1, 3, 5, 10].map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => {
                  audioEngine.playHapticClick(350);
                  setTargetMinutes(min);
                }}
                className={`py-1 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  targetMinutes === min
                    ? 'clay-badge-active'
                    : 'clay-card-pill text-[#4b6377]'
                }`}
              >
                {min}m
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* iOS Home Indicator */}
      <div className="w-32 h-1.5 rounded-full clay-inset mx-auto mt-2" />
    </div>
  );
};
