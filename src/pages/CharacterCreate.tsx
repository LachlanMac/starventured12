import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

const RACES = ['Human', 'Android', 'Alien', 'Mutant'];

// Attributes mapping
const ATTRIBUTES = [
  { id: 'physique', name: 'Physique', description: 'Physical strength, endurance, and overall body power.' },
  { id: 'agility', name: 'Agility', description: 'Speed, reflexes, balance, and coordination.' },
  { id: 'mind', name: 'Mind', description: 'Mental fortitude, focus, and perception.' },
  { id: 'knowledge', name: 'Knowledge', description: 'Education, technical expertise, and wisdom.' },
  { id: 'social', name: 'Social', description: 'Charisma, empathy, and ability to influence others.' }
];

const CharacterCreate: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pointsRemaining, setPointsRemaining] = useState<number>(7);
  
  // Character state
  const [character, setCharacter] = useState({
    name: '',
    race: '',
    modulePoints: {
      total: 10,
      spent: 0
    },
    attributes: {
      physique: 2,
      agility: 2,
      mind: 2,
      knowledge: 2,
      social: 2
    },
    level: 1, // Will be calculated from modulePoints.total
    physicalTraits: {
      size: '',
      weight: '',
      height: '',
      gender: ''
    },
    biography: '',
    appearance: '',
    // For testing, hardcode a userId - in a real app this would come from auth
    userId: 'test-user-id'
  });

  // Update basic character field
  const updateCharacter = (field: string, value: any) => {
    setCharacter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (objectName: string, field: string, value: any) => {
    setCharacter(prev => {
      const nested = prev[objectName as keyof typeof prev];
      return {
        ...prev,
        [objectName]: {
          ...(typeof nested === 'object' && nested !== null ? nested : {}),
          [field]: value
        }
      };
    });
  };

  // Update modulePoints and recalculate level
  const updateModulePoints = (value: number) => {
    const newLevel = Math.floor(value / 10);
    setCharacter(prev => ({
      ...prev,
      modulePoints: {
        ...prev.modulePoints,
        total: value
      },
      level: newLevel > 0 ? newLevel : 1
    }));
  };

  // Update an attribute
  const updateAttribute = (attribute: string, newValue: number) => {
    const oldValue = character.attributes[attribute as keyof typeof character.attributes];
    const pointDifference = oldValue - newValue;
    
    if (pointsRemaining + pointDifference < 0) {
      // Not enough points
      return;
    }
    
    // Update the attribute
    const newAttributes = {
      ...character.attributes,
      [attribute]: newValue
    };
    
    setCharacter(prev => ({
      ...prev,
      attributes: newAttributes
    }));
    
    setPointsRemaining(prev => prev + pointDifference);
  };

  // Validate the current step
  const validateStep = (): boolean => {
    setError(null);
    
    switch (step) {
      case 1:
        if (!character.name.trim()) {
          setError('Character name is required');
          return false;
        }
        if (!character.race) {
          setError('Please select a race');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsLoading(true);
    try {
      console.log('Sending character data:', character);
      // Transform the character data for the API
      const characterData = {
        name: character.name,
        race: character.race,
        attributes: character.attributes,
        modulePoints: character.modulePoints,
        level: character.level,
        userId: character.userId,
        biography: character.biography,
        appearance: character.appearance,
        physicalTraits: character.physicalTraits
      };

      // In a real app, this would call your API
      console.log("Calling API");
      const response = await fetch(`/api/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add CORS headers to ensure the request is accepted
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(characterData),
      });
      

      if (!response.ok) {
        console.log("NOT OK")
        throw new Error('Failed to create character');
      }
      console.log("OK")
      const data = await response.json();
      console.log('Character created:', data);
      
      // Redirect to character sheet
      navigate(`/characters/${data._id}`);
    } catch (err) {
      console.error('Error creating character:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 style={{ 
          color: 'var(--color-white)',
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Create Your Character
        </h1>
        
        {error && (
          <div style={{
            backgroundColor: 'rgba(152, 94, 109, 0.2)',
            border: '1px solid var(--color-sunset)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: 'var(--color-white)'
          }}>
            {error}
          </div>
        )}
        
        <Card variant="default">
          <CardHeader>
            {/* Step indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[
                "Basic Info", 
                "Attributes",
                "Background"
              ].map((stepName, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    position: 'relative'
                  }}
                >
                  <div 
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '9999px',
                      backgroundColor: step >= index + 1 ? 'var(--color-sat-purple)' : 'var(--color-dark-elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-white)',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {index + 1}
                  </div>
                  <span 
                    style={{
                      fontSize: '0.875rem',
                      color: step >= index + 1 ? 'var(--color-metal-gold)' : 'var(--color-cloud)'
                    }}
                  >
                    {stepName}
                  </span>
                  {index < 2 && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '-50%',
                        width: '100%',
                        height: '2px',
                        backgroundColor: step > index + 1 ? 'var(--color-sat-purple)' : 'var(--color-dark-elevated)',
                        zIndex: 0
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardBody>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div>
                <h2 style={{ 
                  color: 'var(--color-white)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  Basic Information
                </h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem'
                  }}>
                    Character Name
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      padding: '0.5rem 0.75rem'
                    }}
                    value={character.name}
                    onChange={(e) => updateCharacter('name', e.target.value)}
                    placeholder="Enter character name"
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem'
                  }}>
                    Race
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {RACES.map(race => (
                      <button
                        key={race}
                        type="button"
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.375rem',
                          backgroundColor: character.race === race ? 'var(--color-sat-purple)' : 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => updateCharacter('race', race)}
                      >
                        {race}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem'
                  }}>
                    Gender
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      padding: '0.5rem 0.75rem'
                    }}
                    value={character.physicalTraits.gender}
                    onChange={(e) => updateNestedField('physicalTraits', 'gender', e.target.value)}
                    placeholder="Enter gender (optional)"
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem'
                  }}>
                    Starting Module Points
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      step="10"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: '0.375rem',
                        padding: '0.5rem 0.75rem'
                      }}
                      value={character.modulePoints.total}
                      onChange={(e) => updateModulePoints(parseInt(e.target.value))}
                    />
                    <div style={{
                      backgroundColor: 'var(--color-dark-elevated)',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      color: 'var(--color-metal-gold)',
                      whiteSpace: 'nowrap'
                    }}>
                      Level: {character.level}
                    </div>
                  </div>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: 'var(--color-cloud)',
                    marginTop: '0.5rem'
                  }}>
                    Module points determine your starting power level. Your character level is calculated as Module Points / 10.
                  </p>
                </div>

                <div>
                  <h3 style={{ 
                    color: 'var(--color-white)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    marginTop: '2rem'
                  }}>
                    Race Information
                  </h3>
                  <div style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}>
                    {character.race === 'Human' && (
                      <p>Adaptable and innovative, humans are versatile explorers who have spread throughout the galaxy, establishing colonies and trade networks.</p>
                    )}
                    {character.race === 'Android' && (
                      <p>Synthetic beings with advanced AI, androids combine technological efficiency with evolving consciousness. Some seek identity beyond their programming.</p>
                    )}
                    {character.race === 'Alien' && (
                      <p>Members of non-human species with unique physiologies and cultural perspectives, bringing diversity and unexpected approaches to challenges.</p>
                    )}
                    {character.race === 'Mutant' && (
                      <p>Humans altered by cosmic radiation, experimental genetics, or environmental factors, possessing extraordinary abilities alongside physical differences.</p>
                    )}
                    {!character.race && (
                      <p style={{ color: 'var(--color-cloud)' }}>Select a race to see information</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Attributes */}
            {step === 2 && (
              <div>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h2 style={{ 
                    color: 'var(--color-white)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    Attributes
                  </h2>
                  <div style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    color: pointsRemaining > 0 ? 'var(--color-metal-gold)' : 'var(--color-white)'
                  }}>
                    Points Remaining: <span style={{ fontWeight: 'bold' }}>{pointsRemaining}</span>
                  </div>
                </div>
                
                <p style={{ 
                  color: 'var(--color-cloud)',
                  marginBottom: '1.5rem'
                }}>
                  Attributes define your character's basic capabilities. Skills and abilities are acquired through modules after character creation.
                  The default value for each attribute is 2.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {ATTRIBUTES.map(attribute => (
                    <div key={attribute.id}>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <label style={{ color: 'var(--color-metal-gold)', fontWeight: 'bold' }}>
                          {attribute.name}
                        </label>
                        <div>
                          <span style={{ 
                            color: 'var(--color-cloud)', 
                            fontSize: '0.875rem'
                          }}>
                            {attribute.description}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <button
                          type="button"
                          disabled={character.attributes[attribute.id as keyof typeof character.attributes] <= 1}
                          onClick={() => updateAttribute(attribute.id, Math.max(1, character.attributes[attribute.id as keyof typeof character.attributes] - 1))}
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '0.375rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            color: 'var(--color-white)',
                            border: 'none',
                            cursor: character.attributes[attribute.id as keyof typeof character.attributes] <= 1 ? 'not-allowed' : 'pointer',
                            opacity: character.attributes[attribute.id as keyof typeof character.attributes] <= 1 ? 0.5 : 1
                          }}
                        >
                          -
                        </button>
                        
                        <div style={{
                          width: '3rem',
                          height: '2.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'var(--color-sat-purple-faded)',
                          color: 'var(--color-white)',
                          borderRadius: '0.375rem',
                          fontWeight: 'bold'
                        }}>
                          {character.attributes[attribute.id as keyof typeof character.attributes]}
                        </div>
                        
                        <button
                          type="button"
                          disabled={character.attributes[attribute.id as keyof typeof character.attributes] >= 5 || pointsRemaining <= 0}
                          onClick={() => updateAttribute(attribute.id, Math.min(5, character.attributes[attribute.id as keyof typeof character.attributes] + 1))}
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '0.375rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            color: 'var(--color-white)',
                            border: 'none',
                            cursor: (character.attributes[attribute.id as keyof typeof character.attributes] >= 5 || pointsRemaining <= 0) ? 'not-allowed' : 'pointer',
                            opacity: (character.attributes[attribute.id as keyof typeof character.attributes] >= 5 || pointsRemaining <= 0) ? 0.5 : 1
                          }}
                        >
                          +
                        </button>
                        
                        <div style={{
                          position: 'relative',
                          height: '0.75rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          borderRadius: '0.375rem',
                          flex: 1,
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: `${(character.attributes[attribute.id as keyof typeof character.attributes] / 5) * 100}%`,
                            backgroundColor: 'var(--color-sat-purple)',
                            borderRadius: '0.375rem',
                            transition: 'width 0.3s'
                          }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  marginTop: '2rem'
                }}>
                  <p style={{ color: 'var(--color-cloud)' }}>
                    Your character's skills, abilities, and other traits will be determined by the modules you select after character creation. 
                    Modules will allow you to customize your character based on your preferred playstyle.
                  </p>
                </div>
              </div>
            )}
            
            {/* Step 3: Background */}
            {step === 3 && (
              <div>
                <h2 style={{ 
                  color: 'var(--color-white)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1.5rem'
                }}>
                  Character Background
                </h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                      <label style={{ 
                        display: 'block',
                        color: 'var(--color-cloud)',
                        marginBottom: '0.5rem'
                      }}>
                        Height
                      </label>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          padding: '0.5rem 0.75rem'
                        }}
                        value={character.physicalTraits.height}
                        onChange={(e) => updateNestedField('physicalTraits', 'height', e.target.value)}
                        placeholder="E.g. 6'2"
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block',
                        color: 'var(--color-cloud)',
                        marginBottom: '0.5rem'
                      }}>
                        Weight
                      </label>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: '1px solid var(--color-dark-border)',
                          borderRadius: '0.375rem',
                          padding: '0.5rem 0.75rem'
                        }}
                        value={character.physicalTraits.weight}
                        onChange={(e) => updateNestedField('physicalTraits', 'weight', e.target.value)}
                        placeholder="E.g. 180 lbs"
                      />
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem'
                  }}>
                    Appearance
                  </label>
                  <textarea
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      height: '6rem'
                    }}
                    value={character.appearance}
                    onChange={(e) => updateCharacter('appearance', e.target.value)}
                    placeholder="Describe your character's appearance, clothing, and distinctive features..."
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem'
                  }}>
                    Biography
                  </label>
                  <textarea
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      height: '10rem'
                    }}
                    value={character.biography}
                    onChange={(e) => updateCharacter('biography', e.target.value)}
                    placeholder="Write your character's backstory, motivations, and goals..."
                  />
                </div>

                <div style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  marginTop: '2rem'
                }}>
                  <h3 style={{ 
                    color: 'var(--color-metal-gold)', 
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}>
                    Character Summary
                  </h3>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Name</div>
                    <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>{character.name || 'Unnamed'}</div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Race</div>
                    <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>{character.race || 'Not selected'}</div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Level</div>
                    <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                      {character.level} ({character.modulePoints.total} Module Points)
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Key Attributes</div>
                    <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                      {Object.entries(character.attributes)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 2)
                        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
                        .join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation buttons */}
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '2rem'
            }}>
              {step > 1 && (
                <Button variant="secondary" onClick={handlePrevStep}>
                  Previous
                </Button>
              )}
              
              {step < 3 ? (
                <Button variant="accent" onClick={handleNextStep} style={{ marginLeft: 'auto' }}>
                  Next
                </Button>
              ) : (
                <Button 
                  variant="accent" 
                  onClick={handleSubmit} 
                  isLoading={isLoading}
                  style={{ marginLeft: 'auto' }}
                >
                  Create Character
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
        
        <div style={{ 
          textAlign: 'center',
          marginTop: '1.5rem'
        }}>
          <Link to="/characters" style={{
            color: 'var(--color-metal-gold)',
            textDecoration: 'none'
          }}>
            Cancel and return to characters
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreate;