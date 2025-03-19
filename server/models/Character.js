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
    
    // Social Skills
    negotiation: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    behavior: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    presence: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) }
  },
  
  // Crafting Skills - now using SkillSchema
  craftingSkills: {
    engineering: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    fabrication: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    biosculpting: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) },
    synthesist: { type: SkillSchema, default: () => ({ value: 0, isGoodAt: false }) }
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
  experience: { type: Number, default: 0 },
  
  // Calculated Stats
  calculatedStats: {
    initiative: { type: Number, default: 0 },
    movement: { type: Number, default: 5 },
    dodge: { type: Number, default: 0 }
  }
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
  
  this.skills.negotiation.value = this.attributes.social;
  this.skills.behavior.value = this.attributes.social;
  this.skills.presence.value = this.attributes.social;
  
  // Calculate resources
  this.resources.health.max = 10 + (this.attributes.physique * 2);
  this.resources.stamina.max = 10 + (this.attributes.physique + this.attributes.mind);
  this.resources.resolve.max = 10 + (this.attributes.mind * 2);
  
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

const Character = mongoose.model('Character', CharacterSchema);

export default Character;