import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody } from '../../ui/Card';
import Button from '../../ui/Button';
import CharacterPortraitUploader from '../CharacterPortraitUploader';

interface CharacterHeaderProps {
  character: {
    _id: string;
    name: string;
    race: string;
    level: number;
    portraitUrl?: string | null;
  };
  onDelete: () => void;
}

const CharacterHeader: React.FC<CharacterHeaderProps> = ({ character, onDelete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(character.portraitUrl || null);

  const handlePortraitChange = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('portrait', file);
      
      // Upload portrait
      const response = await fetch(`/api/portraits/${character._id}/portrait`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload portrait');
      }
      
      const data = await response.json();
      
      // Update portrait URL
      setPortraitUrl(data.portraitUrl);
    } catch (error) {
      console.error('Error uploading portrait:', error);
      alert('Failed to upload portrait. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card variant="elevated">
      <CardBody>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          className="md:flex-row md:items-center"
        >
          {/* Portrait section */}
          <div className="flex justify-center md:justify-start">
            <CharacterPortraitUploader
              currentPortrait={portraitUrl}
              onPortraitChange={handlePortraitChange}
              size="medium"
            />
          </div>

          {/* Character info */}
          <div className="flex-1">
            <h1
              style={{
                color: 'var(--color-white)',
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                fontWeight: 'bold',
              }}
            >
              {character.name}
            </h1>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span
                style={{
                  backgroundColor: 'var(--color-sat-purple-faded)',
                  color: 'var(--color-white)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                }}
              >
                {character.race}
              </span>
              <span
                style={{
                  backgroundColor: 'var(--color-sat-purple-faded)',
                  color: 'var(--color-white)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                }}
              >
                Level {character.level}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 justify-center md:justify-end">
            <Link to={`/characters/${character._id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button variant="outline" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CharacterHeader;