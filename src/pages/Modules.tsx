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
  moduleId: string | Module;
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
    return character?.modules.some((m) => {
      // Handle both populated and unpopulated moduleId cases
      if (typeof m.moduleId === 'string') {
        return m.moduleId === moduleId;
      } else {
        return m.moduleId._id === moduleId;
      }
    }) || false;
  };

  // Get the character module for a given module ID
  const getCharacterModule = (moduleId: string) => {
    return character?.modules.find((m) => {
      // Handle both populated and unpopulated moduleId cases
      if (typeof m.moduleId === 'string') {
        return m.moduleId === moduleId;
      } else {
        return m.moduleId._id === moduleId;
      }
    });
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

    // For tier 2 and above, check if prerequisite tiers are selected
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
        const previousTier = (tier - 1).toString();
        const charModule = getCharacterModule(module._id);

        // Check if any option from the previous tier is selected
        return charModule?.selectedOptions.some((o) => o.location.startsWith(previousTier)) || false;
      } else {
        // Need to check if any option from the previous tier is selected
        const previousTier = (tier - 1).toString();
        const charModule = getCharacterModule(module._id);

        // Check if any option from the previous tier is selected
        return charModule?.selectedOptions.some((o) => o.location.startsWith(previousTier)) || false;
      }
    }
  };

  // Handle selecting a module and its first option
  const handleSelectOption = async (moduleId: string, location: string) => {
    try {
      // If this is tier 1 and the module isn't added yet, add module first
      if (location === '1' && !isModuleSelected(moduleId)) {
        // Add the module first
        const addModuleResponse = await fetch(`/api/characters/${characterId}/modules/${moduleId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!addModuleResponse.ok) {
          throw new Error('Failed to add module');
        }
        
        // Then select the option
        const selectOptionResponse = await fetch(`/api/characters/${characterId}/modules/${moduleId}/options`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ location }),
        });

        if (!selectOptionResponse.ok) {
          throw new Error('Failed to select option');
        }

        const updatedCharacter = await selectOptionResponse.json();
        setCharacter(updatedCharacter);
      } else {
        // Just select the option (module already added)
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
      }
    } catch (err) {
      console.error('Error selecting option:', err);
      setError(err instanceof Error ? err.message : 'Failed to select option');
    }
  };

  // Handle deselecting a module option
  const handleDeselectOption = async (moduleId: string, location: string) => {
    try {
      // If this is tier 1, deselecting it will remove the entire module
      if (location === '1') {
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
      } else {
        // Just deselect the option
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
      }
    } catch (err) {
      console.error('Error deselecting option:', err);
      setError(err instanceof Error ? err.message : 'Failed to deselect option');
    }
  };

  // Handle clicking on a module in the list (just to view, not add)
  const handleViewModule = (module: Module) => {
    setSelectedModule(module);
  };

  // Check if user has enough module points
  const hasEnoughPoints = (cost: number = 1) => {
    return ((character?.modulePoints.total || 0) - (character?.modulePoints.spent || 0)) >= cost;
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
            {(character?.modulePoints?.total || 0) - (character?.modulePoints?.spent || 0)}
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
                            : isModuleSelected(module._id) 
                              ? '1px solid var(--color-sat-purple)'
                              : '1px solid transparent',
                      }}
                      onClick={() => handleViewModule(module)}
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

                        {isModuleSelected(module._id) && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <div
                              style={{
                                width: '0.5rem',
                                height: '0.5rem',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-metal-gold)',
                              }}
                            ></div>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-metal-gold)',
                              }}
                            >
                              Added
                            </span>
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
                </div>
              </CardHeader>

              <CardBody>
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

                    // Check if it's an odd tier (1, 3, 5) or even (2, 4, etc)
                    const isOddTier = parseInt(tier) % 2 === 1;

                    return (
                      <div key={tier} style={{ marginBottom: '0.25rem' }}>
                        {/* Module options grid layout */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isOddTier ? '1fr' : '1fr 1fr',
                            gap: '0.75rem',
                            justifyItems: 'center',
                            width: '100%',
                          }}
                        >
                          {tierOptions.map((option) => {
                            // Adjust width based on tier
                            const optionWidth = isOddTier ? '50%' : '100%';
                            const isSelected = isOptionSelected(selectedModule._id, option.location);
                            
                            // For Tier 1, always make it selectable if module isn't added yet
                            // For other tiers, check prerequisites
                            const canSelect = option.location === '1' 
                              ? true 
                              : (isModuleSelected(selectedModule._id) && canSelectOption(selectedModule, option.location));
                            
                            const hasEnoughPointsForOption = hasEnoughPoints(1);

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
                                  width: optionWidth,
                                  cursor: canSelect && (isSelected || hasEnoughPointsForOption) ? 'pointer' : 'not-allowed',
                                  opacity: !canSelect || (!isSelected && !hasEnoughPointsForOption) ? 0.5 : 1,
                                  position: 'relative',
                                  textAlign: 'center'
                                }}
                                onClick={() => {
                                  if (canSelect && (isSelected || hasEnoughPointsForOption)) {
                                    isSelected
                                      ? handleDeselectOption(selectedModule._id, option.location)
                                      : handleSelectOption(selectedModule._id, option.location);
                                  }
                                }}
                              >
                                {/* Tier indicator in top right */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    color: 'var(--color-cloud)',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {option.location}
                                </div>

                                <div
                                  style={{
                                    color: 'var(--color-white)',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    marginBottom: '0.5rem',
                                    marginTop: '0.5rem'
                                  }}
                                >
                                  {option.name}
                                </div>
                                <p
                                  style={{
                                    color: 'var(--color-cloud)',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {option.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
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