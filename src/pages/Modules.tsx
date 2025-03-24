// src/pages/ModulesPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

// Type definitions
interface ModuleOption {
  name: string;
  description: string;
  location: string;
  data: string;
  selected?: boolean;
}

interface Module {
  _id: string;
  name: string;
  mtype: 'racial' | 'core' | 'secondary';
  ruleset: number;
  options: ModuleOption[];
}

interface SelectedOption {
  location: string;
  selectedAt: string;
}

interface CharacterModule {
  moduleId: {
    _id: string;
    name: string;
    mtype: string;
    ruleset: number;
    options: ModuleOption[];
  };
  selectedOptions: SelectedOption[];
}

interface Character {
  _id: string;
  name: string;
  modulePoints: {
    total: number;
    spent: number;
  };
  modules: CharacterModule[];
}

const ModulesPage: React.FC = () => {
  const { id: characterId } = useParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Filter for module types
  const [activeTab, setActiveTab] = useState<'all' | 'racial' | 'core' | 'secondary'>('all');

  // Fetch character and modules data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch character data
        const characterResponse = await fetch(`/api/characters/${characterId}`);
        if (!characterResponse.ok) {
          throw new Error('Failed to fetch character data');
        }
        const characterData = await characterResponse.json();
        setCharacter(characterData);

        // Fetch all modules
        const modulesResponse = await fetch('/api/modules');
        if (!modulesResponse.ok) {
          throw new Error('Failed to fetch modules');
        }
        const modulesData = await modulesResponse.json();
        setAllModules(modulesData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, [characterId]);

  // Filter modules based on active tab
  const filteredModules =
    activeTab === 'all' ? allModules : allModules.filter((module) => module.mtype === activeTab);

  // Check if a module is selected by the character
  const isModuleSelected = (moduleId: string) => {
    return character?.modules.some((m) => m.moduleId._id === moduleId) || false;
  };

  // Get the character module for a given module ID
  const getCharacterModule = (moduleId: string) => {
    return character?.modules.find((m) => m.moduleId._id === moduleId);
  };

  // Check if an option is selected by the character
  const isOptionSelected = (moduleId: string, location: string) => {
    const charModule = getCharacterModule(moduleId);
    return charModule?.selectedOptions.some((o) => o.location === location) || false;
  };

  // Check if an option can be selected (prerequisites met)
  const canSelectOption = (module: Module, location: string) => {
    // Always allow tier 1
    if (location === '1') return true;

    // Get parent tier number (e.g., "2" from "2a")
    const tierMatch = location.match(/^(\d+)/);
    if (!tierMatch) return false;

    const tier = parseInt(tierMatch[1]);

    // For tier 2 and above, check if the previous tier is selected
    if (tier === 2) {
      // For tier 2, check if tier 1 is selected
      return isOptionSelected(module._id, '1');
    } else {
      // For tier 3+, either:
      // 1. If it's a sub-option (e.g. "3a", "3b"), check if a tier 2 option is selected
      // 2. If it's a main tier (e.g. "3"), check if any previous tier is selected

      const isSubOption = location.length > 1; // Like "3a", "4b", etc.

      if (isSubOption) {
        // Need to check if the parent tier is selected
        const parentTier = location.substring(0, 1);
        const charModule = getCharacterModule(module._id);

        // Check if any option from the previous tier is selected
        return charModule?.selectedOptions.some((o) => o.location.startsWith(parentTier)) || false;
      } else {
        // Need to check if any option from the previous tier is selected
        const previousTier = (tier - 1).toString();
        const charModule = getCharacterModule(module._id);

        // Check if any option from the previous tier is selected
        return (
          charModule?.selectedOptions.some((o) => o.location.startsWith(previousTier)) || false
        );
      }
    }
  };

  const handleSelectModule = async (moduleId: string) => {
    try {
      // Check if already selected
      if (isModuleSelected(moduleId)) {
        // If already selected, show the module details
        setSelectedModule(allModules.find((m) => m._id === moduleId) || null);
        return;
      }
  
      // Add module to character
      const response = await fetch(`/api/characters/${characterId}/modules/${moduleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to add module');
      }
  
      const updatedCharacter = await response.json();
      setCharacter(updatedCharacter);
  
      // Show the module details
      setSelectedModule(allModules.find((m) => m._id === moduleId) || null);
    } catch (err) {
      console.error('Error selecting module:', err);
      setError(err instanceof Error ? err.message : 'Failed to select module');
    }
  };
  

  // Handle removing a module
  const handleRemoveModule = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/characters/${characterId}/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove module');
      }

      const updatedCharacter = await response.json();
      setCharacter(updatedCharacter);

      if (selectedModule && selectedModule._id === moduleId) {
        setSelectedModule(null);
      }
    } catch (err) {
      console.error('Error removing module:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove module');
    }
  };

  // Handle selecting a module option
  const handleSelectOption = async (moduleId: string, location: string) => {
    try {
      const response = await fetch(`/api/characters/${characterId}/modules/${moduleId}/options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        throw new Error('Failed to select option');
      }

      const updatedCharacter = await response.json();
      setCharacter(updatedCharacter);
    } catch (err) {
      console.error('Error selecting option:', err);
      setError(err instanceof Error ? err.message : 'Failed to select option');
    }
  };

  // Handle deselecting a module option
  const handleDeselectOption = async (moduleId: string, location: string) => {
    try {
      const response = await fetch(
        `/api/characters/${characterId}/modules/${moduleId}/options/${location}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to deselect option');
      }

      const updatedCharacter = await response.json();
      setCharacter(updatedCharacter);
    } catch (err) {
      console.error('Error deselecting option:', err);
      setError(err instanceof Error ? err.message : 'Failed to deselect option');
    }
  };

  const getOptionCost = (location: string): number => {
    // New simplified cost structure
    return 1;
  };
  

  // Format data string for display
  const formatDataString = (dataString: string) => {
    if (!dataString) return null;

    const effects = dataString.split(':');
    const formattedEffects = effects.map((effect) => {
      // Match patterns and translate them
      if (effect.startsWith('AV=')) {
        return `Movement +${effect.substring(3)}`;
      }
      if (effect.startsWith('AH=')) {
        return `Health +${effect.substring(3)}`;
      }
      if (effect.match(/^AD\d+=\d+$/)) {
        const code = effect.substring(2, 3);
        const value = effect.substring(4);
        const mitigationTypes = {
          '1': 'Kinetic',
          '2': 'Cold',
          '3': 'Heat',
          '4': 'Electrical',
          '5': 'Mental',
          '6': 'Toxic',
          '7': 'Sonic',
          '8': 'Radiation',
        };
        const mitigation = mitigationTypes[code as keyof typeof mitigationTypes] || 'Unknown';
        return `${mitigation} Mitigation +${value}`;
      }
      if (effect.match(/^AS[A-Z\d]+=\d+$/)) {
        const code = effect.substring(2, 3);
        const value = effect.substring(4);
        const skillTypes = {
          '1': 'Fitness',
          '2': 'Deflect',
          '3': 'Might',
          '4': 'Evade',
          '5': 'Stealth',
          '6': 'Coordination',
          '7': 'Resilience',
          '8': 'Concentration',
          '9': 'Senses',
          A: 'Science',
          B: 'Technology',
          C: 'Medicine',
          D: 'Xenology',
          E: 'Negotiation',
          F: 'Behavior',
          G: 'Presence',
        };
        const skill = skillTypes[code as keyof typeof skillTypes] || 'Unknown Skill';
        return `${skill} +${value}`;
      }
      if (effect.match(/^AC\d+=\d+$/)) {
        const code = effect.substring(2, 3);
        const value = effect.substring(4);
        const craftTypes = {
          '1': 'Engineering',
          '2': 'Fabrication',
          '3': 'Biosculpting',
          '4': 'Synthesis',
        };
        const craft = craftTypes[code as keyof typeof craftTypes] || 'Unknown Craft';
        return `${craft} +${value}`;
      }
      if (effect.startsWith('TG')) {
        return 'Trait';
      }
      if (effect.startsWith('ZX')) {
        return 'Reaction';
      }
      if (effect.startsWith('XX')) {
        return 'Action';
      }
      if (effect === 'Y') {
        return 'Free Action';
      }

      // Return the raw code if we don't have a translation
      return effect;
    });

    // If there are no translated effects, return null
    if (formattedEffects.every((e) => !e)) return null;

    // Return the formatted effects as a list
    return (
      <ul className="text-xs text-gray-400 mt-2">
        {formattedEffects.map((effect, index) => effect && <li key={index}>{effect}</li>)}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '2rem',
          backgroundColor: 'rgba(152, 94, 109, 0.2)',
          borderRadius: '0.5rem',
          border: '1px solid var(--color-sunset)',
          color: 'var(--color-white)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Error</h2>
        <p>{error}</p>
        <div style={{ marginTop: '1rem' }}>
          <Button variant="accent" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
          }}
        >
          Character Modules
        </h1>

        <div
          style={{
            backgroundColor: 'var(--color-dark-elevated)',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'var(--color-metal-gold)',
          }}
        >
          Module Points:{' '}
          <span style={{ fontWeight: 'bold' }}>
            {character?.modulePoints.total - character?.modulePoints.spent || 0}
          </span>{' '}
          / {character?.modulePoints.total || 0}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/characters/${characterId}`}>
          <Button variant="secondary">&larr; Back to Character</Button>
        </Link>
      </div>

      {/* Module type tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        <Button
          variant={activeTab === 'all' ? 'accent' : 'secondary'}
          onClick={() => setActiveTab('all')}
        >
          All Modules
        </Button>
        <Button
          variant={activeTab === 'racial' ? 'accent' : 'secondary'}
          onClick={() => setActiveTab('racial')}
        >
          Racial
        </Button>
        <Button
          variant={activeTab === 'core' ? 'accent' : 'secondary'}
          onClick={() => setActiveTab('core')}
        >
          Core
        </Button>
        <Button
          variant={activeTab === 'secondary' ? 'accent' : 'secondary'}
          onClick={() => setActiveTab('secondary')}
        >
          Secondary
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Modules list */}
        <div className="md:col-span-1">
          <Card variant="default">
            <CardHeader>
              <h2
                style={{
                  color: 'var(--color-white)',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                }}
              >
                Available Modules
              </h2>
            </CardHeader>
            <CardBody>
              {filteredModules.length === 0 ? (
                <div style={{ color: 'var(--color-cloud)', padding: '1rem' }}>
                  No modules available
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {filteredModules.map((module) => (
                    <div
                      key={module._id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.375rem',
                        backgroundColor: isModuleSelected(module._id)
                          ? 'var(--color-sat-purple-faded)'
                          : 'var(--color-dark-elevated)',
                        cursor: 'pointer',
                        border:
                          selectedModule?._id === module._id
                            ? '1px solid var(--color-metal-gold)'
                            : '1px solid transparent',
                      }}
                      onClick={() => handleSelectModule(module._id)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color: 'var(--color-white)',
                              fontWeight: 'bold',
                            }}
                          >
                            {module.name}
                          </div>
                          <div
                            style={{
                              color: 'var(--color-cloud)',
                              fontSize: '0.75rem',
                              textTransform: 'capitalize',
                            }}
                          >
                            {module.mtype}
                          </div>
                        </div>

                        {isModuleSelected(module._id) ? (
                          <div
                            style={{
                              width: '0.5rem',
                              height: '0.5rem',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-metal-gold)',
                            }}
                          ></div>
                        ) : (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--color-cloud)',
                            }}
                          >
                            2 pts
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Module details */}
        <div className="md:col-span-2">
          {selectedModule ? (
            <Card variant="default">
              <CardHeader>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h2
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {selectedModule.name}
                  </h2>

                  {isModuleSelected(selectedModule._id) ? (
                    <Button
                      variant="outline"
                      onClick={() => handleRemoveModule(selectedModule._id)}
                    >
                      Remove Module
                    </Button>
                  ) : (
                    <div style={{ color: 'var(--color-cloud)' }}>Cost: 2 points</div>
                  )}
                </div>
              </CardHeader>

              <CardBody>
                {!isModuleSelected(selectedModule._id) ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--color-cloud)', marginBottom: '1rem' }}>
                      Select this module to add it to your character.
                    </p>
                    <Button
                      variant="accent"
                      onClick={() => handleSelectModule(selectedModule._id)}
                      disabled={
                        (character?.modulePoints.total || 0) -
                          (character?.modulePoints.spent || 0) <
                        2
                      }
                    >
                      Add Module (2 points)
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3
                        style={{
                          color: 'var(--color-metal-gold)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Module Options
                      </h3>
                      <p style={{ color: 'var(--color-cloud)' }}>
                        Select options to customize your character. Each tier requires selection
                        from the previous tier.
                      </p>
                    </div>

                    {/* Module skill tree */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Group options by tier */}
                      {Array.from(
                        new Set(
                          selectedModule.options.map(
                            (option) => option.location.match(/^(\d+)/)?.[1] || ''
                          )
                        )
                      ).map((tier) => {
                        // Filter options for this tier
                        const tierOptions = selectedModule.options.filter((option) =>
                          option.location.startsWith(tier)
                        );

                        return (
                          <div key={tier}>
                            <div
                              style={{
                                color: 'var(--color-white)',
                                fontWeight: 'bold',
                                marginBottom: '0.5rem',
                              }}
                            >
                              Tier {tier}
                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '1rem',
                              }}
                            >
                              {tierOptions.map((option) => {
                                const isSelected = isOptionSelected(
                                  selectedModule._id,
                                  option.location
                                );
                                const canSelect =
                                  isModuleSelected(selectedModule._id) &&
                                  canSelectOption(selectedModule, option.location);
                                const optionCost = getOptionCost(option.location);
                                const hasEnoughPoints =
                                  (character?.modulePoints.total || 0) -
                                    (character?.modulePoints.spent || 0) >=
                                  optionCost;

                                return (
                                  <div
                                    key={option.location}
                                    style={{
                                      padding: '1rem',
                                      borderRadius: '0.375rem',
                                      backgroundColor: isSelected
                                        ? 'var(--color-sat-purple-faded)'
                                        : 'var(--color-dark-elevated)',
                                      border: isSelected
                                        ? '1px solid var(--color-metal-gold)'
                                        : '1px solid var(--color-dark-border)',
                                      opacity: !isSelected && !canSelect ? 0.5 : 1,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem',
                                      }}
                                    >
                                      <div
                                        style={{
                                          color: 'var(--color-white)',
                                          fontWeight: 'bold',
                                        }}
                                      >
                                        {option.name}
                                      </div>
                                      <div
                                        style={{
                                          color: 'var(--color-cloud)',
                                          fontSize: '0.75rem',
                                        }}
                                      >
                                        {option.location}
                                      </div>
                                    </div>

                                    <p
                                      style={{
                                        color: 'var(--color-cloud)',
                                        fontSize: '0.875rem',
                                        marginBottom: '0.5rem',
                                      }}
                                    >
                                      {option.description}
                                    </p>

                                    {/* Display formatted data if available */}
                                    {option.data && formatDataString(option.data)}

                                    <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                                      {isSelected ? (
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          onClick={() =>
                                            handleDeselectOption(
                                              selectedModule._id,
                                              option.location
                                            )
                                          }
                                        >
                                          Deselect
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="accent"
                                          size="sm"
                                          disabled={!canSelect || !hasEnoughPoints}
                                          onClick={() =>
                                            handleSelectOption(selectedModule._id, option.location)
                                          }
                                        >
                                          Select ({optionCost} pts)
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-dark-surface)',
                borderRadius: '0.5rem',
                padding: '3rem',
                height: '100%',
              }}
            >
              <div style={{ color: 'var(--color-cloud)', textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem' }}>
                  Select a module from the list to view details
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  Modules allow you to customize and improve your character's abilities
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModulesPage;
