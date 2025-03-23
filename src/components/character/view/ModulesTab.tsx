import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import Card, { CardHeader, CardBody } from '../../ui/Card';

interface ModuleOption {
  name: string;
  location: string;
  description: string;
}

interface Module {
  moduleId: {
    _id: string;
    name: string;
    options?: ModuleOption[];
  };
  selectedOptions: {
    location: string;
    selectedAt: string;
  }[];
}

interface ModulesTabProps {
  characterId: string;
  modules: Module[];
}

const ModulesTab: React.FC<ModulesTabProps> = ({ characterId, modules }) => {
  return (
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

        <Link to={`/characters/${characterId}/modules`}>
          <Button variant="accent" size="sm">
            Manage Modules
          </Button>
        </Link>
      </div>

      {!modules || modules.length === 0 ? (
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
          <Link to={`/characters/${characterId}/modules`}>
            <Button variant="accent">Add Modules</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((module) => (
            <Card key={module.moduleId?._id || 'unknown'} variant="default">
              <CardHeader>
                <h3 style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                  {module.moduleId?.name || 'Module'}
                </h3>
              </CardHeader>
              <CardBody>
                <div style={{ color: 'var(--color-cloud)', marginBottom: '0.5rem' }}>
                  Selected Options:
                </div>
                {module.selectedOptions && module.selectedOptions.length > 0 ? (
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
                    {module.selectedOptions.map((option) => {
                      const optionDetails = module.moduleId?.options?.find(
                        (o) => o.location === option.location
                      );
                      return (
                        <li key={option.location} style={{ marginBottom: '0.25rem' }}>
                          {optionDetails ? optionDetails.name : `Option ${option.location}`}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--color-cloud)', fontStyle: 'italic' }}>
                    No options selected
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModulesTab;