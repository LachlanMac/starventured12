// server/models/Module.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ModuleOptionSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  data: { 
    type: String, 
    default: "" 
  },
  selected: { 
    type: Boolean, 
    default: false 
  }
});

const ModuleSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  mtype: { 
    type: String, 
    required: true,
    enum: ['racial', 'core', 'secondary']
  },
  ruleset: { 
    type: Number, 
    default: 0 
  },
  options: [ModuleOptionSchema]
}, {
  timestamps: true
});

// Helper method to find option by location
ModuleSchema.methods.findOptionByLocation = function(location) {
  return this.options.find(option => option.location === location);
};

// Helper method to get the parent location (e.g., "2" from "2a")
ModuleSchema.statics.getParentLocation = function(location) {
  return location.replace(/[a-z]/g, '');
};

// Helper method to check if option is available for selection
ModuleSchema.methods.isOptionAvailable = function(location, selectedOptions = []) {
  // Always allow first tier
  if (location === "1") return true;
  
  // Get parent location
  const parentLocation = this.constructor.getParentLocation(location);
  
  // For locations like "2a", "2b", etc., check if parent ("2") is selected
  // For locations like "3", "4", "5", check if the previous tier is selected
  if (location.match(/^\d+[a-z]$/)) {
    // For "2a", "3b", etc. - check if parent tier is selected
    return selectedOptions.some(option => 
      this.constructor.getParentLocation(option.location) === parentLocation.toString()
    );
  } else {
    // For "2", "3", etc. - check if previous tier is selected
    const previousTier = (parseInt(parentLocation) - 1).toString();
    return selectedOptions.some(option => 
      this.constructor.getParentLocation(option.location) === previousTier
    );
  }
};

// Method to get cost of an option based on location
ModuleSchema.methods.getOptionCost = function(location) {
  // Default pricing rules:
  // - Tier 1: 2 points
  // - Tier 2-4: 2 points
  // - Tier 5+: 3 points
  const tier = parseInt(this.constructor.getParentLocation(location));
  
  if (tier >= 5) {
    return 3;
  } else {
    return 2;
  }
};

const Module = mongoose.model('Module', ModuleSchema);

export default Module;