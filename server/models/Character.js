// server/models/Character.js
import mongoose from 'mongoose';
import { applyDataEffects } from '../utils/moduleEffects.js';
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
  
  // Crafting Skills - now using CraftSchema
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

  // Module points
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
  
  // Modules (Using ModuleSchema for old modules, CharacterModuleSchema for new ones)
  modules: [CharacterModuleSchema],
  
  // Legacy modules field (for backward compatibility)
  legacyModules: [ModuleSchema],
  
  // Level and Experience
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  
  // Stats directly modified by modules
  initiative: { type: Number, default: 0 },
  movement: { type: Number, default: 5 },
  
  // Extra fields for module bonuses
  immunities: [String],
  vision: [String],
  mitigation: {
    kinetic: { type: Number, default: 0 },
    cold: { type: Number, default: 0 },
    heat: { type: Number, default: 0 },
    electrical: { type: Number, default: 0 },
    mental: { type: Number, default: 0 },
    toxic: { type: Number, default: 0 },
    sonic: { type: Number, default: 0 },
    radiation: { type: Number, default: 0 }
  },
  weaponSkills: Schema.Types.Mixed,
  
  // Store module bonuses separately to track what came from modules
  moduleBonuses: Schema.Types.Mixed
}, {
  timestamps: true
});

// Pre-save middleware to calculate derived values
CharacterSchema.pre('save', function(next) {
  // Set skill values based on attributes
  this.skills.fitness.value = this.attributes.physique;
  this.skills.deflect.value = this.attributes.physique;
  this.skills.might.value = this.attributes.physique;
  
  this.skills.evade.value = this.attributes.agility;
  this.skills.stealth.value = this.attributes.agility;
  this.skills.coordination.value = this.attributes.agility;
  
  this.skills.resilience.value = this.attributes.mind;
  this.skills.concentration.value = this.attributes.mind;
  this.skills.senses.value = this.attributes.mind;
  
  this.skills.science.value = this.attributes.knowledge;
  this.skills.technology.value = this.attributes.knowledge;
  this.skills.medicine.value = this.attributes.knowledge;
  this.skills.xenology.value = this.attributes.knowledge;
  
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
  
  // Set initiative based on attributes
  this.initiative = this.attributes.agility + this.attributes.mind;

  // Apply module effects
  this.applyModuleEffects();
  
  next();
});

// Add this method to the CharacterSchema
CharacterSchema.methods.applyModuleEffects = async function() {
  // Reset module bonuses
  this.moduleBonuses = {
    skills: {},
    craftingSkills: {},
    mitigation: {},
    weaponSkills: {},
    traits: [],
    immunities: [],
    vision: [],
    conditionalEffects: [],
    health: 0,
    movement: 0,
    initiative: 0
  };
  
  // Iterate through selected modules and apply effects
  for (const characterModule of this.modules || []) {
    try {
      // Find the module definition
      const module = await mongoose.model('Module').findById(characterModule.moduleId);
      if (!module) continue;
      
      // Apply data effects for selected options
      for (const selection of characterModule.selectedOptions) {
        const option = module.options.find(o => o.location === selection.location);
        if (!option) continue;
        
        // Process data string
        if (option.data) {
          applyDataEffects(this, option.data);
        }
        
        // Apply special effects based on option name (like actions)
        applySpecialEffectsFromName(this, option, module.name);
      }
    } catch (err) {
      console.error(`Error applying module effects: ${err.message}`);
    }
  }
  
  // Apply the collected bonuses to the character's stats
  this.applyBonusesToStats();
};

// Helper function to apply bonuses to character stats
CharacterSchema.methods.applyBonusesToStats = function() {
  // Apply skill bonuses
  if (this.moduleBonuses.skills) {
    for (const [skill, bonus] of Object.entries(this.moduleBonuses.skills)) {
      if (this.skills[skill]) {
        // Store the base value if not already stored
        if (this.skills[skill].baseValue === undefined) {
          this.skills[skill].baseValue = this.skills[skill].value;
        }
        
        // Apply the bonus
        this.skills[skill].value = this.skills[skill].baseValue + bonus;
      }
    }
  }
  
  // Apply crafting skill bonuses
  if (this.moduleBonuses.craftingSkills) {
    for (const [skill, bonus] of Object.entries(this.moduleBonuses.craftingSkills)) {
      if (this.craftingSkills[skill]) {
        // Store the base value if not already stored
        if (this.craftingSkills[skill].baseValue === undefined) {
          this.craftingSkills[skill].baseValue = this.craftingSkills[skill].value;
        }
        
        // Apply the bonus
        this.craftingSkills[skill].value = this.craftingSkills[skill].baseValue + bonus;
      }
    }
  }
  
  // Apply movement bonus
  if (this.moduleBonuses.movement) {
    this.movement += this.moduleBonuses.movement;
  }
  
  // Apply health bonus to max health
  if (this.moduleBonuses.health) {
    this.resources.health.max += this.moduleBonuses.health;
    // Also increase current health by the same amount
    this.resources.health.current += this.moduleBonuses.health;
  }
  
  // Apply initiative bonus
  if (this.moduleBonuses.initiative) {
    this.initiative += this.moduleBonuses.initiative;
  }
  
  // Apply mitigation bonuses
  if (this.moduleBonuses.mitigation) {
    for (const [type, bonus] of Object.entries(this.moduleBonuses.mitigation)) {
      if (this.mitigation && this.mitigation[type] !== undefined) {
        this.mitigation[type] += bonus;
      }
    }
  }
  
  // Apply immunities
  if (this.moduleBonuses.immunities && this.moduleBonuses.immunities.length > 0) {
    for (const immunity of this.moduleBonuses.immunities) {
      if (!this.immunities) this.immunities = [];
      if (!this.immunities.includes(immunity)) {
        this.immunities.push(immunity);
      }
    }
  }
  
  // Apply vision types
  if (this.moduleBonuses.vision && this.moduleBonuses.vision.length > 0) {
    for (const visionType of this.moduleBonuses.vision) {
      if (!this.vision) this.vision = [];
      if (!this.vision.includes(visionType)) {
        this.vision.push(visionType);
      }
    }
  }
};

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
  const option = moduleData.options.find(o => o.location === location);
  if (!option) return false;
  
  // Check if prerequisites are met
  if (!canSelectOption(moduleData, location, module.selectedOptions)) {
    return false;
  }
  
  // Get option cost based on tier
  const cost = getOptionCost(location);
  
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
  const dependentOptions = getDependentOptions(moduleData, location, module.selectedOptions);
  
  // Cannot deselect if it has dependent options
  if (dependentOptions.length > 0) {
    return false;
  }
  
  // Get option cost based on tier
  const cost = getOptionCost(location);
  
  // Remove option and refund points
  module.selectedOptions.splice(optionIndex, 1);
  this.modulePoints.spent -= cost;
  
  return true;
};

// Helper function to check if an option can be selected
function canSelectOption(module, location, selectedOptions) {
  // Always allow tier 1
  if (location === "1") return true;
  
  // Get tier number
  const tier = parseInt(location.match(/^(\d+)/)[1]);
  
  // Check if it's a sub-option (e.g. "2a")
  const isSubOption = location.length > 1;
  
  if (isSubOption) {
    // For sub-options, check if base tier is selected
    const baseTier = location.charAt(0);
    // Any option from previous tier will satisfy the requirement
    return selectedOptions.some(o => o.location.charAt(0) === (parseInt(baseTier) - 1).toString());
  } else {
    // For main tiers, check if previous tier is selected
    const previousTier = (tier - 1).toString();
    return selectedOptions.some(o => o.location.charAt(0) === previousTier);
  }
}

// Helper function to get dependent options
function getDependentOptions(module, location, selectedOptions) {
  const tier = parseInt(location.match(/^(\d+)/)[1]);
  
  // Find all selected options with higher tier numbers
  return selectedOptions.filter(o => {
    const optionTier = parseInt(o.location.match(/^(\d+)/)[1]);
    return optionTier > tier;
  });
}

// Helper function to get option cost
function getOptionCost(location) {
  const tier = parseInt(location.match(/^(\d+)/)[1]);
  return tier >= 5 ? 3 : 2;
}

// Helper function to apply special effects based on option name
function applySpecialEffectsFromName(character, option, moduleName) {
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
          sourceModule: moduleName,
          sourceModuleOption: option.name
        });
      }
    }
  }
}

const Character = mongoose.model('Character', CharacterSchema);

export default Character;