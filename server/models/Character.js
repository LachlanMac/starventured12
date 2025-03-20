import mongoose from 'mongoose';
const { Schema } = mongoose;

const ModuleOptionSchema = new Schema({
  id: Number,
  name: String,
  description: String,
  mtype: String,
  location: String,
  cost: Number,
  data: String,
  selected: { type: Boolean, default: false }
});

const ModuleSchema = new Schema({
  id: Number,
  name: String,
  mtype: String,
  ruleset: Number,
  options: [ModuleOptionSchema]
});

const SkillSchema = new Schema({
  value: { type: Number, default: 0 },
  isGoodAt: { type: Boolean, default: false }
});

const CraftSchema = new Schema({
  value: { type: Number, default: 0 },
});

const ActionSchema = new Schema({
  name: String,
  description: String,
  type: { type: String, enum: ['Action', 'Reaction', 'Free Action'] },
  sourceModule: String,
  sourceModuleOption: String
});

const CharacterSchema = new Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Character name is required'],
    trim: true
  },
  race: {
    type: String,
    required: [true, 'Race is required']
  },
  
  // Core Attributes
  attributes: {
    physique: { type: Number, default: 2 },
    agility: { type: Number, default: 2 },
    mind: { type: Number, default: 2 },
    knowledge: { type: Number, default: 2 },
    social: { type: Number, default: 2 }
  },
  
  // Skills based on attributes - now using SkillSchema
  skills: {
    // Physique Skills
    fitness: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    deflect: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    might: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    
    // Agility Skills
    evade: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    stealth: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    coordination: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    
    // Mind Skills
    resilience: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    concentration: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    senses: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    
    // Knowledge Skills
    science: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    technology: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    medicine: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    xenology: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    
    // Social Skills
    negotiation: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    behavior: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    presence: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) }
  },
  
  // Crafting Skills - now using SkillSchema
  craftingSkills: {
    engineering: { type: CraftSchema, default: () => ({ value: 0 }) },//cybernetics, //droids, //mechanic
    fabrication: { type: CraftSchema, default: () => ({ value: 0}) },//armorsmith, weaponsmith, artificer
    biosculpting: { type: CraftSchema, default: () => ({ value: 0}) },//biograft, pets
    synthesist: { type: CraftSchema, default: () => ({ value: 0 }) } //grenades, pharamcologist
  },
  
  // Resources
  resources: {
    health: { 
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    stamina: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    resolve: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    }
  },


  modulePoints: {
    total: { type: Number, default: 5 }, // Total points earned
    spent: { type: Number, default: 0 }  // Points spent on modules
  },
  // Languages and Stances
  languages: [String],
  stances: [String],
  // Physical Characteristics
  physicalTraits: {
    size: String,
    weight: String,
    height: String,
    gender: String
  },
  
  // Biography and Descriptions
  biography: { type: String, default: '' },
  appearance: { type: String, default: '' },
  
  // Actions, Reactions, and Free Actions
  actions: [ActionSchema],
  
  // Modules (Core and Secondary)
  modules: [ModuleSchema],
  
  // Level and Experience
  level: { type: Number, default: 1 },
  initiative: { type: Number, default: 0 },
  movement: { type: Number, default: 5 },
  // Calculated Stats
}, {
  timestamps: true
});

// Pre-save middleware to calculate derived values
CharacterSchema.pre('save', function(next) {
  // Set skill values based on attributes
  this.skills.fitness.value = this.attributes.physique;
  this.skills.deflect.value = this.attributes.physique;
  this.skills.might.value = this.attributes.physique;
  
  this.skills.evasion.value = this.attributes.agility;
  this.skills.stealth.value = this.attributes.agility;
  this.skills.coordination.value = this.attributes.agility;
  
  this.skills.resilience.value = this.attributes.mind;
  this.skills.concentration.value = this.attributes.mind;
  this.skills.senses.value = this.attributes.mind;
  
  this.skills.science.value = this.attributes.knowledge;
  this.skills.technology.value = this.attributes.knowledge;
  this.skills.medicine.value = this.attributes.knowledge;
  
  this.skills.negotiation.value = this.attributes.social;
  this.skills.behavior.value = this.attributes.social;
  this.skills.presence.value = this.attributes.social;
  
  // Calculate resources
  this.resources.health.max = 4 + (this.level * 4);
  this.resources.stamina.max = 5 + (this.attributes.physique);
  this.resources.resolve.max = 5 + (this.attributes.mind);
  
  // Ensure current resources don't exceed max
  if (!this.resources.health.current || this.resources.health.current > this.resources.health.max) {
    this.resources.health.current = this.resources.health.max;
  }
  if (!this.resources.stamina.current || this.resources.stamina.current > this.resources.stamina.max) {
    this.resources.stamina.current = this.resources.stamina.max;
  }
  if (!this.resources.resolve.current || this.resources.resolve.current > this.resources.resolve.max) {
    this.resources.resolve.current = this.resources.resolve.max;
  }
  
  // Calculate other stats
  this.calculatedStats.initiative = this.attributes.agility + this.attributes.mind;
  this.calculatedStats.dodge = this.attributes.agility;
  
  next();
});

// Character's selected modules
const CharacterModuleSchema = new Schema({
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  selectedOptions: [{
    location: { type: String, required: true },
    selectedAt: { type: Date, default: Date.now }
  }],
  dateAdded: {
    type: Date,
    default: Date.now
  }
});



// Modify pre-save middleware to calculate module effects
CharacterSchema.pre('save', function(next) {
  // Existing pre-save code...
  
  // Apply module effects
  this.applyModuleEffects();
  
  next();
});

// Add this method to your CharacterSchema
CharacterSchema.methods.applyModuleEffects = async function() {
  // Reset any stat bonuses from modules
  // This depends on how you're tracking module bonuses
  this.moduleBonuses = {};
  
  // Iterate through selected modules and apply effects
  for (const characterModule of this.modules || []) {
    try {
      // Find the module definition
      const module = await mongoose.model('Module').findById(characterModule.moduleId);
      if (!module) continue;
      
      // Apply data effects for selected options
      for (const selection of characterModule.selectedOptions) {
        const option = module.findOptionByLocation(selection.location);
        if (!option) continue;
        
        // Process data string
        if (option.data) {
          applyDataEffects(this, option.data);
        }
        
        // Apply special effects based on option name
        // This could be expanded with a more sophisticated effects system
        applySpecialEffects(this, option);
      }
    } catch (err) {
      console.error(`Error applying module effects: ${err.message}`);
    }
  }
};

// Helper function to apply data effects
function applyDataEffects(character, dataString) {
  if (!dataString) return;
  
  // Split the data string by colon for multiple effects
  const effects = dataString.split(':');
  
  for (const effect of effects) {
    // Parse effect code
    // Format could be like "AS3=1" (Acrobatics +1) or "AV=1" (Movement Speed +1)
    const match = effect.match(/([A-Z]+)([0-9]*)=([+-]?[0-9]+)/);
    if (!match) continue;
    
    const [_, code, subcode, valueStr] = match;
    const value = parseInt(valueStr);
    
    // Initialize module bonuses object if not exists
    if (!character.moduleBonuses) character.moduleBonuses = {};
    
    // Apply effect based on code
    switch(code) {
      case 'AS': // Skill bonus
        const skillCode = subcode || '0';
        const skillMap = {
          '1': 'fitness',
          '2': 'concentration',
          '3': 'acrobatics',
          // ... add more skill mappings as needed
        };
        
        const skill = skillMap[skillCode];
        if (skill) {
          if (!character.moduleBonuses.skills) character.moduleBonuses.skills = {};
          if (!character.moduleBonuses.skills[skill]) character.moduleBonuses.skills[skill] = 0;
          character.moduleBonuses.skills[skill] += value;
        }
        break;
        
      case 'AD': // Defense/Dodge bonus
        if (!character.moduleBonuses.dodge) character.moduleBonuses.dodge = 0;
        character.moduleBonuses.dodge += value;
        break;
        
      case 'AV': // Movement speed
        if (!character.moduleBonuses.movement) character.moduleBonuses.movement = 0;
        character.moduleBonuses.movement += value;
        break;
        
      case 'ASH': // Initiative
        if (!character.moduleBonuses.initiative) character.moduleBonuses.initiative = 0;
        character.moduleBonuses.initiative += value;
        break;
        
      // Add more code handlers as needed
    }
  }
}

// Helper function to apply special effects based on option name
function applySpecialEffects(character, option) {
  // Add option name to character's available actions if it's an action
  if (option.name.includes('Action :') || option.name.includes('Reaction :') || option.name.includes('Free Action :')) {
    // Extract action type and name
    const match = option.name.match(/(Action|Reaction|Free Action)\s*:\s*(.+)/i);
    if (match) {
      const [_, actionType, actionName] = match;
      
      // Initialize actions array if not exists
      if (!character.actions) character.actions = [];
      
      // Check if action already exists
      const exists = character.actions.some(a => a.name === actionName.trim());
      
      if (!exists) {
        character.actions.push({
          name: actionName.trim(),
          description: option.description,
          type: actionType.trim(),
          sourceModule: 'Unknown', // Would need module name here
          sourceModuleOption: option.name
        });
      }
    }
  }
}

// Method to calculate available module points
CharacterSchema.methods.getAvailableModulePoints = function() {
  return this.modulePoints.total - this.modulePoints.spent;
};

// Method to add a module
CharacterSchema.methods.addModule = async function(moduleId) {
  // Check if module already exists
  const existing = this.modules.find(m => m.moduleId.toString() === moduleId.toString());
  if (existing) return false;
  
  // Get module base cost (first tier is always 2 points)
  const baseCost = 2;
  
  // Check if enough points
  if (this.getAvailableModulePoints() < baseCost) return false;
  
  // Add module
  this.modules.push({
    moduleId,
    selectedOptions: []
  });
  
  // Spend points
  this.modulePoints.spent += baseCost;
  
  return true;
};

// Method to remove a module
CharacterSchema.methods.removeModule = function(moduleId) {
  const moduleIndex = this.modules.findIndex(m => m.moduleId.toString() === moduleId.toString());
  if (moduleIndex === -1) return false;
  
  const module = this.modules[moduleIndex];
  
  // Calculate refund (2 points for base + sum of option costs)
  let refund = 2; // Base cost
  
  // Add cost of each selected option
  for (const option of module.selectedOptions) {
    // Get tier from location
    const tier = parseInt(option.location.match(/^(\d+)/)[1]);
    // Option cost based on tier
    refund += tier >= 5 ? 3 : 2;
  }
  
  // Refund points
  this.modulePoints.spent -= refund;
  if (this.modulePoints.spent < 0) this.modulePoints.spent = 0;
  
  // Remove module
  this.modules.splice(moduleIndex, 1);
  
  return true;
};

// Method to select a module option
CharacterSchema.methods.selectOption = async function(moduleId, location) {
  const module = this.modules.find(m => m.moduleId.toString() === moduleId.toString());
  if (!module) return false;
  
  // Check if option already selected
  const optionExists = module.selectedOptions.some(o => o.location === location);
  if (optionExists) return false;
  
  // Get module data to check if option is available
  const moduleData = await mongoose.model('Module').findById(moduleId);
  if (!moduleData) return false;
  
  // Check if option exists in module
  const option = moduleData.findOptionByLocation(location);
  if (!option) return false;
  
  // Check if prerequisites are met
  if (!moduleData.isOptionAvailable(location, module.selectedOptions.map(o => ({ location: o.location })))) {
    return false;
  }
  
  // Get option cost based on tier
  const cost = moduleData.getOptionCost(location);
  
  // Check if enough points
  if (this.getAvailableModulePoints() < cost) return false;
  
  // Add option and spend points
  module.selectedOptions.push({
    location,
    selectedAt: new Date()
  });
  
  this.modulePoints.spent += cost;
  
  return true;
};

// Method to deselect a module option
CharacterSchema.methods.deselectOption = async function(moduleId, location) {
  const module = this.modules.find(m => m.moduleId.toString() === moduleId.toString());
  if (!module) return false;
  
  // Check if option is selected
  const optionIndex = module.selectedOptions.findIndex(o => o.location === location);
  if (optionIndex === -1) return false;
  
  // Get module data to find dependent options
  const moduleData = await mongoose.model('Module').findById(moduleId);
  if (!moduleData) return false;
  
  // Get all options that depend on this one
  const tierNumber = parseInt(location.match(/^(\d+)/)[1]);
  const dependentOptions = module.selectedOptions.filter(o => {
    const optionTier = parseInt(o.location.match(/^(\d+)/)[1]);
    return optionTier > tierNumber;
  });
  
  // Cannot deselect if it has dependent options
  if (dependentOptions.length > 0) {
    return false;
  }
  
  // Get option cost based on tier
  const cost = moduleData.getOptionCost(location);
  
  // Remove option and refund points
  module.selectedOptions.splice(optionIndex, 1);
  this.modulePoints.spent -= cost;
  
  return true;
};

const Character = mongoose.model('Character', CharacterSchema);

export default Character;