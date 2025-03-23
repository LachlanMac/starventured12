import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import TalentDisplay from '../components/character/TalentDisplay';
import AttributeSkillsSection from '../components/character/AttributeSkillsSection';
import SpecializedSkillsSection from '../components/character/SpecializedSkillsSection';

// Define Character type with the new talent-based system
interface Action {
  name: string;
  description: string;
  type: 'Action' | 'Reaction' | 'Free Action';
  sourceModule: string;
  sourceModuleOption: string;
}

interface ModuleOption {
  id: number;
  name: string;
  description: string;
  mtype: string;
  location: string;
  cost: number;
  data: string;
  selected: boolean;
}

interface Trait {
  traitId: string;
  name: string;
  type: 'positive' | 'negative';
  description: string;
  dateAdded: string;
}

interface SkillData {
  value: number; // Dice type (1-6)
  talent: number; // Number of dice (0-3)
}

interface WeaponSkillData {
  value: number; // Dice type (1-6)
  talent: number; // Number of dice (0-3)
}

interface CraftingSkillData {
  value: number; // Dice type (1-6)
  talent: number; // Number of dice (0-3)
}

interface Character {
  _id: string;
  userId: string;
  name: string;
  race: string;
  attributes: {
    physique: number;
    agility: number;
    mind: number;
    knowledge: number;
    social: number;
  };
  traits: Trait[];
  skills: {
    fitness: SkillData;
    deflect: SkillData;
    might: SkillData;
    evade: SkillData;
    stealth: SkillData;
    coordination: SkillData;
    resilience: SkillData;
    concentration: SkillData;
    senses: SkillData;
    science: SkillData;
    technology: SkillData;
    medicine: SkillData;
    xenology: SkillData;
    negotiation: SkillData;
    behavior: SkillData;
    presence: SkillData;
  };
  weaponSkills: {
    rangedWeapons: WeaponSkillData;
    meleeWeapons: WeaponSkillData;
    weaponSystems: WeaponSkillData;
    heavyRangedWeapons: WeaponSkillData;
  };
  craftingSkills: {
    engineering: CraftingSkillData;
    fabrication: CraftingSkillData;
    biosculpting: CraftingSkillData;
    synthesis: CraftingSkillData;
  };
  resources: {
    health: { current: number; max: number };
    stamina: { current: number; max: number };
    resolve: { current: number; max: number };
  };
  languages: string[];
  stances: string[];
  physicalTraits: {
    size: string;
    weight: string;
    height: string;
    gender: string;
  };
  biography: string;
  appearance: string;
  actions: Action[];
  modules: any[]; // Simplified for this example
  level: number;
  experience: number;
  calculatedStats: {
    initiative: number;
    movement: number;
    dodge: number;
  };
  createdAt: string;
  updatedAt: string;
}

const CharacterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const justCreated = new URLSearchParams(location.search).get('created') === 'true';

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'info' | 'skills' | 'modules' | 'actions' | 'traits' | 'background'
  >('info');

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        // In a real app, this would call your API
        // const response = await fetch(`/api/characters/${id}`);

        // Mock data for development with the new talent-based system
        const mockCharacter: Character = {
          _id: id || '12345',
          userId: 'test-user-id',
          name: 'Zara Chen',
          race: 'Human',
          attributes: {
            physique: 2,
            agility: 3,
            mind: 2,
            knowledge: 1,
            social: 2,
          },
          traits:[],
          skills: {
            // Physique Skills
            fitness: { value: 2, talent: 0 },
            deflect: { value: 3, talent: 0 },
            might: { value: 2, talent: 0 },

            // Agility Skills
            evade: { value: 3, talent: 0 },
            stealth: { value: 4, talent: 0 },
            coordination: { value: 3, talent: 0 },

            // Mind Skills
            resilience: { value: 2, talent: 0 },
            concentration: { value: 3, talent: 0 },
            senses: { value: 4, talent: 0 },

            // Knowledge Skills
            science: { value: 2, talent: 0 },
            technology: { value: 1, talent: 0 },
            medicine: { value: 3, talent: 0 },
            xenology: { value: 2, talent: 0 },

            // Social Skills
            negotiation: { value: 2, talent: 0 },
            behavior: { value: 3, talent: 0 },
            presence: { value: 2, talent: 0 },
          },
          weaponSkills: {
            rangedWeapons: { value: 3, talent: 2 },
            meleeWeapons: { value: 2, talent: 1 },
            weaponSystems: { value: 1, talent: 0 },
            heavyRangedWeapons: { value: 2, talent: 0 },
          },
          craftingSkills: {
            engineering: { value: 1, talent: 1 },
            fabrication: { value: 2, talent: 1 },
            biosculpting: { value: 1, talent: 0 },
            synthesis: { value: 2, talent: 0 },
          },
          resources: {
            health: { current: 12, max: 12 },
            stamina: { current: 7, max: 7 },
            resolve: { current: 7, max: 7 },
          },
          languages: ['Common', 'Terran Standard'],
          stances: ['Defensive Stance'],
          physicalTraits: {
            size: 'Medium',
            weight: '165 lbs',
            height: '5\'9"',
            gender: 'Female',
          },
          biography:
            'Born on the lunar colony of New Armstrong, Zara always dreamed of exploring beyond the solar system. After graduating top of her class at the Galactic Academy, she joined the Stellar Exploration Corps and quickly rose through the ranks due to her exceptional navigation skills and cool head in crisis situations.',
          appearance:
            'Tall with an athletic build, short black hair with a silver streak, and piercing blue eyes. Usually seen wearing a customized navy blue flight suit with red detailing and a well-worn leather jacket adorned with mission patches.',
          actions: [
            {
              name: 'Quick Dodge',
              description: 'You can use your Dodge Modifier to Defend against Ray Attacks',
              type: 'Reaction',
              sourceModule: 'Acrobat',
              sourceModuleOption: 'Quick Dodge',
            },
            {
              name: 'Rolling Dodge',
              description:
                'Gain +1 Dodge until the start of your next turn. Each time you Dodge an Attack successfully, gain another +1 Dodge until the start of your next turn',
              type: 'Reaction',
              sourceModule: 'Acrobat',
              sourceModuleOption: 'Rolling Dodge',
            },
          ],
          modules: [],
          level: 3,
          experience: 1250,
          calculatedStats: {
            initiative: 5,
            movement: 5,
            dodge: 3,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setCharacter(mockCharacter);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching character:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this character?')) {
      return;
    }

    try {
      // In a real app, this would call your API
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      // Redirect to character list
      navigate('/characters');
    } catch (err) {
      console.error('Error deleting character:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div
          style={{
            backgroundColor: 'rgba(152, 94, 109, 0.2)',
            border: '1px solid var(--color-sunset)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}
          >
            Error
          </h2>
          <p style={{ color: 'var(--color-white)' }}>{error}</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/characters">
              <Button variant="accent">Return to Characters</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}
          >
            Character Not Found
          </h2>
          <p style={{ color: 'var(--color-cloud)' }}>
            The character you're looking for doesn't exist or has been deleted.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/characters">
              <Button variant="accent">Return to Characters</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {justCreated && (
          <div
            style={{
              backgroundColor: 'rgba(85, 65, 130, 0.2)',
              border: '1px solid var(--color-sat-purple)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: 'var(--color-white)',
            }}
          >
            Character successfully created!
          </div>
        )}

        {/* Character header */}
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
                <Link to={`/characters/${id}/edit`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
                <Button variant="outline" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Character Resources */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          {/* Health */}
          <Card variant="default">
            <CardBody>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Health
                </div>
                <div
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  {character.resources.health.current} / {character.resources.health.max}
                </div>
                {renderStatBar(
                  character.resources.health.current,
                  character.resources.health.max,
                  'var(--color-sunset)'
                )}
              </div>
            </CardBody>
          </Card>

          {/* Stamina */}
          <Card variant="default">
            <CardBody>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Stamina
                </div>
                <div
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  {character.resources.stamina.current} / {character.resources.stamina.max}
                </div>
                {renderStatBar(
                  character.resources.stamina.current,
                  character.resources.stamina.max,
                  'var(--color-metal-gold)'
                )}
              </div>
            </CardBody>
          </Card>

          {/* Resolve */}
          <Card variant="default">
            <CardBody>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Resolve
                </div>
                <div
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  {character.resources.resolve.current} / {character.resources.resolve.max}
                </div>
                {renderStatBar(
                  character.resources.resolve.current,
                  character.resources.resolve.max,
                  'var(--color-sat-purple)'
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tab navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-dark-border)',
            marginTop: '2rem',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('info')}
            style={{
              padding: '0.75rem 1.5rem',
              color: activeTab === 'info' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
              fontWeight: activeTab === 'info' ? 'bold' : 'normal',
              borderBottom: activeTab === 'info' ? '2px solid var(--color-metal-gold)' : 'none',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Character Info
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            style={{
              padding: '0.75rem 1.5rem',
              color: activeTab === 'skills' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
              fontWeight: activeTab === 'skills' ? 'bold' : 'normal',
              borderBottom: activeTab === 'skills' ? '2px solid var(--color-metal-gold)' : 'none',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Attributes & Skills
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            style={{
              padding: '0.75rem 1.5rem',
              color: activeTab === 'modules' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
              fontWeight: activeTab === 'modules' ? 'bold' : 'normal',
              borderBottom: activeTab === 'modules' ? '2px solid var(--color-metal-gold)' : 'none',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Modules
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            style={{
              padding: '0.75rem 1.5rem',
              color: activeTab === 'actions' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
              fontWeight: activeTab === 'actions' ? 'bold' : 'normal',
              borderBottom: activeTab === 'actions' ? '2px solid var(--color-metal-gold)' : 'none',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Actions
          </button>
          <button
            onClick={() => setActiveTab('traits')}
            style={{
              padding: '0.75rem 1.5rem',
              color: activeTab === 'traits' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
              fontWeight: activeTab === 'traits' ? 'bold' : 'normal',
              borderBottom: activeTab === 'traits' ? '2px solid var(--color-metal-gold)' : 'none',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Traits
          </button>

          <button
            onClick={() => setActiveTab('background')}
            style={{
              padding: '0.75rem 1.5rem',
              color: activeTab === 'background' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
              fontWeight: activeTab === 'background' ? 'bold' : 'normal',
              borderBottom:
                activeTab === 'background' ? '2px solid var(--color-metal-gold)' : 'none',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Background
          </button>
        </div>

        {/* Tab content */}
        <div style={{ marginTop: '1.5rem' }}>
          {/* Character Info Tab */}
          {activeTab === 'info' && (
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
                        {character.calculatedStats.initiative}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                        Movement
                      </div>
                      <div style={{ color: 'var(--color-white)' }}>
                        {character.calculatedStats.movement} Units
                      </div>
                    </div>

                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                        Languages
                      </div>
                      <div style={{ color: 'var(--color-white)' }}>
                        {character.languages.join(', ')}
                      </div>
                    </div>

                    {character.stances.length > 0 && (
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
                        A character with Physique 2 and Fitness skill (1d6) would roll 2d6 for
                        Fitness checks.
                      </li>
                      <li style={{ marginBottom: '0.5rem' }}>
                        A character with Ranged Weapons skill (1d8) and 3 talent stars would roll
                        3d8 for Ranged Weapon attacks.
                      </li>
                      <li>
                        A character with Knowledge 1 and Science skill (1d10) would roll 1d10 for
                        Science checks.
                      </li>
                    </ul>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Attributes & Skills Tab */}
          {activeTab === 'skills' && (
            <div>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <h3
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  Talent System
                </h3>
                <p style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                  For each skill check, you roll dice equal to your <strong>talent stars</strong> of
                  the skill's dice type. Attribute skills use your attribute value as talent stars,
                  while specialized skills have their own talent values.
                </p>
              </div>

              {/* Attribute Skill Sections */}
              <AttributeSkillsSection
                attributeName="Physique"
                attributeValue={character.attributes.physique}
                skills={[
                  {
                    id: 'fitness',
                    name: 'Fitness',
                    value: character.skills.fitness.value,
                    talent: character.skills.fitness.talent,
                  },
                  {
                    id: 'deflect',
                    name: 'Deflect',
                    value: character.skills.deflect.value,
                    talent: character.skills.deflect.talent,
                  },
                  {
                    id: 'might',
                    name: 'Might',
                    value: character.skills.might.value,
                    talent: character.skills.might.talent,
                  },
                ]}
              />

              <AttributeSkillsSection
                attributeName="Agility"
                attributeValue={character.attributes.agility}
                skills={[
                  {
                    id: 'evade',
                    name: 'Evade',
                    value: character.skills.evade.value,
                    talent: character.skills.evade.talent,
                  },
                  {
                    id: 'stealth',
                    name: 'Stealth',
                    value: character.skills.stealth.value,
                    talent: character.skills.stealth.talent,
                  },
                  {
                    id: 'coordination',
                    name: 'Coordination',
                    value: character.skills.coordination.value,
                    talent: character.skills.coordination.talent,
                  },
                ]}
              />

              <AttributeSkillsSection
                attributeName="Mind"
                attributeValue={character.attributes.mind}
                skills={[
                  {
                    id: 'resilience',
                    name: 'Resilience',
                    value: character.skills.resilience.value,
                    talent: character.skills.resilience.talent,
                  },
                  {
                    id: 'concentration',
                    name: 'Concentration',
                    value: character.skills.concentration.value,
                    talent: character.skills.concentration.talent,
                  },
                  {
                    id: 'senses',
                    name: 'Senses',
                    value: character.skills.senses.value,
                    talent: character.skills.senses.talent,
                  },
                ]}
              />

              <AttributeSkillsSection
                attributeName="Knowledge"
                attributeValue={character.attributes.knowledge}
                skills={[
                  {
                    id: 'science',
                    name: 'Science',
                    value: character.skills.science.value,
                    talent: character.skills.science.talent,
                  },
                  {
                    id: 'technology',
                    name: 'Technology',
                    value: character.skills.technology.value,
                    talent: character.skills.technology.talent,
                  },
                  {
                    id: 'medicine',
                    name: 'Medicine',
                    value: character.skills.medicine.value,
                    talent: character.skills.medicine.talent,
                  },
                  {
                    id: 'xenology',
                    name: 'Xenology',
                    value: character.skills.xenology.value,
                    talent: character.skills.xenology.talent,
                  },
                ]}
              />

              <AttributeSkillsSection
                attributeName="Social"
                attributeValue={character.attributes.social}
                skills={[
                  {
                    id: 'negotiation',
                    name: 'Negotiation',
                    value: character.skills.negotiation.value,
                    talent: character.skills.negotiation.talent,
                  },
                  {
                    id: 'behavior',
                    name: 'Behavior',
                    value: character.skills.behavior.value,
                    talent: character.skills.behavior.talent,
                  },
                  {
                    id: 'presence',
                    name: 'Presence',
                    value: character.skills.presence.value,
                    talent: character.skills.presence.talent,
                  },
                ]}
              />

              {/* Specialized Skills Section */}
              <SpecializedSkillsSection
                title="Weapon Skills"
                description="Weapon skills have their own talent values that determine how many dice you roll for attacks."
                skills={[
                  {
                    id: 'rangedWeapons',
                    name: 'Ranged Weapons',
                    value: character.weaponSkills.rangedWeapons.value,
                    talent: character.weaponSkills.rangedWeapons.talent,
                  },
                  {
                    id: 'meleeWeapons',
                    name: 'Melee Weapons',
                    value: character.weaponSkills.meleeWeapons.value,
                    talent: character.weaponSkills.meleeWeapons.talent,
                  },
                  {
                    id: 'weaponSystems',
                    name: 'Weapon Systems',
                    value: character.weaponSkills.weaponSystems.value,
                    talent: character.weaponSkills.weaponSystems.talent,
                  },
                  {
                    id: 'heavyRangedWeapons',
                    name: 'Heavy Ranged Weapons',
                    value: character.weaponSkills.heavyRangedWeapons.value,
                    talent: character.weaponSkills.heavyRangedWeapons.talent,
                  },
                ]}
              />

              <SpecializedSkillsSection
                title="Crafting Skills"
                description="Crafting skills are used to create and modify equipment and items."
                skills={[
                  {
                    id: 'engineering',
                    name: 'Engineering',
                    value: character.craftingSkills.engineering.value,
                    talent: character.craftingSkills.engineering.talent,
                  },
                  {
                    id: 'fabrication',
                    name: 'Fabrication',
                    value: character.craftingSkills.fabrication.value,
                    talent: character.craftingSkills.fabrication.talent,
                  },
                  {
                    id: 'biosculpting',
                    name: 'Biosculpting',
                    value: character.craftingSkills.biosculpting.value,
                    talent: character.craftingSkills.biosculpting.talent,
                  },
                  {
                    id: 'synthesis',
                    name: 'Synthesis',
                    value: character.craftingSkills.synthesis.value,
                    talent: character.craftingSkills.synthesis.talent,
                  },
                ]}
              />

              <Card variant="default">
                <CardHeader>
                  <h2
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Dice System Reference
                  </h2>
                </CardHeader>
                <CardBody>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '0.5rem',
                            color: 'var(--color-cloud)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          Dice Value
                        </th>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '0.5rem',
                            color: 'var(--color-cloud)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          Die Type
                        </th>
                        <th
                          style={{
                            textAlign: 'left',
                            padding: '0.5rem',
                            color: 'var(--color-cloud)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          Talent Stars
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          1
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          1d4
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          Number of dice to roll
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          2
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          1d6
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          Based on attribute or talent stars
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          3
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          1d8
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          Maximum of 3 stars
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          4
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          1d10
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        ></td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          5
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        >
                          1d12
                        </td>
                        <td
                          style={{
                            padding: '0.5rem',
                            color: 'var(--color-white)',
                            borderBottom: '1px solid var(--color-dark-border)',
                          }}
                        ></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}>6</td>
                        <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}>1d20</td>
                        <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}></td>
                      </tr>
                    </tbody>
                  </table>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <h2
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  Character Modules
                </h2>

                <Link to={`/characters/${character._id}/modules`}>
                  <Button variant="accent" size="sm">
                    Manage Modules
                  </Button>
                </Link>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-dark-surface)',
                  padding: '2rem',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: 'var(--color-cloud)', marginBottom: '1rem' }}>
                  No modules added to this character yet.
                </p>
                <Link to={`/characters/${character._id}/modules`}>
                  <Button variant="accent">Add Modules</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div>
              {character.actions.length === 0 ? (
                <Card variant="default">
                  <CardBody>
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                      }}
                    >
                      <div
                        style={{
                          color: 'var(--color-cloud)',
                          marginBottom: '1rem',
                        }}
                      >
                        No actions available yet. Add modules to gain actions.
                      </div>
                      <Button variant="secondary">Add Module</Button>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {character.actions.map((action) => (
                    <Card key={action.name} variant="default">
                      <CardHeader
                        style={{
                          backgroundColor:
                            action.type === 'Action'
                              ? 'var(--color-sat-purple-faded)'
                              : action.type === 'Reaction'
                                ? 'var(--color-sunset)'
                                : 'var(--color-metal-gold)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <h2
                            style={{
                              color: 'var(--color-white)',
                              fontSize: '1.125rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {action.name}
                          </h2>
                          <span
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              color: 'var(--color-white)',
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {action.type}
                          </span>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <p
                          style={{
                            color: 'var(--color-cloud)',
                            fontSize: '0.875rem',
                            marginBottom: '1rem',
                          }}
                        >
                          {action.description}
                        </p>
                        <div
                          style={{
                            color: 'var(--color-cloud)',
                            fontSize: '0.75rem',
                            marginTop: 'auto',
                          }}
                        >
                          Source: {action.sourceModule} ({action.sourceModuleOption})
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Traits Tab */}
          {activeTab === 'traits' && (
            <div>
              {character.traits.length === 0 ? (
                <Card variant="default">
                  <CardBody>
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                      }}
                    >
                      <div
                        style={{
                          color: 'var(--color-cloud)',
                          marginBottom: '1rem',
                        }}
                      >
                        No traits selected for this character.
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/characters/${character._id}/edit`)}
                      >
                        Edit Character
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {character.traits.map((trait) => (
                    <Card key={trait.traitId} variant="default">
                      <CardHeader
                        style={{
                          backgroundColor:
                            trait.type === 'positive'
                              ? 'rgba(215, 183, 64, 0.2)'
                              : 'rgba(152, 94, 109, 0.2)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <h2
                            style={{
                              color:
                                trait.type === 'positive'
                                  ? 'var(--color-metal-gold)'
                                  : 'var(--color-sunset)',
                              fontSize: '1.125rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {trait.name}
                          </h2>
                          <span
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              color: 'var(--color-white)',
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontWeight: 'bold',
                              textTransform: 'capitalize',
                            }}
                          >
                            {trait.type}
                          </span>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <p
                          style={{
                            color: 'var(--color-cloud)',
                            fontSize: '0.875rem',
                          }}
                        >
                          {trait.description}
                        </p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Background Tab */}
          {activeTab === 'background' && (
            <div>
              <Card variant="default" style={{ marginBottom: '1.5rem' }}>
                <CardHeader>
                  <h2
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Physical Characteristics
                  </h2>
                </CardHeader>
                <CardBody>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '1.5rem',
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                        Gender
                      </div>
                      <div style={{ color: 'var(--color-white)' }}>
                        {character.physicalTraits.gender || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                        Height
                      </div>
                      <div style={{ color: 'var(--color-white)' }}>
                        {character.physicalTraits.height || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                        Weight
                      </div>
                      <div style={{ color: 'var(--color-white)' }}>
                        {character.physicalTraits.weight || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>
                        Size
                      </div>
                      <div style={{ color: 'var(--color-white)' }}>
                        {character.physicalTraits.size || 'Medium'}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card variant="default" style={{ marginBottom: '1.5rem' }}>
                <CardHeader>
                  <h2
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Appearance
                  </h2>
                </CardHeader>
                <CardBody>
                  <p style={{ color: 'var(--color-cloud)' }}>
                    {character.appearance || 'No appearance description provided.'}
                  </p>
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
                    Biography
                  </h2>
                </CardHeader>
                <CardBody>
                  <p style={{ color: 'var(--color-cloud)' }}>
                    {character.biography || 'No biography provided.'}
                  </p>
                </CardBody>
              </Card>
            </div>
          )}
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '2rem',
          }}
        >
          <Link
            to="/characters"
            style={{
              color: 'var(--color-metal-gold)',
              textDecoration: 'none',
            }}
          >
            Return to Characters
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CharacterView;
