import React, { useState, useEffect, useRef } from 'react';
import { ClayAvatar } from './ClayAvatar';
import { audioEngine } from '../utils/audioEngine';
import { Play, Pause, Volume2, Radio, Compass, Sparkles, ChevronRight, Waves, RotateCcw } from 'lucide-react';

interface DashboardScreenProps {
  userEmail: string;
  onSignOut: () => void;
  onOpenStudio: () => void;
  onOpenMindfulness: () => void;
}

interface SoundscapeTrack {
  id: string;
  title: string;
  category: string;
  frequency: string;
  description: string;
  accent: string;
}

const SOUNDSCAPES: SoundscapeTrack[] = [
  {
    id: 'deep-orbit',
    title: 'Deep Orbit 432Hz',
    category: 'Cosmic Meditation',
    frequency: '432 Hz Pure Resonance',
    description: 'Harmonic sine drones tuned to universal natural frequency for deep rest.',
    accent: '#5fa5b8',
  },
  {
    id: 'binaural-theta',
    title: 'Theta Mindwave 6Hz',
    category: 'Cognitive Flow',
    frequency: '6.0 Hz Binaural Beat',
    description: 'Stereo frequency delta inducing lucid theta brainwaves and deep focus.',
    accent: '#4bb390',
  },
  {
    id: 'gentle-rain',
    title: 'Rain & Lo-Fi Clay',
    category: 'Atmospheric Relax',
    frequency: 'Organic Pink Spectrum',
    description: 'Synthesized gentle rainfall with acoustic filtering to mask distractions.',
    accent: '#557e9b',
  },
  {
    id: 'forest-whispers',
    title: 'Forest Whispers',
    category: 'Nature & Zen',
    frequency: 'Pentatonic Chime Garden',
    description: 'Ethereal wind textures with sporadic warm bamboo meditation bells.',
    accent: '#839e78',
  },
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userEmail,
  onSignOut,
  onOpenStudio,
  onOpenMindfulness,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SoundscapeTrack>(SOUNDSCAPES[0]);
  const [volume, setVolume] = useState(75);
  const [spatialPan, setSpatialPan] = useState(0); // -1 to 1
  const [binauralFreq, setBinauralFreq] = useState(6);
  const [sessionMinutes, setSessionMinutes] = useState(18);
  const [waveformBars, setWaveformBars] = useState<number[]>([40, 65, 30, 85, 55, 90, 45, 70, 35, 60]);

  // Audio waveform animation loop
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const interval = setInterval(() => {
        setWaveformBars(prev =>
          prev.map(() => Math.floor(Math.random() * 65) + 25)
        );
      }, 140);
      return () => clearInterval(interval);
    } else {
      setWaveformBars([20, 25, 20, 30, 20, 25, 20, 20, 25, 20]);
    }
  }, [isPlaying]);

  // Audio pan updates
  const handlePanChange = (panVal: number) => {
    setSpatialPan(panVal);
    audioEngine.setSpatialPan(panVal);
  };

  // Toggle soundscape
  const handleTogglePlay = () => {
    audioEngine.playHapticClick(isPlaying ? 280 : 480);
    if (isPlaying) {
      audioEngine.stopSoundscape();
      setIsPlaying(false);
    } else {
      audioEngine.playSoundscape(currentTrack.id, binauralFreq);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (track: SoundscapeTrack) => {
    audioEngine.playHapticClick(380);
    setCurrentTrack(track);
    if (isPlaying) {
      audioEngine.playSoundscape(track.id, binauralFreq);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol / 100);
  };

  const handleBinauralShift = (freq: number) => {
    audioEngine.playHapticClick(420);
    setBinauralFreq(freq);
    if (isPlaying && currentTrack.id === 'binaural-theta') {
      audioEngine.playSoundscape('binaural-theta', freq);
    }
  };

  return (
    <div className="w-full flex flex-col justify-between px-6 pt-6 pb-6 relative" data-purpose="mobile-clay-container">
      {/* Top Status Bar & App Navigation Header */}
      <header className="w-full flex items-center justify-between mb-5" data-purpose="top-navigation">
        {/* Back / Sign Out Button */}
        <button
          type="button"
          onClick={() => {
            audioEngine.playHapticClick(260);
            if (isPlaying) audioEngine.stopSoundscape();
            onSignOut();
          }}
          aria-label="Sign out or go back"
          className="w-11 h-11 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
        >
          <svg
            className="w-5 h-5 stroke-[2.5]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Pill App Logo/Badge */}
        <div className="px-4 py-2 rounded-full clay-surface-sm flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isPlaying ? 'bg-[#4bb390] shadow-[0_0_10px_#4bb390] animate-pulse' : 'bg-[#52a6ba] shadow-[0_0_8px_#52a6ba]'
            }`}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4d657d] text-subtle-debossed">
            {isPlaying ? 'Aether Streaming' : 'Aether Space'}
          </span>
        </div>

        {/* Quick User Avatar Pip */}
        <button
          type="button"
          onClick={() => audioEngine.playHapticClick(340)}
          className="w-11 h-11 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer p-1"
          title={userEmail}
        >
          <ClayAvatar size="sm" isOnline={isPlaying} />
        </button>
      </header>

      {/* BEGIN: Hero Soundscape Player Card */}
      <section className="clay-surface rounded-3xl p-5 mb-5 relative overflow-hidden" data-purpose="now-playing-banner">
        {/* Embossed Highlight Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <ClayAvatar size="md" isOnline={isPlaying} isAnimated={isPlaying} />
            {isPlaying && (
              <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-white/50 animate-ping opacity-30" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full clay-tag mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a97a8]" />
              <span className="text-[10px] font-bold text-[#355b66] uppercase tracking-wide truncate">
                {currentTrack.category}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-debossed leading-tight truncate">
              {currentTrack.title}
            </h2>
            <p className="text-[11px] text-subtle-debossed font-medium mt-0.5 truncate">
              {currentTrack.frequency}
            </p>
          </div>
        </div>

        {/* Tactile Waveform Bars */}
        <div className="clay-inset rounded-2xl p-3.5 mb-4 flex items-center justify-between gap-1.5 h-14">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-150 ease-out"
              style={{
                height: `${height}%`,
                backgroundColor: isPlaying ? '#5fa5b8' : '#889ba9',
                boxShadow: isPlaying ? '0 0 6px rgba(95, 165, 184, 0.4)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Primary Play Button & Main Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="flex-1 py-3.5 px-6 rounded-2xl clay-button-cyan font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white stroke-white" />
                <span>Pause Ambient Sound</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white stroke-white translate-x-0.5" />
                <span>Stream Spatial Audio</span>
              </>
            )}
          </button>

          {/* Quick Studio Trigger */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playHapticClick(400);
              onOpenStudio();
            }}
            className="w-12 h-12 rounded-2xl clay-card-pill flex items-center justify-center text-[#425b70] cursor-pointer"
            title="Open Interactive Sound Studio"
          >
            <Sparkles className="w-5 h-5 text-[#5fa5b8]" />
          </button>
        </div>
      </section>
      {/* END: Hero Soundscape Player Card */}

      {/* BEGIN: Spatial Panner & Field Control */}
      <section className="clay-surface-sm rounded-3xl p-4 mb-5" data-purpose="spatial-field-control">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#5fa5b8]" />
            <span className="text-xs font-bold text-[#3d5368] text-debossed">Binaural 3D Spatial Pan</span>
          </div>
          <span className="text-[11px] font-bold text-[#62778a]">
            {spatialPan === 0 ? 'Surround Center' : spatialPan < 0 ? `${Math.round(Math.abs(spatialPan) * 100)}% Left` : `${Math.round(spatialPan * 100)}% Right`}
          </span>
        </div>

        {/* 2D Spatial Positioning Circle */}
        <div className="clay-inset rounded-2xl p-4 flex flex-col items-center justify-center relative">
          <div className="w-full flex items-center justify-between text-[10px] font-bold text-[#718596] uppercase mb-2 px-2">
            <span>Ear Left</span>
            <span>Surround Balance</span>
            <span>Ear Right</span>
          </div>

          <div className="w-full relative py-2">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={spatialPan}
              onChange={(e) => handlePanChange(parseFloat(e.target.value))}
              className="clay-range w-full cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => handlePanChange(-0.8)}
              className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                spatialPan < -0.3 ? 'clay-badge-active' : 'clay-card-pill text-[#546b7e]'
              }`}
            >
              Left Focus
            </button>
            <button
              onClick={() => handlePanChange(0)}
              className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                spatialPan === 0 ? 'clay-badge-active' : 'clay-card-pill text-[#546b7e]'
              }`}
            >
              Center Binaural
            </button>
            <button
              onClick={() => handlePanChange(0.8)}
              className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                spatialPan > 0.3 ? 'clay-badge-active' : 'clay-card-pill text-[#546b7e]'
              }`}
            >
              Right Focus
            </button>
          </div>
        </div>

        {/* Master Tactile Volume Slider */}
        <div className="mt-4 pt-3 border-t border-[#aab9c7]/40 flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-[#5c7285] shrink-0" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="clay-range flex-1"
          />
          <span className="text-xs font-bold text-[#445b6f] w-8 text-right tabular-nums">
            {volume}%
          </span>
        </div>
      </section>
      {/* END: Spatial Panner & Field Control */}

      {/* BEGIN: Soundscape Selection Pills */}
      <section className="space-y-2.5 mb-5" data-purpose="soundscape-list">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#43596d] text-subtle-debossed uppercase tracking-wide">
            Curated Tactile Soundscapes
          </span>
          <span className="text-[11px] font-semibold text-[#5fa5b8]">4 Synthesized</span>
        </div>

        {SOUNDSCAPES.map((track) => {
          const isSelected = currentTrack.id === track.id;
          return (
            <button
              key={track.id}
              onClick={() => handleSelectTrack(track)}
              type="button"
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between group cursor-pointer transition-all ${
                isSelected ? 'clay-surface border border-white/40' : 'clay-card-pill'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isSelected ? 'clay-badge-active' : 'clay-badge text-[#4f677b]'
                  }`}
                >
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#364b5f] text-debossed">
                    {track.title}
                  </div>
                  <div className="text-[11px] text-[#6a8094] line-clamp-1">
                    {track.description}
                  </div>
                </div>
              </div>

              <div className="w-7 h-7 rounded-lg clay-badge flex items-center justify-center text-[#5c7287] shrink-0">
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </button>
          );
        })}
      </section>
      {/* END: Soundscape Selection Pills */}

      {/* Quick Navigation to Interactive Tools */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => {
            audioEngine.playHapticClick(450);
            onOpenStudio();
          }}
          className="p-3.5 rounded-2xl clay-card-pill flex flex-col items-center text-center gap-1.5 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl clay-badge flex items-center justify-center text-[#4bb390]">
            <Waves className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#354c5e] text-debossed">Chime Studio</span>
          <span className="text-[10px] text-[#6d8294]">Interactive Bowls</span>
        </button>

        <button
          onClick={() => {
            audioEngine.playHapticClick(420);
            onOpenMindfulness();
          }}
          className="p-3.5 rounded-2xl clay-card-pill flex flex-col items-center text-center gap-1.5 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl clay-badge flex items-center justify-center text-[#5fa5b8]">
            <RotateCcw className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#354c5e] text-debossed">Tactile Breath</span>
          <span className="text-[10px] text-[#6d8294]">Guided Relaxation</span>
        </button>
      </div>

      {/* Soft iOS Home Indicator */}
      <div className="w-32 h-1.5 rounded-full clay-inset mx-auto mt-2" />
    </div>
  );
};
