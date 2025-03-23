import React from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import TalentDisplay from '../TalentDisplay';

interface Character {
  attributes: {
    physique: number;
    agility: number;
    mind: number;
    knowledge: number;
    social: number;
  };
  resources: {
    health: { current: number; max: number };
    stamina: { current: number; max: number };
    resolve: { current: number; max: number };
  };
  languages: string[];
  stances: string[];
  modulePoints: {
    total: number;
    spent: number;
  };
  movement: number;
  weaponSkills: {
    rangedWeapons: { talent: number };
  };
}

interface InfoTabProps {
  character: Character;
  derivedStats: {
    initiative: number;
  };
}

// Helper function to render stat bars
const renderStatBar = (value: number, max: number, color: string = 'var(--color-sat-purple)') => {
  const percentage = (value / max) * 100;
  return (
    <div
      style={{
        position: 'relative',
        height: '0.75rem',
        backgroundColor: 'var(--color-dark-elevated)',
        borderRadius: '0.375rem',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: color,
          borderRadius: '0.375rem',
        }}
      />
    </div>
  );
};

const InfoTab: React.FC<InfoTabProps> = ({ character, derivedStats }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <Card variant="default">
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Attributes
          </h2>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(character.attributes).map(([key, value]) => (
              <div key={key}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span style={{ color: 'var(--color-cloud)' }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                      {value}
                    </span>
                    <TalentDisplay talent={value} maxTalent={3} size="sm" />
                  </div>
                </div>
                {renderStatBar(value, 3)}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card variant="default">
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Character Details
          </h2>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                Initiative
              </div>
              <div style={{ color: 'var(--color-white)' }}>
                {derivedStats.initiative}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                Movement
              </div>
              <div style={{ color: 'var(--color-white)' }}>
                {character.movement} Units
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                Module Points
              </div>
              <div style={{ color: 'var(--color-white)' }}>
                {character.modulePoints.total - character.modulePoints.spent} / {character.modulePoints.total} (Available/Total)
              </div>
            </div>

            {character.languages && character.languages.length > 0 && (
              <div>
                <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                  Languages
                </div>
                <div style={{ color: 'var(--color-white)' }}>
                  {character.languages.join(', ')}
                </div>
              </div>
            )}

            {character.stances && character.stances.length > 0 && (
              <div>
                <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                  Stances
                </div>
                <div style={{ color: 'var(--color-white)' }}>
                  {character.stances.join(', ')}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card variant="default" style={{ gridColumn: 'span 2' }}>
        <CardHeader>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Dice & Talent System
          </h2>
        </CardHeader>
        <CardBody>
          <p
            style={{
              color: 'var(--color-cloud)',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            For skill checks, you roll a number of dice determined by your Talent stars. For
            attribute skills, you roll a number of dice equal to your attribute value. For
            specialized skills like Weapon and Crafting skills, you roll dice based on the
            talent value assigned to that skill.
          </p>

          <div
            style={{
              backgroundColor: 'var(--color-dark-elevated)',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                color: 'var(--color-white)',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              Examples:
            </div>
            <ul
              style={{
                color: 'var(--color-cloud)',
                fontSize: '0.875rem',
                paddingLeft: '1.5rem',
              }}
            >
              <li style={{ marginBottom: '0.5rem' }}>
                A character with Physique {character.attributes.physique} and Fitness skill (1d6) would roll {character.attributes.physique}d6 for
                Fitness checks.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                A character with Ranged Weapons skill (1d8) and {character.weaponSkills.rangedWeapons.talent} talent stars would roll {character.weaponSkills.rangedWeapons.talent}d8 for Ranged Weapon attacks.
              </li>
              <li>
                A character with Knowledge {character.attributes.knowledge} and Science skill (1d10) would roll {character.attributes.knowledge}d10 for
                Science checks.
              </li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default InfoTab;