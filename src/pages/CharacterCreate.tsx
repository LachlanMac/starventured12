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

// Skill mappings by attribute category
const ATTRIBUTE_SKILLS = {
  physique: [
    { id: 'fitness', name: 'Fitness' },
    { id: 'deflect', name: 'Deflect' },
    { id: 'might', name: 'Might' },
  ],
  agility: [
    { id: 'evade', name: 'Evade' },
    { id: 'stealth', name: 'Stealth' },
    { id: 'coordination', name: 'Coordination' },
  ],
  mind: [
    { id: 'resilience', name: 'Resilience' },
    { id: 'concentration', name: 'Concentration' },
    { id: 'senses', name: 'Senses' },
  ],
  knowledge: [
    { id: 'science', name: 'Science' },
    { id: 'technology', name: 'Technology' },
    { id: 'medicine', name: 'Medicine' },
    { id: 'xenology', name: 'Xenology' },
  ],
  social: [
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'behavior', name: 'Behavior' },
    { id: 'presence', name: 'Presence' },
  ],
};

// Specialized skills that don't depend on attributes
const SPECIALIZED_SKILLS = [
  { id: 'rangedWeapons', name: 'Ranged Weapons', defaultTalent: 1 },
  { id: 'meleeWeapons', name: 'Melee Weapons', defaultTalent: 1 },
  { id: 'weaponSystems', name: 'Weapon Systems', defaultTalent: 0 },
  { id: 'heavyRangedWeapons', name: 'Heavy Ranged Weapons', defaultTalent: 0 },
];

// Crafting skills
const CRAFTING_SKILLS = [
  { id: 'engineering', name: 'Engineering' },
  { id: 'fabrication', name: 'Fabrication' },
  { id: 'biosculpting', name: 'Biosculpting' },
  { id: 'synthesis', name: 'Synthesis' },
];

// Dice mapping from value 1-6 to dice types
const DICE_TYPES = ['1d4', '1d6', '1d8', '1d10', '1d12', '1d20'];

const CharacterCreate: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tracking for attribute and talent points
  const [attributePointsRemaining, setAttributePointsRemaining] = useState<number>(5);
  const [talentStarsRemaining, setTalentStarsRemaining] = useState<number>(5);
  
  // Initialize skills for each attribute
  const initializeSkills = () => {
    const skills: Record<string, { value: number, talent: number }> = {};
    
    Object.values(ATTRIBUTE_SKILLS).forEach(skillGroup => {
      skillGroup.forEach(skill => {
        skills[skill.id] = { value: 1, talent: 0 }; // Start with 1d4 and talent based on attribute
      });
    });
    
    return skills;
  };
  
  // Initialize weapon skills
  const initializeWeaponSkills = () => {
    const weaponSkills: Record<string, { value: number, talent: number }> = {};
    
    SPECIALIZED_SKILLS.forEach(skill => {
      weaponSkills[skill.id] = { value: 1, talent: skill.defaultTalent }; // Start with 1d4 and default talent
    });
    
    return weaponSkills;
  };
  
  // Initialize crafting skills
  const initializeCraftingSkills = () => {
    const craftingSkills: Record<string, { value: number, talent: number }> = {};
    
    CRAFTING_SKILLS.forEach(skill => {
      craftingSkills[skill.id] = { value: 1, talent: 0 }; // Start with 1d4 and 0 talent
    });
    
    return craftingSkills;
  };
  
  // Character state
  const [character, setCharacter] = useState({
    name: '',
    race: '',
    modulePoints: {
      total: 10,
      spent: 0
    },
    attributes: {
      physique: 1,
      agility: 1,
      mind: 1,
      knowledge: 1,
      social: 1
    },
    skills: initializeSkills(),
    weaponSkills: initializeWeaponSkills(),
    craftingSkills: initializeCraftingSkills(),
    level: 1,
    physicalTraits: {
      size: '',
      weight: '',
      height: '',
      gender: ''
    },
    biography: '',
    appearance: '',
    characterCreation: {
      attributePointsRemaining: 5,
      talentStarsRemaining: 5
    },
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
    
    // Check if there are enough points and if the value is within bounds
    if (attributePointsRemaining + pointDifference < 0) {
      // Not enough points
      return;
    }
    
    if (newValue < 1 || newValue > 3) {
      // Outside valid range
      return;
    }
    
    // Update the attribute
    const newAttributes = {
      ...character.attributes,
      [attribute]: newValue
    };
    
    // Update skills talent based on new attribute value
    const newSkills = { ...character.skills };
    
    // Update the talent for all skills in this attribute group
    if (ATTRIBUTE_SKILLS[attribute as keyof typeof ATTRIBUTE_SKILLS]) {
      ATTRIBUTE_SKILLS[attribute as keyof typeof ATTRIBUTE_SKILLS].forEach(skill => {
        newSkills[skill.id] = {
          ...newSkills[skill.id],
          talent: newValue // Attribute value determines talent for related skills
        };
      });
    }
    
    setCharacter(prev => ({
      ...prev,
      attributes: newAttributes,
      skills: newSkills
    }));
    
    setAttributePointsRemaining(prev => prev + pointDifference);
  };

  // Update skill value (dice type)
  const updateSkillValue = (skillId: string, newValue: number) => {
    if (newValue < 1 || newValue > 6) {
      return; // Invalid value
    }
    
    setCharacter(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillId]: {
          ...prev.skills[skillId],
          value: newValue
        }
      }
    }));
  };

  // Update specialized skill talent
  const updateSpecializedSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 3) {
      return; // Invalid value
    }
    
    const oldTalent = character.weaponSkills[skillId as keyof typeof character.weaponSkills].talent;
    const starDifference = oldTalent - newTalent;
    
    if (talentStarsRemaining + starDifference < 0) {
      // Not enough talent stars
      return;
    }
    
    setCharacter(prev => ({
      ...prev,
      weaponSkills: {
        ...prev.weaponSkills,
        [skillId]: {
          ...prev.weaponSkills[skillId as keyof typeof prev.weaponSkills],
          talent: newTalent
        }
      }
    }));
    
    setTalentStarsRemaining(prev => prev + starDifference);
  };

  // Update crafting skill talent
  const updateCraftingSkillTalent = (skillId: string, newTalent: number) => {
    if (newTalent < 0 || newTalent > 3) {
      return; // Invalid value
    }
    
    const oldTalent = character.craftingSkills[skillId as keyof typeof character.craftingSkills].talent;
    const starDifference = oldTalent - newTalent;
    
    if (talentStarsRemaining + starDifference < 0) {
      // Not enough talent stars
      return;
    }
    
    setCharacter(prev => ({
      ...prev,
      craftingSkills: {
        ...prev.craftingSkills,
        [skillId]: {
          ...prev.craftingSkills[skillId as keyof typeof prev.craftingSkills],
          talent: newTalent
        }
      }
    }));
    
    setTalentStarsRemaining(prev => prev + starDifference);
  };

  // Render talent stars
  const renderTalentStars = (talent: number, maxTalent: number = 3) => {
    return (
      <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
        {Array.from({ length: maxTalent }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '1rem',
              height: '1rem',
              borderRadius: '50%',
              backgroundColor: i < talent ? 'var(--color-metal-gold)' : 'var(--color-dark-elevated)',
              border: '1px solid var(--color-metal-gold)'
            }}
          />
        ))}
      </div>
    );
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
      
      case 2:
        // Check if all attribute points have been spent
        if (attributePointsRemaining > 0) {
          setError(`You still have ${attributePointsRemaining} attribute points to spend`);
          return false;
        }
        return true;
        
      case 3:
        // Check if all talent stars have been spent
        if (talentStarsRemaining > 0) {
          setError(`You still have ${talentStarsRemaining} talent stars to assign`);
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
        skills: character.skills,
        weaponSkills: character.weaponSkills,
        craftingSkills: character.craftingSkills,
        modulePoints: character.modulePoints,
        level: character.level,
        userId: character.userId,
        biography: character.biography,
        appearance: character.appearance,
        physicalTraits: character.physicalTraits,
        characterCreation: {
          attributePointsRemaining: attributePointsRemaining,
          talentStarsRemaining: talentStarsRemaining
        }
      };

      // In a real app, this would call your API
      console.log("Calling API");
      const response = await fetch(`/api/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
                "Talents",
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
                  {index < 3 && (
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
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        const level = Math.floor(value / 10);
                        updateCharacter('modulePoints', {
                          total: value,
                          spent: 0
                        });
                        updateCharacter('level', level > 0 ? level : 1);
                      }}
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
                
                <div style={{ 
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginTop: '2rem'
                }}>
                  <h3 style={{ 
                    color: 'var(--color-white)',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>
                    Character Creation Point System
                  </h3>
                  <p style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                    In the next steps, you will distribute <strong style={{ color: 'var(--color-metal-gold)' }}>5 attribute points</strong> and <strong style={{ color: 'var(--color-metal-gold)' }}>5 talent stars</strong>. 
                    Attributes determine how many dice you roll for related skills, while talent stars determine specialized skills not tied to attributes.
                  </p>
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
                    color: attributePointsRemaining > 0 ? 'var(--color-metal-gold)' : 'var(--color-white)'
                  }}>
                    Points Remaining: <span style={{ fontWeight: 'bold' }}>{attributePointsRemaining}</span>
                  </div>
                </div>
                
                <p style={{ 
                  color: 'var(--color-cloud)',
                  marginBottom: '1.5rem'
                }}>
                  Attributes define your character's basic capabilities. Each attribute has a maximum value of 3 and determines the number of dice you roll for related skills.
                  All attributes start at 1.
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
                          disabled={character.attributes[attribute.id as keyof typeof character.attributes] >= 3 || attributePointsRemaining <= 0}
                          onClick={() => updateAttribute(attribute.id, Math.min(3, character.attributes[attribute.id as keyof typeof character.attributes] + 1))}
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '0.375rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            color: 'var(--color-white)',
                            border: 'none',
                            cursor: (character.attributes[attribute.id as keyof typeof character.attributes] >= 3 || attributePointsRemaining <= 0) ? 'not-allowed' : 'pointer',
                            opacity: (character.attributes[attribute.id as keyof typeof character.attributes] >= 3 || attributePointsRemaining <= 0) ? 0.5 : 1
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
                            width: `${(character.attributes[attribute.id as keyof typeof character.attributes] / 3) * 100}%`,
                            backgroundColor: 'var(--color-sat-purple)',
                            borderRadius: '0.375rem',
                            transition: 'width 0.3s'
                          }} />
                        </div>
                      </div>
                      
                      {/* Show related skills */}
                      <div style={{ 
                        marginTop: '0.5rem', 
                        paddingLeft: '0.5rem', 
                        borderLeft: '2px solid var(--color-dark-border)'
                      }}>
                        <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          Related skills: 
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {ATTRIBUTE_SKILLS[attribute.id as keyof typeof ATTRIBUTE_SKILLS].map(skill => (
                            <div key={skill.id} style={{ 
                              backgroundColor: 'var(--color-dark-elevated)',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              color: 'var(--color-white)'
                            }}>
                              {skill.name} ({character.attributes[attribute.id as keyof typeof character.attributes]} dice)
                            </div>
                          ))}
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
                  <h3 style={{ color: 'var(--color-metal-gold)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Dice System
                  </h3>
                  <p style={{ color: 'var(--color-cloud)' }}>
                    For skill checks, you'll roll a number of dice equal to your attribute value (1-3). 
                    Each skill has a die type from 1d4 to 1d20 that you'll set in the next step.
                  </p>
                </div>
              </div>
            )}
            
{/* Step 3: Talents */}
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
                    Talents & Specialized Skills
                  </h2>
                  <div style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    color: talentStarsRemaining > 0 ? 'var(--color-metal-gold)' : 'var(--color-white)'
                  }}>
                    Talent Stars: <span style={{ fontWeight: 'bold' }}>{talentStarsRemaining}</span>
                  </div>
                </div>
                
                <p style={{ 
                  color: 'var(--color-cloud)',
                  marginBottom: '1.5rem'
                }}>
                  Assign talent stars to specialized skills that don't depend on attributes. 
                  Ranged and Melee weapons start with 1 talent star by default.
                </p>
                
                {/* Weapon Skills */}
                <div>
                  <h3 style={{ 
                    color: 'var(--color-white)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem' 
                  }}>
                    Weapon Skills
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {SPECIALIZED_SKILLS.map(skill => (
                      <div key={skill.id} style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          color: 'var(--color-white)', 
                          fontWeight: 'bold'
                        }}>
                          {skill.name}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[1, 2, 3].map(talentPosition => {
                            const isFilled = character.weaponSkills[skill.id as keyof typeof character.weaponSkills].talent >= talentPosition;
                            
                            // Determine if this is the first star (position 1)
                            const isFirstStar = talentPosition === 1;
                            
                            // Calculate if this star can be toggled based on current talent and available stars
                            // First star (position 1) for weapon skills can't be toggled off
                            const canToggleOn = !isFilled && character.weaponSkills[skill.id as keyof typeof character.weaponSkills].talent === talentPosition - 1 && talentStarsRemaining > 0;
                            const canToggleOff = isFilled && talentPosition === character.weaponSkills[skill.id as keyof typeof character.weaponSkills].talent && !isFirstStar;
                            
                            return (
                              <button
                                key={talentPosition}
                                onClick={() => {
                                  if (isFilled && canToggleOff) {
                                    // If star is filled and it's the highest filled star (and not the first star), turn it off
                                    updateSpecializedSkillTalent(skill.id, talentPosition - 1);
                                  } else if (!isFilled && canToggleOn) {
                                    // If star is empty and it's the next one in sequence, turn it on
                                    updateSpecializedSkillTalent(skill.id, talentPosition);
                                  }
                                }}
                                disabled={!canToggleOn && !canToggleOff}
                                style={{
                                  width: '1.5rem',
                                  height: '1.5rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: (canToggleOn || canToggleOff) ? 'pointer' : 'default',
                                  opacity: (canToggleOn || canToggleOff || isFilled) ? 1 : 0.5,
                                  color: isFilled ? 'var(--color-metal-gold)' : 'var(--color-dark-surface)',
                                  fontSize: '1.25rem'
                                }}
                                aria-label={`Set talent to ${talentPosition}`}
                              >
                                {/* Star symbol */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFilled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Crafting Skills */}
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ 
                    color: 'var(--color-white)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem' 
                  }}>
                    Crafting Skills
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {CRAFTING_SKILLS.map(skill => (
                      <div key={skill.id} style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          color: 'var(--color-white)', 
                          fontWeight: 'bold'
                        }}>
                          {skill.name}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[1, 2, 3].map(talentPosition => {
                            const isFilled = character.craftingSkills[skill.id as keyof typeof character.craftingSkills].talent >= talentPosition;
                            // Calculate if this star can be toggled based on current talent and available stars
                            const canToggleOn = !isFilled && character.craftingSkills[skill.id as keyof typeof character.craftingSkills].talent === talentPosition - 1 && talentStarsRemaining > 0;
                            const canToggleOff = isFilled && talentPosition === character.craftingSkills[skill.id as keyof typeof character.craftingSkills].talent;
                            
                            return (
                              <button
                                key={talentPosition}
                                onClick={() => {
                                  if (isFilled && canToggleOff) {
                                    // If star is filled and it's the highest filled star, turn it off
                                    updateCraftingSkillTalent(skill.id, talentPosition - 1);
                                  } else if (!isFilled && canToggleOn) {
                                    // If star is empty and it's the next one in sequence, turn it on
                                    updateCraftingSkillTalent(skill.id, talentPosition);
                                  }
                                }}
                                disabled={!canToggleOn && !canToggleOff}
                                style={{
                                  width: '1.5rem',
                                  height: '1.5rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: (canToggleOn || canToggleOff) ? 'pointer' : 'default',
                                  opacity: (canToggleOn || canToggleOff || isFilled) ? 1 : 0.5,
                                  color: isFilled ? 'var(--color-metal-gold)' : 'var(--color-dark-surface)',
                                  fontSize: '1.25rem'
                                }}
                                aria-label={`Set talent to ${talentPosition}`}
                              >
                                {/* Star symbol */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFilled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  marginTop: '2rem'
                }}>
                  <h3 style={{ color: 'var(--color-metal-gold)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Talent System
                  </h3>
                  <p style={{ color: 'var(--color-cloud)' }}>
                    Each talent star represents a die you roll when using that skill. For example, if you have 2 talent stars in Ranged Weapons,
                    you'll roll 2 dice for ranged weapon checks.
                  </p>
                </div>
              </div>
            )}

            
            {/* Step 4: Background */}
            {step === 4 && (
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
              
              {step < 4 ? (
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