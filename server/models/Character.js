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

// Updated skill schema with talent stars
const SkillSchema = new Schema({
  value: { type: Number, default: 1 },   // Dice type (1d4, 1d6, etc.) - ranges from 1-6
  talent: { type: Number, default: 0 }   // Number of dice to roll - ranges from 0-3
});

const CraftSchema = new Schema({
  value: { type: Number, default: 1 },   // Dice type (1d4, 1d6, etc.) - ranges from 1-6
  talent: { type: Number, default: 0 }   // Number of dice to roll - ranges from 0-3
});

const WeaponSkillSchema = new Schema({
  value: { type: Number, default: 1 },   // Dice type (1d4, 1d6, etc.) - ranges from 1-6
  talent: { type: Number, default: 0 }   // Number of dice to roll - ranges from 0-3
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

// Add this new schema after the existing schemas in Character.js
const TraitSchema = new Schema({
  traitId: {
    type: Schema.Types.ObjectId,
    ref: 'Trait',
    required: true
  },
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['positive', 'negative'],
    required: true
  },
  description: { 
    type: String,
    required: true
  },
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
  
  // Core Attributes (each now starts at 1 and has max of 3)
  attributes: {
    physique: { type: Number, default: 1, min: 1, max: 3 },
    agility: { type: Number, default: 1, min: 1, max: 3 },
    mind: { type: Number, default: 1, min: 1, max: 3 },
    knowledge: { type: Number, default: 1, min: 1, max: 3 },
    social: { type: Number, default: 1, min: 1, max: 3 }
  },
  
  // Skills based on attributes - now using updated SkillSchema
  skills: {
    // Physique Skills
    fitness: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.physique.default }) },
    deflect: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.physique.default }) },
    might: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.physique.default }) },
    
    // Agility Skills
    evade: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.agility.default }) },
    stealth: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.agility.default }) },
    coordination: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.agility.default }) },
    
    // Mind Skills
    resilience: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.mind.default }) },
    concentration: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.mind.default }) },
    senses: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.mind.default }) },
    
    // Knowledge Skills
    science: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    technology: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    medicine: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    xenology: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    
    // Social Skills
    negotiation: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.social.default }) },
    behavior: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.social.default }) },
    presence: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.social.default }) }
  },
  
  // Specialized skills that don't depend on attributes
  weaponSkills: {
    rangedWeapons: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 1 }) },
    meleeWeapons: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 1 }) },
    weaponSystems: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0 }) },
    heavyRangedWeapons: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0 }) }
  },
  
  // Crafting Skills
  craftingSkills: {
    engineering: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
    fabrication: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
    biosculpting: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
    synthesis: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) }
  },
  
  // Track remaining talent stars for character creation
  characterCreation: {
    attributePointsRemaining: { type: Number, default: 5 },
    talentStarsRemaining: { type: Number, default: 5 }
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
  
  // Modules
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
  traits: [TraitSchema],
  // Store module bonuses separately to track what came from modules
  moduleBonuses: Schema.Types.Mixed
}, {
  timestamps: true
});



// Pre-save middleware to calculate derived values
CharacterSchema.pre('save', function(next) {
  // Set skill talents based on attributes
  // Physique Skills
  this.skills.fitness.talent = this.attributes.physique;
  this.skills.deflect.talent = this.attributes.physique;
  this.skills.might.talent = this.attributes.physique;
  
  // Agility Skills
  this.skills.evade.talent = this.attributes.agility;
  this.skills.stealth.talent = this.attributes.agility;
  this.skills.coordination.talent = this.attributes.agility;
  
  // Mind Skills
  this.skills.resilience.talent = this.attributes.mind;
  this.skills.concentration.talent = this.attributes.mind;
  this.skills.senses.talent = this.attributes.mind;
  
  // Knowledge Skills
  this.skills.science.talent = this.attributes.knowledge;
  this.skills.technology.talent = this.attributes.knowledge;
  this.skills.medicine.talent = this.attributes.knowledge;
  this.skills.xenology.talent = this.attributes.knowledge;
  
  // Social Skills
  this.skills.negotiation.talent = this.attributes.social;
  this.skills.behavior.talent = this.attributes.social;
  this.skills.presence.talent = this.attributes.social;
  
  // Calculate resources
  this.resources.health.max = 8 + (this.attributes.physique * 2);
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
  this.applyTraitEffects();
  next();
});

// Continue with the rest of the character model methods...
CharacterSchema.methods.applyModuleEffects = async function() {
  // Reset module bonuses
  this.moduleBonuses = {
    skills: {},
    craftingSkills: {},
    weaponSkills: {},
    mitigation: {},
    traits: [],
    immunities: [],
    vision: [],
    conditionalEffects: [],
    health: 0,
    movement: 0,
    initiative: 0
  };
  
  // Apply module effects logic here...
  // (This is just a stub - the actual implementation would be more complex)
};


CharacterSchema.methods.applyTraitEffects = async function() {
  // Reset trait bonuses
  if (!this.moduleBonuses) this.moduleBonuses = {};
  if (!this.moduleBonuses.traitEffects) this.moduleBonuses.traitEffects = [];
  
  this.moduleBonuses.traitEffects = [];
  
  // Apply each trait's effects
  if (this.traits && this.traits.length > 0) {
    for (const trait of this.traits) {
      // Store trait information in moduleBonuses.traitEffects
      this.moduleBonuses.traitEffects.push({
        name: trait.name,
        type: trait.type,
        effects: trait.effects || []
      });
      
      // If we have a trait effects utility, we would call it here:
      // await applyTraitEffects(this, trait);
    }
  }
};

// Add method to add a trait to the character
CharacterSchema.methods.addTrait = async function(trait) {
  // Check if the trait already exists
  const existingTrait = this.traits.find(t => 
    t.traitId.toString() === trait._id.toString()
  );
  
  if (existingTrait) {
    return false; // Trait already added
  }
  
  // Add the trait
  this.traits.push({
    traitId: trait._id,
    name: trait.name,
    type: trait.type,
    description: trait.description
  });
  
  // If this is a positive trait, deduct 1 module point
  if (trait.type === 'positive') {
    this.modulePoints.spent += 1;
  }
  
  return true;
};

// Add method to remove a trait from the character
CharacterSchema.methods.removeTrait = async function(traitId) {
  // Find the trait in the array
  const traitIndex = this.traits.findIndex(t => 
    t.traitId.toString() === traitId.toString()
  );
  
  if (traitIndex === -1) {
    return false; // Trait not found
  }
  
  // Store the trait before removing
  const trait = this.traits[traitIndex];
  
  // Remove the trait
  this.traits.splice(traitIndex, 1);
  
  // If it was a positive trait, refund 1 module point
  if (trait.type === 'positive') {
    this.modulePoints.spent -= 1;
  }
  
  return true;
};

// Add other methods as needed

const Character = mongoose.model('Character', CharacterSchema);

export default Character;