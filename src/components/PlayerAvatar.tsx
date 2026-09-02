import React, { useState } from 'react';
import { getPlayerPhotoUrl } from '../utils/playerPhotos';
import { getTeamLogoUrl, DEFAULT_TEAM_LOGO } from '../utils/teamLogos';

interface PlayerAvatarProps {
  name: string;
  photoUrl?: string;
  team?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTeamBadge?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  photoUrl,
  team,
  size = 'md',
  className = '',
  showTeamBadge = false,
}) => {
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [teamLogoFailed, setTeamLogoFailed] = useState(false);

  // Reset index if name or photoUrl changes
  React.useEffect(() => {
    setCandidateIdx(0);
    setTeamLogoFailed(false);
  }, [name, photoUrl, team]);

  const curated = getPlayerPhotoUrl(name);
  const candidates: string[] = [];
  if (curated) candidates.push(curated);
  if (photoUrl && photoUrl !== curated) candidates.push(photoUrl);

  const currentPhoto = candidates[candidateIdx];
  const hasImage = Boolean(currentPhoto);
  const initials = getInitials(name || 'P');
  const teamLogo = team ? getTeamLogoUrl(team) : '';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-9 h-9 sm:w-10 sm:h-10 text-xs',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl',
  };

  const badgeSizes = {
    xs: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    sm: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
    md: 'w-4 h-4 -bottom-0.5 -right-0.5',
    lg: 'w-5 h-5 bottom-0 right-0',
    xl: 'w-6 h-6 bottom-0 right-0',
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-black transition-transform duration-200 border-2 ${
          hasImage
            ? 'border-yellow-400 bg-slate-900 shadow-xs'
            : teamLogo && !teamLogoFailed
            ? 'border-yellow-400 bg-white p-1 shadow-xs'
            : 'border-yellow-400 bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 text-black shadow-xs'
        }`}
      >
        {hasImage ? (
          <img
            src={currentPhoto}
            alt={name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => {
              setCandidateIdx((prev) => prev + 1);
            }}
          />
        ) : teamLogo && !teamLogoFailed ? (
          <img
            src={teamLogo}
            alt={team || name}
            className="w-full h-full object-contain p-0.5"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => {
              setTeamLogoFailed(true);
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showTeamBadge && hasImage && team && (
        <div
          className={`absolute ${badgeSizes[size]} bg-white rounded-full p-0.5 border border-slate-300 shadow-sm flex items-center justify-center`}
        >
          <img
            src={getTeamLogoUrl(team)}
            alt={team}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_TEAM_LOGO;
            }}
          />
        </div>
      )}
    </div>
  );
};
