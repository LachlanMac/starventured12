import React from 'react';

interface TalentDisplayProps {
  talent: number;
  maxTalent?: number;
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Component to display talent stars
const TalentDisplay: React.FC<TalentDisplayProps> = ({ 
  talent, 
  maxTalent = 3, 
  showNumber = false,
  size = 'md'
}) => {
  // Get star size based on the size prop
  const getStarSize = () => {
    switch (size) {
      case 'sm': return '0.75rem';
      case 'lg': return '1.25rem';
      default: return '1rem';
    }
  };

  const starSize = getStarSize();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      {showNumber && (
        <span style={{ 
          color: 'var(--color-cloud)',
          fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
          marginRight: '0.25rem'
        }}>
          {talent}
        </span>
      )}
      
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {Array.from({ length: maxTalent }).map((_, i) => (
          <div
            key={i}
            style={{
              width: starSize,
              height: starSize,
              borderRadius: '50%',
              backgroundColor: i < talent ? 'var(--color-metal-gold)' : 'var(--color-dark-elevated)',
              border: '1px solid var(--color-metal-gold)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TalentDisplay;