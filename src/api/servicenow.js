export const GAME_STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER'
};

// Mock data generator for initial development
const MOCK_CATEGORIES = ['Network', 'Database', 'Software', 'Hardware'];
const MOCK_PRIORITIES = [
  { level: 1, label: 'P1 - Critical', speed: 3.5, score: 500 },
  { level: 2, label: 'P2 - High', speed: 2.5, score: 300 },
  { level: 3, label: 'P3 - Moderate', speed: 1.5, score: 100 },
  { level: 4, label: 'P4 - Low', speed: 1.0, score: 50 },
];

let incidentCounter = 10000;

export const fetchIncidents = async (count = 5) => {
  // In the future, this will connect to real ServiceNow REST API
  // For now, return mock data
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const incidents = [];
      for (let i = 0; i < count; i++) {
        incidentCounter++;
        const priority = MOCK_PRIORITIES[Math.floor(Math.random() * MOCK_PRIORITIES.length)];
        const category = MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)];
        
        incidents.push({
          id: `INC00${incidentCounter}`,
          short_description: `Issue with ${category} system`,
          category: category,
          priority: priority,
          caller: `User_${Math.floor(Math.random() * 100)}`
        });
      }
      resolve(incidents);
    }, 500); // Simulate network latency
  });
};
