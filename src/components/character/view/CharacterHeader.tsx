import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody } from '../../ui/Card';
import Button from '../../ui/Button';

interface CharacterHeaderProps {
  character: {
    _id: string;
    name: string;
    race: string;
    level: number;
  };
  onDelete: () => void;
}

const CharacterHeader: React.FC<CharacterHeaderProps> = ({ character, onDelete }) => {
  return (
    <Card variant="elevated">
      <CardBody>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          className="md:flex-row md:justify-between md:items-center"
        >
          <div>
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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