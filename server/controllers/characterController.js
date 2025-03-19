import Character from '../models/Character.js';

// @desc    Get all characters for a user
// @route   GET /api/characters
// @access  Private
export const getCharacters = async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user ? req.user._id : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const characters = await Character.find({ userId });
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single character
// @route   GET /api/characters/:id
// @access  Private
export const getCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new character
// @route   POST /api/characters
// @access  Private
export const createCharacter = async (req, res) => {
  try {
    console.log('Creating character with data:', req.body);

    // Get the user ID from the authenticated user
    const userId = req.user ? req.user._id : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Create a new character
    const character = new Character({
      ...req.body,
      userId: userId // Set the user ID from the authenticated user
    });
    
    // Save the character
    const savedCharacter = await character.save();
    
    res.status(201).json(savedCharacter);
  } catch (error) {
    console.error('Error creating character:', error);
    
    // Check for validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a character
// @route   PUT /api/characters/:id
// @access  Private
export const updateCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // In a real app, check if the user owns this character
    
    const updatedCharacter = await Character.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    
    // Check for validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a character
// @route   DELETE /api/characters/:id
// @access  Private
export const deleteCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // In a real app, check if the user owns this character
    
    await Character.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Character removed' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ message: error.message });
  }
};