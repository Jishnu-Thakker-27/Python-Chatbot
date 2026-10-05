import React from 'react';

interface ClayAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  headphoneColor?: string;
  hairColor?: string;
  isOnline?: boolean;
  isAnimated?: boolean;
  className?: string;
}

export const ClayAvatar: React.FC<ClayAvatarProps> = ({
  size = 'md',
  headphoneColor = '#517188',
  hairColor = '#364958',
  isOnline = true,
  isAnimated = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  }[size];

  const faceScale = {
    sm: 'scale-75',
    md: 'scale-100',
    lg: 'scale-125',
  }[size];

  return (
    <div className={`relative flex-shrink-0 ${className}`} data-purpose="3d-avatar">
      <div
        className={`${sizeClasses} rounded-2xl clay-surface-sm p-1.5 flex items-center justify-center overflow-hidden border border-white/40 transition-transform ${
          isAnimated ? 'hover:scale-105' : ''
        }`}
      >
        {/* Stylized Clay Face Artwork */}
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#8faec2] to-[#607e94] flex items-center justify-center relative shadow-inner">
          {/* Character Head */}
          <div
            className={`w-12 h-12 rounded-full bg-[#f3d2be] relative shadow-md flex items-center justify-center ${faceScale} transition-transform`}
          >
            {/* Hair */}
            <div
              className="absolute -top-1.5 w-11 h-6 rounded-t-full transition-colors"
              style={{ backgroundColor: hairColor }}
            />

            {/* Cheerful Eyes */}
            <div className="w-7 flex justify-between z-10 pt-1">
              <div className="w-1.5 h-1.5 bg-[#2c3d4a] rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
              <div className="w-1.5 h-1.5 bg-[#2c3d4a] rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
            </div>

            {/* Soft Smile */}
            <div className="absolute bottom-2.5 w-3 h-1.5 border-b-2 border-[#2c3d4a] rounded-full" />

            {/* Clay Headphone Arc */}
            <div
              className="absolute -top-2.5 w-14 h-9 border-t-4 rounded-full pointer-events-none transition-colors"
              style={{ borderColor: headphoneColor }}
            />

            {/* Clay Headphone Pads */}
            <div
              className="absolute -left-1.5 w-3 h-6 rounded-full shadow-sm transition-colors"
              style={{ backgroundColor: headphoneColor }}
            />
            <div
              className="absolute -right-1.5 w-3 h-6 rounded-full shadow-sm transition-colors"
              style={{ backgroundColor: headphoneColor }}
            />
          </div>
        </div>
      </div>

      {/* Online / Active Tactile Pip */}
      {isOnline && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full clay-badge flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4bb390] shadow-[0_0_6px_#4bb390]" />
        </div>
      )}
    </div>
  );
};
