import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

// Skill names mapping
const SKILL_NAMES = {
  fitness: 'Fitness',
  deflect: 'Deflect',
  might: 'Might',
  evade: 'Evade',
  stealth: 'Stealth',
  coordination: 'Coordination',
  resilience: 'Resilience',
  concentration: 'Concentration',
  senses: 'Senses',
  science: 'Science',
  technology: 'Technology',
  medicine: 'Medicine',
  negotiation: 'Negotiation',
  behavior: 'Behavior',
  presence: 'Presence'
};

// Crafting skill names
const CRAFTING_SKILL_NAMES = {
  engineering: 'Engineering',
  fabrication: 'Fabrication',
  biosculpting: 'Biosculpting',
  synthesist: 'Synthesist'
};

// Attribute groupings for skills
const ATTRIBUTE_GROUPS = {
  physique: ['fitness', 'deflect', 'might'],
  agility: ['evade', 'stealth', 'coordination'],
  mind: ['resilience', 'concentration', 'senses'],
  knowledge: ['science', 'technology', 'medicine'],
  social: ['negotiation', 'behavior', 'presence']
};

// Define Character type
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

interface Module {
  id: number;
  name: string;
  mtype: string;
  ruleset: number;
  options: ModuleOption[];
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
  skills: Record<string, { value: number; isGoodAt: boolean }>;
  craftingSkills: Record<string, { value: number; isGoodAt: boolean }>;
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
  modules: Module[];
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
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'modules' | 'actions' | 'background'>('info');
  
  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        // In a real app, this would call your API
        // const response = await fetch(`/api/characters/${id}`);
        
        // Mock data for development
        const mockCharacter: Character = {
          _id: id || '12345',
          userId: 'test-user-id',
          name: 'Zara Chen',
          race: 'Human',
          attributes: {
            physique: 3,
            agility: 4,
            mind: 3,
            knowledge: 2,
            social: 3
          },
          skills: {
            // Physique Skills
            fitness: { value: 3, isGoodAt: true },
            deflect: { value: 3, isGoodAt: false },
            might: { value: 3, isGoodAt: false },
            
            // Agility Skills
            evade: { value: 4, isGoodAt: true },
            stealth: { value: 4, isGoodAt: false },
            coordination: { value: 4, isGoodAt: true },
            
            // Mind Skills
            resilience: { value: 3, isGoodAt: false },
            concentration: { value: 3, isGoodAt: false },
            senses: { value: 3, isGoodAt: false },
            
            // Knowledge Skills
            science: { value: 2, isGoodAt: false },
            technology: { value: 2, isGoodAt: false },
            medicine: { value: 2, isGoodAt: false },
            
            // Social Skills
            negotiation: { value: 3, isGoodAt: false },
            behavior: { value: 3, isGoodAt: false },
            presence: { value: 3, isGoodAt: false }
          },
          craftingSkills: {
            engineering: { value: 1, isGoodAt: false },
            fabrication: { value: 2, isGoodAt: false },
            biosculpting: { value: 0, isGoodAt: false },
            synthesist: { value: 0, isGoodAt: false }
          },
          resources: {
            health: { current: 16, max: 16 },
            stamina: { current: 16, max: 16 },
            resolve: { current: 16, max: 16 }
          },
          languages: ['Common', 'Terran Standard'],
          stances: ['Defensive Stance'],
          physicalTraits: {
            size: 'Medium',
            weight: '165 lbs',
            height: '5\'9"',
            gender: 'Female'
          },
          biography: "Born on the lunar colony of New Armstrong, Zara always dreamed of exploring beyond the solar system. After graduating top of her class at the Galactic Academy, she joined the Stellar Exploration Corps and quickly rose through the ranks due to her exceptional navigation skills and cool head in crisis situations.",
          appearance: "Tall with an athletic build, short black hair with a silver streak, and piercing blue eyes. Usually seen wearing a customized navy blue flight suit with red detailing and a well-worn leather jacket adorned with mission patches.",
          actions: [
            {
              name: "Quick Dodge",
              description: "You can use your Dodge Modifier to Defend against Ray Attacks",
              type: "Reaction",
              sourceModule: "Acrobat",
              sourceModuleOption: "Quick Dodge"
            },
            {
              name: "Rolling Dodge",
              description: "Gain +1 Dodge until the start of your next turn. Each time you Dodge an Attack successfully, gain another +1 Dodge until the start of your next turn",
              type: "Reaction",
              sourceModule: "Acrobat",
              sourceModuleOption: "Rolling Dodge"
            }
          ],
          modules: [
            {
              id: 250,
              name: "Acrobat",
              mtype: "secondary",
              ruleset: 0,
              options: [
                {
                  id: 1547,
                  name: "Acrobat",
                  description: "Gain +1 Acrobatics and +1 Initiative.",
                  mtype: "sub",
                  location: "1",
                  cost: 2,
                  data: "AS3=1:ASH=1",
                  selected: true
                },
                {
                  id: 1550,
                  name: "Reaction : Rolling Dodge",
                  description: "Gain +1 Dodge until the start of your next turn. Each time you Dodge an Attack successfully, gain another +1 Dodge until the start of your next turn",
                  mtype: "sub",
                  location: "3",
                  cost: 2,
                  data: "ZX2",
                  selected: true
                },
                {
                  id: 1552,
                  name: "Quick Dodge",
                  description: "You can use your Dodge Modifier to Defend against Ray Attacks",
                  mtype: "sub",
                  location: "4b",
                  cost: 2,
                  data: "TD",
                  selected: true
                }
              ]
            }
          ],
          level: 3,
          experience: 1250,
          calculatedStats: {
            initiative: 7,
            movement: 5,
            dodge: 4
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
      <div style={{
        position: 'relative',
        height: '0.75rem',
        backgroundColor: 'var(--color-dark-elevated)',
        borderRadius: '0.375rem',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: color,
          borderRadius: '0.375rem'
        }} />
      </div>
    );
  };

  // Group skills by attribute
  const getSkillsByAttribute = () => {
    const grouped: Record<string, { name: string; skills: { id: string; name: string; value: number; isGoodAt: boolean }[] }> = {};

    Object.entries(ATTRIBUTE_GROUPS).forEach(([attributeName, skillIds]) => {
      grouped[attributeName] = {
        name: attributeName.charAt(0).toUpperCase() + attributeName.slice(1),
        skills: skillIds.map(skillId => ({
          id: skillId,
          name: SKILL_NAMES[skillId as keyof typeof SKILL_NAMES],
          value: character?.skills[skillId]?.value || 0,
          isGoodAt: character?.skills[skillId]?.isGoodAt || false
        }))
      };
    });

    return grouped;
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
        <div style={{
          backgroundColor: 'rgba(152, 94, 109, 0.2)',
          border: '1px solid var(--color-sunset)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            color: 'var(--color-white)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
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
        <div style={{
          backgroundColor: 'var(--color-dark-surface)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            color: 'var(--color-white)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            Character Not Found
          </h2>
          <p style={{ color: 'var(--color-cloud)' }}>The character you're looking for doesn't exist or has been deleted.</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/characters">
              <Button variant="accent">Return to Characters</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const skillsByAttribute = getSkillsByAttribute();

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {justCreated && (
          <div style={{
            backgroundColor: 'rgba(85, 65, 130, 0.2)',
            border: '1px solid var(--color-sat-purple)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: 'var(--color-white)'
          }}>
            Character successfully created!
          </div>
        )}
        
        {/* Character header */}
        <Card variant="elevated">
          <CardBody>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }} className="md:flex-row md:justify-between md:items-center">
              <div>
                <h1 style={{
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.5rem',
                  fontWeight: 'bold'
                }}>
                  {character.name}
                </h1>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{
                    backgroundColor: 'var(--color-sat-purple-faded)',
                    color: 'var(--color-white)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem'
                  }}>
                    {character.race}
                  </span>
                  <span style={{
                    backgroundColor: 'var(--color-sat-purple-faded)',
                    color: 'var(--color-white)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem'
                  }}>
                    Level {character.level}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/characters/${id}/edit`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
                <Button variant="outline" onClick={handleDelete}>Delete</Button>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Character Resources */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          {/* Health */}
          <Card variant="default">
            <CardBody>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  color: 'var(--color-cloud)',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem'
                }}>
                  Health
                </div>
                <div style={{ 
                  color: 'var(--color-white)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
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
                <div style={{ 
                  color: 'var(--color-cloud)',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem'
                }}>
                  Stamina
                </div>
                <div style={{ 
                  color: 'var(--color-white)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
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
                <div style={{ 
                  color: 'var(--color-cloud)',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem'
                }}>
                  Resolve
                </div>
                <div style={{ 
                  color: 'var(--color-white)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
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
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-dark-border)',
          marginTop: '2rem',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('info')}
            style={{
              padding: '0.75rem 1.5rem',
              color: activeTab === 'info' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
              fontWeight: activeTab === 'info' ? 'bold' : 'normal',
              borderBottom: activeTab === 'info' ? '2px solid var(--color-metal-gold)' : 'none',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
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
              cursor: 'pointer'
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
              cursor: 'pointer'
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
              cursor: 'pointer'
            }}
          >
            Actions
          </button>
          <button
            onClick={() => setActiveTab('background')}
            style={{
              padding: '0.75rem 1.5rem',
              color: activeTab === 'background' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
              fontWeight: activeTab === 'background' ? 'bold' : 'normal',
              borderBottom: activeTab === 'background' ? '2px solid var(--color-metal-gold)' : 'none',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
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
                  <h2 style={{ 
                    color: 'var(--color-white)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
                    Attributes
                  </h2>
                </CardHeader>
                <CardBody>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(character.attributes).map(([key, value]) => (
                      <div key={key}>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.25rem'
                        }}>
                          <span style={{ color: 'var(--color-cloud)' }}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                          <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                            {value}
                          </span>
                        </div>
                        {renderStatBar(value, 5)}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              
              <Card variant="default">
                <CardHeader>
                  <h2 style={{ 
                    color: 'var(--color-white)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
                    Character Details
                  </h2>
                </CardHeader>
                <CardBody>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Level</div>
                      <div style={{ color: 'var(--color-white)' }}>{character.level}</div>
                    </div>
                    
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Experience</div>
                      <div style={{ color: 'var(--color-white)' }}>{character.experience} XP</div>
                    </div>
                    
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Initiative</div>
                      <div style={{ color: 'var(--color-white)' }}>{character.calculatedStats.initiative}</div>
                    </div>
                    
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Movement</div>
                      <div style={{ color: 'var(--color-white)' }}>{character.calculatedStats.movement} Units</div>
                    </div>
                    
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Languages</div>
                      <div style={{ color: 'var(--color-white)' }}>{character.languages.join(', ')}</div>
                    </div>
                    
                    {character.stances.length > 0 && (
                      <div>
                        <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Stances</div>
                        <div style={{ color: 'var(--color-white)' }}>{character.stances.join(', ')}</div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
              
              <Card variant="default" style={{ gridColumn: 'span 2' }}>
                <CardHeader>
                  <h2 style={{ 
                    color: 'var(--color-white)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
                    Crafting Skills
                  </h2>
                </CardHeader>
                <CardBody>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {Object.entries(character.craftingSkills).map(([key, { value, isGoodAt }]) => (
                      <div key={key}>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.25rem'
                        }}>
                          <span style={{ 
                            color: 'var(--color-cloud)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {CRAFTING_SKILL_NAMES[key as keyof typeof CRAFTING_SKILL_NAMES]}
                            {isGoodAt && (
                              <span style={{
                                backgroundColor: 'var(--color-metal-gold)',
                                color: 'var(--color-dark-surface)',
                                fontSize: '0.6875rem',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '9999px',
                                fontWeight: 'bold'
                              }}>
                                Good At
                              </span>
                            )}
                          </span>
                          <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                            {value}
                          </span>
                        </div>
                        {renderStatBar(value, 3)}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
          
          {/* Attributes & Skills Tab */}
          {activeTab === 'skills' && (
            <div>
              {Object.entries(skillsByAttribute).map(([attributeKey, { name, skills }]) => (
                <Card variant="default" key={attributeKey} style={{ marginBottom: '1.5rem' }}>
                  <CardHeader>
                    <h2 style={{ 
                      color: 'var(--color-white)',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {name}
                      <span style={{ 
                        color: 'var(--color-metal-gold)',
                        fontSize: '1rem'
                      }}>
                        ({character.attributes[attributeKey as keyof typeof character.attributes]})
                      </span>
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {skills.map(skill => (
                        <div key={skill.id}>
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.25rem'
                          }}>
                            <span style={{ 
                              color: 'var(--color-cloud)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {skill.name}
                              {skill.isGoodAt && (
                                <span style={{
                                  backgroundColor: 'var(--color-metal-gold)',
                                  color: 'var(--color-dark-surface)',
                                  fontSize: '0.6875rem',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '9999px',
                                  fontWeight: 'bold'
                                }}>
                                  Good At
                                </span>
                              )}
                            </span>
                            <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                              {skill.value}
                            </span>
                          </div>
                          {renderStatBar(skill.value, 5)}
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
          
          {/* Modules Tab */}
          {activeTab === 'modules' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <h2 style={{ 
        color: 'var(--color-white)',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        Character Modules
      </h2>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{
          backgroundColor: 'var(--color-dark-elevated)',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          color: 'var(--color-metal-gold)'
        }}>
          Module Points: <span style={{ fontWeight: 'bold' }}>
            {character.modulePoints.total - character.modulePoints.spent}
          </span> / {character.modulePoints.total}
        </div>
        
        <Link to={`/characters/${character._id}/modules`}>
          <Button variant="accent" size="sm">
            Manage Modules
          </Button>
        </Link>
      </div>
    </div>
    
    {character.modules && character.modules.length > 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {character.modules.map((module) => (
          <Card key={module.moduleId._id} variant="default">
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ 
                  color: 'var(--color-white)',
                  fontSize: '1.25rem',
                  fontWeight: 'bold'
                }}>
                  {module.moduleId.name}
                </h3>
                <div style={{ 
                  color: 'var(--color-cloud)',
                  fontSize: '0.875rem',
                  textTransform: 'capitalize'
                }}>
                  {module.moduleId.mtype}
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ 
                  color: 'var(--color-metal-gold)',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  Selected Options:
                </h4>
                
                {module.selectedOptions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {module.selectedOptions.map((selectedOption) => {
                      // Find the option details
                      const option = module.moduleId.options.find(o => o.location === selectedOption.location);
                      
                      return option ? (
                        <div 
                          key={selectedOption.location}
                          style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--color-dark-border)'
                          }}
                        >
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.25rem'
                          }}>
                            <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                              {option.name}
                            </span>
                            <span style={{ 
                              color: 'var(--color-cloud)',
                              fontSize: '0.75rem'
                            }}>
                              Tier {selectedOption.location.charAt(0)}
                            </span>
                          </div>
                          
                          <p style={{ 
                            color: 'var(--color-cloud)',
                            fontSize: '0.875rem'
                          }}>
                            {option.description}
                          </p>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-cloud)' }}>
                    No options selected yet. Visit the Modules page to select options.
                  </p>
                )}
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <Link to={`/characters/${character._id}/modules`}>
                  <Button variant="secondary" size="sm">
                    Manage Module
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    ) : (
      <div style={{
        backgroundColor: 'var(--color-dark-surface)',
        padding: '2rem',
        borderRadius: '0.5rem',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--color-cloud)', marginBottom: '1rem' }}>
          No modules added to this character yet.
        </p>
        <Link to={`/characters/${character._id}/modules`}>
          <Button variant="accent">
            Add Modules
          </Button>
        </Link>
      </div>
    )}
  </div>
)}
          
          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div>
              {character.actions.length === 0 ? (
                <Card variant="default">
                  <CardBody>
                    <div style={{ 
                      textAlign: 'center',
                      padding: '2rem'
                    }}>
                      <div style={{ 
                        color: 'var(--color-cloud)',
                        marginBottom: '1rem'
                      }}>
                        No actions available yet. Add modules to gain actions.
                      </div>
                      <Button variant="secondary">Add Module</Button>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '1rem'
                }}>
                  {character.actions.map(action => (
                    <Card 
                      key={action.name} 
                      variant="default"
                    >
                      <CardHeader style={{
                        backgroundColor: action.type === 'Action' ? 
                          'var(--color-sat-purple-faded)' : 
                          action.type === 'Reaction' ? 
                            'var(--color-sunset)' : 
                            'var(--color-metal-gold)'
                      }}>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <h2 style={{ 
                            color: 'var(--color-white)',
                            fontSize: '1.125rem',
                            fontWeight: 'bold'
                          }}>
                            {action.name}
                          </h2>
                          <span style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            color: 'var(--color-white)',
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.25rem',
                            fontWeight: 'bold'
                          }}>
                            {action.type}
                          </span>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <p style={{ 
                          color: 'var(--color-cloud)',
                          fontSize: '0.875rem',
                          marginBottom: '1rem'
                        }}>
                          {action.description}
                        </p>
                        <div style={{ 
                          color: 'var(--color-cloud)',
                          fontSize: '0.75rem',
                          marginTop: 'auto'
                        }}>
                          Source: {action.sourceModule} ({action.sourceModuleOption})
                        </div>
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
                  <h2 style={{ 
                    color: 'var(--color-white)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
                    Physical Characteristics
                  </h2>
                </CardHeader>
                <CardBody>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Gender</div>
                      <div style={{ color: 'var(--color-white)' }}>{character.physicalTraits.gender || 'Not specified'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Height</div>
                      <div style={{ color: 'var(--color-white)' }}>{character.physicalTraits.height || 'Not specified'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Weight</div>
                      <div style={{ color: 'var(--color-white)' }}>{character.physicalTraits.weight || 'Not specified'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Size</div>
                      <div style={{ color: 'var(--color-white)' }}>{character.physicalTraits.size || 'Medium'}</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
              
              <Card variant="default" style={{ marginBottom: '1.5rem' }}>
                <CardHeader>
                  <h2 style={{ 
                    color: 'var(--color-white)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
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
                  <h2 style={{ 
                    color: 'var(--color-white)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
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
        
        <div style={{ 
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <Link to="/characters" style={{
            color: 'var(--color-metal-gold)',
            textDecoration: 'none'
          }}>
            Return to Characters
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CharacterView;