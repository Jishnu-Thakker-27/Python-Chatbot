import React, { useState } from 'react';
import { ClayAvatar } from './ClayAvatar';
import { audioEngine } from '../utils/audioEngine';
import { ChevronLeft, Sliders, Shield, Volume2, LogOut, Check } from 'lucide-react';

interface ProfileScreenProps {
  userEmail: string;
  onBack: () => void;
  onSignOut: () => void;
}

const HEADPHONE_COLORS = [
  { name: 'Slate Teal', color: '#517188' },
  { name: 'Pine Mint', color: '#4bb390' },
  { name: 'Warm Terracotta', color: '#cb7166' },
  { name: 'Sun Amber', color: '#c49c58' },
];

const HAIR_COLORS = [
  { name: 'Deep Navy', color: '#364958' },
  { name: 'Chestnut', color: '#563e32' },
  { name: 'Caramel', color: '#8f683a' },
  { name: 'Frost Silver', color: '#8898a8' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userEmail,
  onBack,
  onSignOut,
}) => {
  const [headphoneColor, setHeadphoneColor] = useState('#517188');
  const [hairColor, setHairColor] = useState('#364958');
  const [spatialAudioEnabled, setSpatialAudioEnabled] = useState(true);
  const [hapticSoundsEnabled, setHapticSoundsEnabled] = useState(true);
  const [binauralSync, setBinauralSync] = useState(true);

  const toggleSpatial = () => {
    audioEngine.playToggle(!spatialAudioEnabled);
    setSpatialAudioEnabled(!spatialAudioEnabled);
  };

  const toggleHaptic = () => {
    audioEngine.playToggle(!hapticSoundsEnabled);
    setHapticSoundsEnabled(!hapticSoundsEnabled);
  };

  const toggleBinaural = () => {
    audioEngine.playToggle(!binauralSync);
    setBinauralSync(!binauralSync);
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
          <div className="w-2.5 h-2.5 rounded-full bg-[#5fa5b8] shadow-[0_0_8px_#5fa5b8]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4d657d] text-subtle-debossed">
            Tactile Profile
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            audioEngine.playHapticClick(260);
            onSignOut();
          }}
          className="w-11 h-11 rounded-2xl clay-surface-sm flex items-center justify-center text-rose-600 active:scale-95 transition-transform cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 stroke-[2]" />
        </button>
      </header>

      {/* Profile & Avatar Customizer Hero */}
      <section className="clay-surface rounded-3xl p-5 mb-5 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-4">
          <ClayAvatar
            size="lg"
            headphoneColor={headphoneColor}
            hairColor={hairColor}
            isOnline={true}
          />
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full clay-tag mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4bb390]" />
              <span className="text-[10px] font-bold text-[#355b66] uppercase tracking-wide">
                Spatial Member
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-debossed leading-tight truncate">
              {userEmail.split('@')[0]}
            </h2>
            <p className="text-[11px] text-subtle-debossed font-medium truncate">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Headphone Color Picker */}
        <div className="clay-inset rounded-2xl p-3 mb-3">
          <span className="block text-[10px] font-bold text-[#556d81] uppercase tracking-wider mb-2">
            Clay Headphone Finish
          </span>
          <div className="flex gap-2">
            {HEADPHONE_COLORS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  audioEngine.playHapticClick(400);
                  setHeadphoneColor(item.color);
                }}
                className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  headphoneColor === item.color
                    ? 'clay-badge-active'
                    : 'clay-card-pill text-[#465f74]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hair Tone Picker */}
        <div className="clay-inset rounded-2xl p-3">
          <span className="block text-[10px] font-bold text-[#556d81] uppercase tracking-wider mb-2">
            Tactile Character Hair
          </span>
          <div className="flex gap-2">
            {HAIR_COLORS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  audioEngine.playHapticClick(420);
                  setHairColor(item.color);
                }}
                className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  hairColor === item.color
                    ? 'clay-badge-active'
                    : 'clay-card-pill text-[#465f74]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Audio Engine Toggles */}
      <section className="space-y-3 mb-5">
        <span className="block text-xs font-bold text-[#43596d] text-subtle-debossed uppercase tracking-wide px-1">
          Acoustic Preferences
        </span>

        {/* Spatial Audio Toggle */}
        <div className="p-3.5 rounded-2xl clay-card-pill flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#32495d] text-debossed">
              Binaural 3D Spatial Rendering
            </div>
            <div className="text-[10px] text-[#6d8396]">
              Real-time Web Audio stereo panning engine
            </div>
          </div>
          <button
            type="button"
            onClick={toggleSpatial}
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer p-0.5 ${
              spatialAudioEnabled ? 'bg-[#5fa5b8]' : 'bg-[#98aab8]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                spatialAudioEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Haptic Click Audio Toggle */}
        <div className="p-3.5 rounded-2xl clay-card-pill flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#32495d] text-debossed">
              Tactile Button Audio Clicks
            </div>
            <div className="text-[10px] text-[#6d8396]">
              Organic lowpass acoustic feedback pops
            </div>
          </div>
          <button
            type="button"
            onClick={toggleHaptic}
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer p-0.5 ${
              hapticSoundsEnabled ? 'bg-[#5fa5b8]' : 'bg-[#98aab8]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                hapticSoundsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Binaural Sync Toggle */}
        <div className="p-3.5 rounded-2xl clay-card-pill flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#32495d] text-debossed">
              432Hz Harmonic Frequency Lock
            </div>
            <div className="text-[10px] text-[#6d8396]">
              Calibrate soundscapes to natural mathematical intervals
            </div>
          </div>
          <button
            type="button"
            onClick={toggleBinaural}
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer p-0.5 ${
              binauralSync ? 'bg-[#5fa5b8]' : 'bg-[#98aab8]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                binauralSync ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Sign Out Action Button */}
      <button
        type="button"
        onClick={() => {
          audioEngine.playHapticClick(280);
          onSignOut();
        }}
        className="w-full py-3.5 rounded-2xl clay-card-pill font-bold text-xs text-rose-600 flex items-center justify-center gap-2 cursor-pointer mb-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out to Entry Portal</span>
      </button>

      {/* iOS Home Bar */}
      <div className="w-32 h-1.5 rounded-full clay-inset mx-auto mt-2" />
    </div>
  );
};
