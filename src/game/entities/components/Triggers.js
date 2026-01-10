/**
 * Component Factories for Detection and Triggers
 */

export const DetectArea = (config = {}) => ({
  // Configuration
  shape: config.shape || 'circle', // 'circle' | 'aabb'
  offset: config.offset || { x: 0, y: 0 },
  radius: config.radius || 0,
  size: config.size || { w: 0, h: 0 },
  target: config.target || 'actors', // 'actors' | 'player'
  includeTags: config.includeTags || ['player'],
  excludeTags: config.excludeTags || ['ghost'],
  
  // Runtime Data
  results: [] // Array of detected entities
})

export const DetectInput = (config = {}) => ({
  // Configuration
  keys: config.keys || ['Interact'], // Virtual keys
  
  // Runtime Data
  isPressed: false,
  justPressed: false
})

export const Trigger = (config = {}) => ({
  // Configuration
  rules: config.rules || [], // e.g. [{ type: 'onEnter' }]
  actions: config.actions || [], // e.g. ['BATTLE']
  
  // Runtime Data
  state: {
    active: true,
    triggered: false,
    cooldownTimer: 0,
    oneShotExecuted: false
  }
})

// Exporting a compatibility layer or grouping if needed, but for now direct exports are fine.
// We can also keep the old Triggers object for a moment if we want to avoid breaking imports immediately, 
// but the user asked for a "large scale modification", so I'll assume I should update the usages.
// To make the transition smoother, I will NOT export the old 'Triggers' object, forcing me to update all usages.
