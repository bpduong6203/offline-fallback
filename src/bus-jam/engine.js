export const COLORS = {
  RED: '#FF4D4D',
  BLUE: '#2D9CDB',
  GREEN: '#27AE60',
  YELLOW: '#F2C94C',
  PURPLE: '#9B51E0'
};

export const MAX_BAYS = 4;
export const DEFAULT_BUS_CAPACITY = 3;

/**
 * Checks if a bus occupies a given grid cell (col, row).
 * @param {Object} bus
 * @param {number} col
 * @param {number} row
 * @returns {boolean}
 */
export function busOccupies(bus, col, row) {
  const w = bus.width || 1;
  const h = bus.height || 1;
  return col >= bus.x && col < bus.x + w && row >= bus.y && row < bus.y + h;
}

/**
 * Checks if a bus has a clear straight path to the grid boundary in its movement direction.
 * @param {Object} bus
 * @param {Array} buses All buses in parking lot
 * @param {number} [gridWidth=6]
 * @param {number} [gridHeight=6]
 * @returns {boolean}
 */
export function canBusExit(bus, buses, gridWidth = 6, gridHeight = 6) {
  const w = bus.width || 1;
  const h = bus.height || 1;
  const otherBuses = buses.filter(b => b.id !== bus.id);
  const dir = (bus.direction || 'U').toUpperCase();

  if (dir === 'U') {
    for (let col = bus.x; col < bus.x + w; col++) {
      for (let row = 0; row < bus.y; row++) {
        if (otherBuses.some(b => busOccupies(b, col, row))) {
          return false;
        }
      }
    }
  } else if (dir === 'D') {
    for (let col = bus.x; col < bus.x + w; col++) {
      for (let row = bus.y + h; row < gridHeight; row++) {
        if (otherBuses.some(b => busOccupies(b, col, row))) {
          return false;
        }
      }
    }
  } else if (dir === 'L') {
    for (let row = bus.y; row < bus.y + h; row++) {
      for (let col = 0; col < bus.x; col++) {
        if (otherBuses.some(b => busOccupies(b, col, row))) {
          return false;
        }
      }
    }
  } else if (dir === 'R') {
    for (let row = bus.y; row < bus.y + h; row++) {
      for (let col = bus.x + w; col < gridWidth; col++) {
        if (otherBuses.some(b => busOccupies(b, col, row))) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Process queue: passengers at the front board matching buses in bays with free seats.
 * Full buses are removed from bays and added to completedBuses.
 * @param {Object} state
 * @returns {boolean} changed
 */
export function processQueue(state) {
  let changed = false;
  if (!state.completedBuses) state.completedBuses = [];

  while (state.queue && state.queue.length > 0) {
    const nextPassengerColor = state.queue[0];

    // Find first bus in bays matching color and has space
    const availableBus = state.bays.find(
      b => b.color === nextPassengerColor && (b.seated || 0) < (b.capacity || DEFAULT_BUS_CAPACITY)
    );

    if (!availableBus) {
      break;
    }

    // Passenger boards
    state.queue.shift();
    availableBus.seated = (availableBus.seated || 0) + 1;
    changed = true;

    // If full, remove from bay and complete
    if (availableBus.seated >= (availableBus.capacity || DEFAULT_BUS_CAPACITY)) {
      state.bays = state.bays.filter(b => b.id !== availableBus.id);
      state.completedBuses.push(availableBus);
    }
  }

  return changed;
}

/**
 * Evaluates game status: isWon and isGameOver.
 * @param {Object} state
 * @returns {{ isWon: boolean, isGameOver: boolean }}
 */
export function checkGameStatus(state) {
  const maxBays = state.maxBays || MAX_BAYS;
  const isWon = (state.queue.length === 0) &&
                (state.bays.length === 0) &&
                (!state.buses || state.buses.length === 0);

  let isGameOver = false;
  if (state.bays.length >= maxBays && state.queue.length > 0) {
    const frontPassenger = state.queue[0];
    const hasMatchingBay = state.bays.some(
      b => b.color === frontPassenger && (b.seated || 0) < (b.capacity || DEFAULT_BUS_CAPACITY)
    );
    if (!hasMatchingBay) {
      isGameOver = true;
    }
  }

  state.isWon = isWon;
  state.isGameOver = isGameOver;

  return { isWon, isGameOver };
}

/**
 * Creates game state from a level configuration.
 * @param {Object} level
 * @returns {Object}
 */
export function createGameState(level) {
  return {
    levelId: level.id,
    levelName: level.name || `Level ${level.id}`,
    gridWidth: level.gridWidth || 6,
    gridHeight: level.gridHeight || 6,
    maxBays: level.maxBays || MAX_BAYS,
    buses: (level.buses || []).map(b => ({
      ...b,
      width: b.width || 1,
      height: b.height || 1,
      capacity: b.capacity || DEFAULT_BUS_CAPACITY,
      seated: b.seated || 0
    })),
    queue: [...(level.passengers || [])],
    bays: [],
    completedBuses: [],
    isWon: false,
    isGameOver: false
  };
}

/**
 * Attempts to move a bus from parking lot to an open waiting bay.
 * @param {Object} state
 * @param {string} busId
 * @returns {{ success: boolean, reason?: string, bus?: Object }}
 */
export function moveBusToBay(state, busId) {
  if (state.isWon || state.isGameOver) {
    return { success: false, reason: 'GAME_ENDED' };
  }

  const busIndex = state.buses.findIndex(b => b.id === busId);
  if (busIndex === -1) {
    return { success: false, reason: 'BUS_NOT_FOUND' };
  }

  const bus = state.buses[busIndex];
  const maxBays = state.maxBays || MAX_BAYS;

  if (state.bays.length >= maxBays) {
    return { success: false, reason: 'BAYS_FULL', bus };
  }

  if (!canBusExit(bus, state.buses, state.gridWidth, state.gridHeight)) {
    return { success: false, reason: 'BLOCKED', bus };
  }

  // Remove from parking lot
  state.buses.splice(busIndex, 1);
  // Add to bays
  state.bays.push(bus);

  // Process boarding
  processQueue(state);

  // Check game status
  checkGameStatus(state);

  return { success: true, bus };
}
