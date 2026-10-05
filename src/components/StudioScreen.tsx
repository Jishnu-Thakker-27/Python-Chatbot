import React, { useState } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { ChevronLeft, Disc, Volume2, Sparkles, RefreshCw, Play, Square } from 'lucide-react';

interface StudioScreenProps {
  onBack: () => void;
}

interface HarmonicPad {
  note: string;
  name: string;
  freq: number;
  color: string;
  chakra: string;
}

const HARMONIC_PADS: HarmonicPad[] = [
  { note: 'C4', name: 'Root Earth', freq: 261.63, color: '#b56d6d', chakra: 'Grounded' },
  { note: 'D4', name: 'Sacral Tide', freq: 293.66, color: '#b58b62', chakra: 'Creative' },
  { note: 'E4', name: 'Solar Core', freq: 329.63, color: '#a89c56', chakra: 'Vitality' },
  { note: 'G4', name: 'Throat Sky', freq: 392.00, color: '#5b98a3', chakra: 'Expression' },
  { note: 'A4', name: '432 Hz Pure', freq: 432.00, color: '#4c9380', chakra: 'Harmony' },
  { note: '528', name: 'Miracle Tone', freq: 528.00, color: '#5778a8', chakra: 'Clarity' },
];

export const StudioScreen: React.FC<StudioScreenProps> = ({ onBack }) => {
  const [activePad, setActivePad] = useState<number | null>(null);
  const [recordedNotes, setRecordedNotes] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

  const handlePadTap = (pad: HarmonicPad, index: number) => {
    setActivePad(index);
    audioEngine.playChime(pad.freq, 2.2);

    if (isRecording) {
      setRecordedNotes((prev) => [...prev, pad.freq]);
    }

    setTimeout(() => {
      setActivePad((curr) => (curr === index ? null : curr));
    }, 300);
  };

  const handlePlayback = () => {
    if (recordedNotes.length === 0) return;
    setIsPlayingBack(true);
    audioEngine.playHapticClick(450);

    recordedNotes.forEach((freq, idx) => {
      setTimeout(() => {
        audioEngine.playChime(freq, 2.0);
        if (idx === recordedNotes.length - 1) {
          setTimeout(() => setIsPlayingBack(false), 2000);
        }
      }, idx * 600);
    });
  };

  const handleClear = () => {
    audioEngine.playHapticClick(280);
    setRecordedNotes([]);
    setIsRecording(false);
  };

  const handlePlayPreset = (presetFreqs: number[]) => {
    audioEngine.playHapticClick(420);
    setRecordedNotes(presetFreqs);
    presetFreqs.forEach((freq, idx) => {
      setTimeout(() => {
        audioEngine.playChime(freq, 2.0);
      }, idx * 500);
    });
  };

  return (
    <div className="w-full flex flex-col justify-between px-6 pt-6 pb-6 relative" data-purpose="mobile-clay-container">
      {/* Header */}
      <header className="w-full flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => {
            audioEngine.playHapticClick(260);
            onBack();
          }}
          className="w-11 h-11 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="px-4 py-2 rounded-full clay-surface-sm flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4bb390] shadow-[0_0_8px_#4bb390]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4d657d] text-subtle-debossed">
            Chime Studio
          </span>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="w-11 h-11 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
          title="Clear sequence"
        >
          <RefreshCw className="w-4 h-4 stroke-[2]" />
        </button>
      </header>

      {/* Hero Studio Banner */}
      <section className="clay-surface rounded-3xl p-5 mb-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full clay-tag">
            <Sparkles className="w-3 h-3 text-[#355b66]" />
            <span className="text-[10px] font-bold text-[#355b66] uppercase tracking-wide">
              Harmonic Resonance
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#62778a]">
            {recordedNotes.length} Notes Recorded
          </span>
        </div>
        <h2 className="text-lg font-extrabold text-debossed leading-tight">
          Tactile Singing Bowls
        </h2>
        <p className="text-xs text-subtle-debossed font-medium mt-0.5">
          Tap each clay stone to synthesize acoustic bell resonance in real-time.
        </p>

        {/* Melody recorder toolbar */}
        <div className="flex items-center gap-2.5 mt-4">
          <button
            onClick={() => {
              audioEngine.playHapticClick(isRecording ? 300 : 500);
              setIsRecording(!isRecording);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-500 text-white shadow-md animate-pulse'
                : 'clay-card-pill text-[#3d5367]'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-white' : 'bg-rose-500'}`} />
            <span>{isRecording ? 'Recording...' : 'Record Sequence'}</span>
          </button>

          <button
            onClick={handlePlayback}
            disabled={recordedNotes.length === 0 || isPlayingBack}
            className="flex-1 py-2.5 px-3 rounded-xl clay-button-cyan font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPlayingBack ? 'Playing...' : 'Play Loop'}</span>
          </button>
        </div>
      </section>

      {/* 6 Tactile Harmonic Clay Stones */}
      <section className="grid grid-cols-2 gap-3.5 mb-5">
        {HARMONIC_PADS.map((pad, idx) => {
          const isPressed = activePad === idx;
          return (
            <button
              key={pad.name}
              type="button"
              onClick={() => handlePadTap(pad, idx)}
              className={`p-4 rounded-3xl flex flex-col justify-between h-28 text-left transition-all cursor-pointer select-none ${
                isPressed
                  ? 'clay-inset scale-95 border-2 border-[#5fa5b8]'
                  : 'clay-card-pill hover:scale-[1.02]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: pad.color }}
                />
                <span className="text-[10px] font-bold tracking-wider text-[#6c8294] uppercase">
                  {pad.chakra}
                </span>
              </div>

              <div>
                <div className="text-base font-extrabold text-[#32485c] text-debossed flex items-center justify-between">
                  <span>{pad.name}</span>
                  <span className="text-xs font-mono text-[#5fa5b8] font-bold">{pad.note}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#667d91] mt-0.5">
                  {pad.freq} Hz
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* Quick Harmonic Chords Presets */}
      <section className="clay-surface-sm rounded-2xl p-3.5 mb-4">
        <span className="block text-[11px] font-bold text-[#455c70] text-subtle-debossed uppercase tracking-wide mb-2.5 px-1">
          Preset Harmonic Flow
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => handlePlayPreset([261.63, 329.63, 392.0, 528.0])}
            className="flex-1 py-2 px-2.5 rounded-xl clay-card-pill text-[11px] font-bold text-[#3d5367] text-center cursor-pointer hover:text-[#1e2f3d]"
          >
            Peaceful Triad
          </button>
          <button
            onClick={() => handlePlayPreset([432.0, 528.0, 392.0, 329.63])}
            className="flex-1 py-2 px-2.5 rounded-xl clay-card-pill text-[11px] font-bold text-[#3d5367] text-center cursor-pointer hover:text-[#1e2f3d]"
          >
            432Hz Solfeggio
          </button>
          <button
            onClick={() => handlePlayPreset([293.66, 392.0, 432.0, 528.0])}
            className="flex-1 py-2 px-2.5 rounded-xl clay-card-pill text-[11px] font-bold text-[#3d5367] text-center cursor-pointer hover:text-[#1e2f3d]"
          >
            Evening Calm
          </button>
        </div>
      </section>

      {/* iOS Home Bar */}
      <div className="w-32 h-1.5 rounded-full clay-inset mx-auto mt-2" />
    </div>
  );
};
