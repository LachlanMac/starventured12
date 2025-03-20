// server/utils/moduleSeeder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Module from '../models/Module.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to modules data directory
const modulesDir = path.resolve(__dirname, '../../data/modules');

// Function to read JSON modules from the filesystem
const readModulesFromFS = async () => {
  try {
    // Get all module type directories
    const moduleTypes = fs.readdirSync(modulesDir)
      .filter(file => fs.statSync(path.join(modulesDir, file)).isDirectory());
    
    const modules = [];
    
    // Process each module type directory
    for (const moduleType of moduleTypes) {
      const typeDir = path.join(modulesDir, moduleType);
      
      // Get all JSON files in the directory
      const files = fs.readdirSync(typeDir)
        .filter(file => file.endsWith('.json'));
      
      // Process each JSON file
      for (const file of files) {
        const filePath = path.join(typeDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        try {
          const moduleData = JSON.parse(fileContent);
          
          // Ensure the module has the correct type based on directory
          moduleData.mtype = moduleType;
          
          modules.push(moduleData);
        } catch (err) {
          console.error(`Error parsing ${filePath}: ${err.message}`);
        }
      }
    }
    
    return modules;
  } catch (err) {
    console.error(`Error reading modules directory: ${err.message}`);
    return [];
  }
};

// Function to seed modules to the database
export const seedModules = async () => {
  try {
    // Read modules from the filesystem
    const moduleData = await readModulesFromFS();
    
    if (!moduleData.length) {
      console.log('No module data found.');
      return;
    }
    
    console.log(`Found ${moduleData.length} modules to seed.`);
    
    // Process each module
    for (const data of moduleData) {
      // Look for existing module with the same name
      const existingModule = await Module.findOne({ name: data.name });
      
      if (existingModule) {
        // Update existing module without changing _id
        console.log(`Updating existing module: ${data.name}`);
        
        await Module.updateOne(
          { _id: existingModule._id },
          { 
            $set: {
              mtype: data.mtype,
              ruleset: data.ruleset,
              options: data.options
            }
          }
        );
      } else {
        // Create new module
        console.log(`Creating new module: ${data.name}`);
        await Module.create(data);
      }
    }
    
    console.log('Module seeding completed successfully.');
  } catch (err) {
    console.error(`Error seeding modules: ${err.message}`);
  }
};

// Export a function to run at server startup
export const initializeModules = async () => {
  try {
    // Check if modules directory exists, create if not
    if (!fs.existsSync(modulesDir)) {
      console.log('Creating modules directory structure...');
      
      fs.mkdirSync(modulesDir, { recursive: true });
      
      // Create subdirectories for each module type
      fs.mkdirSync(path.join(modulesDir, 'racial'), { recursive: true });
      fs.mkdirSync(path.join(modulesDir, 'core'), { recursive: true });
      fs.mkdirSync(path.join(modulesDir, 'secondary'), { recursive: true });
      
      // Create sample module
      const sampleModule = {
        name: 'Acrobat',
        ruleset: 0,
        options: [
          {
            name: 'Acrobat',
            description: 'Gain +1 Acrobatics and +1 Initiative.',
            location: '1',
            data: 'AS3=1:ASH=1'
          },
          {
            name: 'Safe Fall',
            description: 'You take half Damage from falling that is applied after the Acrobatics Check to Mitigate the Damage. Additionally, you take no Damage when falling 6 Units or less.',
            location: '2a',
            data: 'TG'
          },
          {
            name: 'Aerialist',
            description: 'Your Acrobatics Modifier replaces your Athletics for determining the distance you can Jump and checks that involve Climbing.',
            location: '2b',
            data: 'TG'
          },
          {
            name: 'Reaction : Rolling Dodge',
            description: 'Gain +1 Dodge until the start of your next turn. Each time you Dodge an Attack successfully, gain another +1 Dodge until the start of your next turn',
            location: '3',
            data: 'ZX2'
          },
          {
            name: 'Action : Parkour Strike',
            description: 'Make an Attack with a +2 Modifier. If your Attack hits, you can bounce off your Target 1 unit plus a distance equal to your Melee Range and avoid provoking Reactions.',
            location: '4a',
            data: ''
          },
          {
            name: 'Quick Dodge',
            description: 'You can use your Dodge Modifier to Defend against Ray Attacks',
            location: '4b',
            data: 'TD'
          },
          {
            name: 'Master Acrobat',
            description: 'Gain +1 Dodge, +1 Movement Speed and +1 Acrobatics',
            location: '5',
            data: 'AD2=1:AV=1:AS3=1'
          }
        ]
      };
      
      // Write sample module to file
      fs.writeFileSync(
        path.join(modulesDir, 'secondary', 'acrobat.json'),
        JSON.stringify(sampleModule, null, 2)
      );
      
      console.log('Created sample module: Acrobat');
    }
    
    // Seed modules from files
    await seedModules();
    
  } catch (err) {
    console.error(`Error initializing modules: ${err.message}`);
  }
};