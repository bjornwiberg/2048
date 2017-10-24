export const goalScore = 2048;

export const directionRotates = {
  left: 0,
  right: 2,
  up: 3,
  down: 1,
};

export const eventKeys = {
  // ARROWS
  37: {
    direction: 'left',
  },
  39: {
    direction: 'right',
  },
  38: {
    direction: 'up',
  },
  40: {
    direction: 'down',
  },
  // VIM
  72: { // (H)
    direction: 'left',
  },
  76: { // (L)
    direction: 'right',
  },
  74: { // (J)
    direction: 'down',
  },
  75: { // (K)
    direction: 'up',
  },
  // GAMER
  65: { // (A)
    direction: 'left',
  },
  68: { // (D)
    direction: 'right',
  },
  87: { // (W)
    direction: 'up',
  },
  83: { // (S)
    direction: 'down',
  },
}
