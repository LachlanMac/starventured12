import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

const RACES = ['Human', 'Android', 'Alien', 'Mutant'];

// Attributes and Skills mapping
const ATTRIBUTES = [
  { id: 'physique', name: 'Physique', skills: ['fitness', 'deflect', 'might'] },
  { id: 'agility', name: 'Agility', skills: ['evade', 'stealth', 'coordination'] },
  { id: 'mind', name: 'Mind', skills: ['resilience', 'concentration', 'senses'] },
  { id: 'knowledge', name: 'Knowledge', skills: ['science', 'technology', 'medicine'] },
  { id: 'social', name: 'Social', skills: ['negotiation', 'behavior', 'presence'] }
];

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

const CRAFTING_SKILLS = [
  { id: 'engineering', name: 'Engineering' },
  { id: 'fabrication', name: 'Fabrication' },
  { id: 'biosculpting', name: 'Biosculpting' },
  { id: 'synthesist', name: 'Synthesist' }
];

const CharacterCreate: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pointsRemaining, setPointsRemaining] = useState<number>(7);
  const [craftingPointsRemaining, setCraftingPointsRemaining] = useState<number>(3);
  const [goodAtSkillsRemaining, setGoodAtSkillsRemaining] = useState<number>(3);
  
  // Character state
  const [character, setCharacter] = useState({
    name: '',
    race: '',
    attributes: {
      physique: 2,
      agility: 2,
      mind: 2,
      knowledge: 2,
      social: 2
    },
    skills: {
      // Physique Skills
      fitness: { value: 2, isGoodAt: false },
      deflect: { value: 2, isGoodAt: false },
      might: { value: 2, isGoodAt: false },
      
      // Agility Skills
      evade: { value: 2, isGoodAt: false },
      stealth: { value: 2, isGoodAt: false },
      coordination: { value: 2, isGoodAt: false },
      
      // Mind Skills
      resilience: { value: 2, isGoodAt: false },
      concentration: { value: 2, isGoodAt: false },
      senses: { value: 2, isGoodAt: false },
      
      // Knowledge Skills
      science: { value: 2, isGoodAt: false },
      technology: { value: 2, isGoodAt: false },
      medicine: { value: 2, isGoodAt: false },
      
      // Social Skills
      negotiation: { value: 2, isGoodAt: false },
      behavior: { value: 2, isGoodAt: false },
      presence: { value: 2, isGoodAt: false }
    },
    craftingSkills: {
      engineering: { value: 0, isGoodAt: false },
      fabrication: { value: 0, isGoodAt: false },
      biosculpting: { value: 0, isGoodAt: false },
      synthesist: { value: 0, isGoodAt: false }
    },
    resources: {
      health: { current: 14, max: 14 },
      stamina: { current: 12, max: 12 },
      resolve: { current: 14, max: 14 }
    },
    languages: ['Common'],
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
  

  // Update an attribute and recalculate associated skills
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
    
    // Update associated skills
    const attributeObj = ATTRIBUTES.find(attr => attr.id === attribute);
    const newSkills = { ...character.skills };
    
    if (attributeObj) {
      attributeObj.skills.forEach(skillId => {
        newSkills[skillId as keyof typeof newSkills] = {
          ...newSkills[skillId as keyof typeof newSkills],
          value: newValue
        };
      });
    }
    
    // Calculate resources
    const physique = attribute === 'physique' ? newValue : character.attributes.physique;
    const mind = attribute === 'mind' ? newValue : character.attributes.mind;
    
    const newResources = {
      health: { 
        current: 10 + (physique * 2), 
        max: 10 + (physique * 2) 
      },
      stamina: { 
        current: 10 + (physique + mind), 
        max: 10 + (physique + mind) 
      },
      resolve: { 
        current: 10 + (mind * 2), 
        max: 10 + (mind * 2) 
      }
    };
    
    setCharacter(prev => ({
      ...prev,
      attributes: newAttributes,
      skills: newSkills,
      resources: newResources
    }));
    
    setPointsRemaining(prev => prev + pointDifference);
  };

  // Update crafting skill
  const updateCraftingSkill = (skillId: string, newValue: number) => {
    const oldValue = character.craftingSkills[skillId as keyof typeof character.craftingSkills].value;
    const pointDifference = oldValue - newValue;
    
    if (craftingPointsRemaining + pointDifference < 0) {
      // Not enough points
      return;
    }
    
    setCharacter(prev => ({
      ...prev,
      craftingSkills: {
        ...prev.craftingSkills,
        [skillId]: {
          ...prev.craftingSkills[skillId as keyof typeof prev.craftingSkills],
          value: newValue
        }
      }
    }));
    
    setCraftingPointsRemaining(prev => prev + pointDifference);
  };

  const toggleGoodAt = (
    skillType: 'skills' | 'craftingSkills',
    skillId: string
  ) => {
    setCharacter(prev => {
      const skillGroup = prev[skillType] as Record<string, { isGoodAt: boolean }>;
      const skill = skillGroup[skillId];
  
      if (!skill) return prev;
  
      const currentIsGoodAt = skill.isGoodAt;
  
      if (!currentIsGoodAt && goodAtSkillsRemaining <= 0) {
        return prev;
      }
  
      return {
        ...prev,
        [skillType]: {
          ...skillGroup,
          [skillId]: {
            ...skill,
            isGoodAt: !currentIsGoodAt,
          },
        },
      };
    });
  
    setGoodAtSkillsRemaining(prev => {
        const skillGroup = character[skillType] as Record<string, { isGoodAt: boolean }>;
        const skill = skillGroup[skillId];
        return skill?.isGoodAt ? prev + 1 : prev - 1;
      });
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
        userId: character.userId,
        biography: character.biography,
        appearance: character.appearance,
        physicalTraits: character.physicalTraits,
        languages: character.languages,
        // Transform skills
        skills: Object.entries(character.skills).reduce((obj, [key, value]) => {
          obj[key] = { 
            isGoodAt: value.isGoodAt 
          };
          return obj;
        }, {} as Record<string, { isGoodAt: boolean }>),
        // Transform crafting skills
        craftingSkills: Object.entries(character.craftingSkills).reduce((obj, [key, value]) => {
          obj[key] = { 
            value: value.value, 
            isGoodAt: value.isGoodAt 
          };
          return obj;
        }, {} as Record<string, { value: number, isGoodAt: boolean }>)
      };

      // In a real app, this would call your API
      console.log("Calling API");
      //console.log("OUR URL IS" +  apiUrl);
       // Make a direct request to your Express server
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
        console.log("NOT OKAQA")
        throw new Error('Failed to create character');
      }
      console.log("OKAQA")
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

  // Calculate derived stat values
  const calculateDerivedStats = () => {
    const { physique, agility, mind } = character.attributes;
    return {
      initiative: agility + mind,
      dodge: agility,
      movement: 5 // Base movement speed
    };
  };

  const derivedStats = calculateDerivedStats();

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
                "Skills", 
                "Crafting", 
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
                  {index < 4 && (
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
                  Attributes define your character's basic capabilities. Each attribute determines a set of related skills. 
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
                            fontSize: '0.875rem', 
                            marginRight: '0.5rem'
                          }}>
                            Skills: {attribute.skills.map(s => SKILL_NAMES[s as keyof typeof SKILL_NAMES]).join(', ')}
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
                  <h3 style={{ 
                    color: 'var(--color-metal-gold)', 
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}>
                    Derived Stats
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Health</div>
                      <div style={{ 
                        color: 'var(--color-white)',
                        fontWeight: 'bold' 
                      }}>
                        {character.resources.health.max}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Stamina</div>
                      <div style={{ 
                        color: 'var(--color-white)',
                        fontWeight: 'bold' 
                      }}>
                        {character.resources.stamina.max}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Resolve</div>
                      <div style={{ 
                        color: 'var(--color-white)',
                        fontWeight: 'bold' 
                      }}>
                        {character.resources.resolve.max}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Initiative</div>
                      <div style={{ 
                        color: 'var(--color-white)',
                        fontWeight: 'bold' 
                      }}>
                        {derivedStats.initiative}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Skills */}
            {step === 3 && (
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
                    Skills
                  </h2>
                  <div style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    color: goodAtSkillsRemaining > 0 ? 'var(--color-metal-gold)' : 'var(--color-white)'
                  }}>
                    "Good At" Selections Remaining: <span style={{ fontWeight: 'bold' }}>{goodAtSkillsRemaining}</span>
                  </div>
                </div>
                
                <p style={{ 
                  color: 'var(--color-cloud)',
                  marginBottom: '1.5rem'
                }}>
                  Skills are derived from your attributes. You can select up to three skills that your character is "Good At" which provides bonuses when using those skills.
                </p>
                
                {ATTRIBUTES.map(attribute => (
                  <div key={attribute.id} style={{ marginBottom: '2rem' }}>
                    <h3 style={{ 
                      color: 'var(--color-metal-gold)', 
                      fontWeight: 'bold',
                      marginBottom: '1rem'
                    }}>
                      {attribute.name} Skills
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {attribute.skills.map(skill => (
                        <div key={skill} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          borderRadius: '0.5rem',
                          border: character.skills[skill as keyof typeof character.skills].isGoodAt ? 
                            '1px solid var(--color-metal-gold)' : 
                            '1px solid var(--color-dark-border)'
                        }}>
                          <div>
                            <div style={{ 
                              color: 'var(--color-white)', 
                              fontWeight: 'bold',
                              marginBottom: '0.25rem'
                            }}>
                              {SKILL_NAMES[skill as keyof typeof SKILL_NAMES]}
                            </div>
                            <div style={{ 
                              color: 'var(--color-cloud)', 
                              fontSize: '0.875rem'
                            }}>
                              Value: {character.skills[skill as keyof typeof character.skills].value}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <label style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              color: 'var(--color-white)',
                              cursor: 'pointer'
                            }}>
                              <input
                                type="checkbox"
                                checked={character.skills[skill as keyof typeof character.skills].isGoodAt}
                                onChange={() => toggleGoodAt('skills', skill)}
                                disabled={!character.skills[skill as keyof typeof character.skills].isGoodAt && goodAtSkillsRemaining <= 0}
                                style={{ 
                                  marginRight: '0.5rem',
                                  accentColor: 'var(--color-metal-gold)'
                                }}
                              />
                              Good At
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Step 4: Crafting Skills */}
            {step === 4 && (
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
                    Crafting Skills
                  </h2>
                  <div style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    color: craftingPointsRemaining > 0 ? 'var(--color-metal-gold)' : 'var(--color-white)'
                  }}>
                    Points Remaining: <span style={{ fontWeight: 'bold' }}>{craftingPointsRemaining}</span>
                  </div>
                </div>
                
                <p style={{ 
                  color: 'var(--color-cloud)',
                  marginBottom: '1.5rem'
                }}>
                  Crafting skills allow your character to create and modify equipment and technology. 
                  You have 3 points to distribute among these skills.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {CRAFTING_SKILLS.map(skill => (
                    <div key={skill.id}>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <label style={{ color: 'var(--color-metal-gold)', fontWeight: 'bold' }}>
                          {skill.name}
                        </label>
                        
                        <label style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--color-white)',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={character.craftingSkills[skill.id as keyof typeof character.craftingSkills].isGoodAt}
                            onChange={() => toggleGoodAt('craftingSkills', skill.id)}
                            disabled={!character.craftingSkills[skill.id as keyof typeof character.craftingSkills].isGoodAt && goodAtSkillsRemaining <= 0}
                            style={{ 
                              marginRight: '0.5rem',
                              accentColor: 'var(--color-metal-gold)'
                            }}
                          />
                          Good At
                        </label>
                      </div>
                      
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <button
                          type="button"
                          disabled={character.craftingSkills[skill.id as keyof typeof character.craftingSkills].value <= 0}
                          onClick={() => updateCraftingSkill(skill.id, Math.max(0, character.craftingSkills[skill.id as keyof typeof character.craftingSkills].value - 1))}
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '0.375rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            color: 'var(--color-white)',
                            border: 'none',
                            cursor: character.craftingSkills[skill.id as keyof typeof character.craftingSkills].value <= 0 ? 'not-allowed' : 'pointer',
                            opacity: character.craftingSkills[skill.id as keyof typeof character.craftingSkills].value <= 0 ? 0.5 : 1
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
                          {character.craftingSkills[skill.id as keyof typeof character.craftingSkills].value}
                        </div>
                        
                        <button
                          type="button"
                          disabled={character.craftingSkills[skill.id as keyof typeof character.craftingSkills].value >= 3 || craftingPointsRemaining <= 0}
                          onClick={() => updateCraftingSkill(skill.id, Math.min(3, character.craftingSkills[skill.id as keyof typeof character.craftingSkills].value + 1))}
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '0.375rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            color: 'var(--color-white)',
                            border: 'none',
                            cursor: (character.craftingSkills[skill.id as keyof typeof character.craftingSkills].value >= 3 || craftingPointsRemaining <= 0) ? 'not-allowed' : 'pointer',
                            opacity: (character.craftingSkills[skill.id as keyof typeof character.craftingSkills].value >= 3 || craftingPointsRemaining <= 0) ? 0.5 : 1
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
                            width: `${(character.craftingSkills[skill.id as keyof typeof character.craftingSkills].value / 3) * 100}%`,
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
                  <h3 style={{ 
                    color: 'var(--color-metal-gold)', 
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}>
                    Crafting Skills Descriptions
                  </h3>
                  
                  <ul style={{ color: 'var(--color-white)', listStyle: 'disc', paddingLeft: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold' }}>Engineering:</span> Create and repair mechanical devices, vehicles, and structural components.
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold' }}>Fabrication:</span> Manufacture weapons, armor, and equipment using various materials.
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold' }}>Biosculpting:</span> Manipulate organic material for medical applications or biological enhancements.
                    </li>
                    <li>
                      <span style={{ fontWeight: 'bold' }}>Synthesist:</span> Create chemicals, compounds, and pharmaceuticals with specific properties.
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Step 5: Background */}
            {step === 5 && (
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
                    <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Key Attributes</div>
                    <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                      {Object.entries(character.attributes)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 2)
                        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
                        .join(', ')}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ color: 'var(--color-cloud)', marginBottom: '0.25rem' }}>Good At Skills</div>
                    <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                      {Object.entries(character.skills)
                        .filter(([,skill]) => skill.isGoodAt)
                        .map(([key]) => SKILL_NAMES[key as keyof typeof SKILL_NAMES] || key)
                        .join(', ') || 'None selected'}
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
              
              {step < 5 ? (
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