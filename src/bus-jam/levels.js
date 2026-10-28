export const LEVELS = [
  {
    id: 1,
    name: "Ga Khởi Hành",
    gridWidth: 6,
    gridHeight: 6,
    maxBays: 4,
    buses: [
      { id: 'b1', x: 1, y: 1, width: 1, height: 2, direction: 'U', color: 'RED', capacity: 3, seated: 0 },
      { id: 'b2', x: 3, y: 1, width: 1, height: 2, direction: 'U', color: 'BLUE', capacity: 3, seated: 0 },
      { id: 'b3', x: 2, y: 4, width: 2, height: 1, direction: 'R', color: 'YELLOW', capacity: 3, seated: 0 }
    ],
    passengers: [
      'RED', 'RED', 'RED',
      'BLUE', 'BLUE', 'BLUE',
      'YELLOW', 'YELLOW', 'YELLOW'
    ]
  },
  {
    id: 2,
    name: "Ngã Ba Tắc Đường",
    gridWidth: 6,
    gridHeight: 6,
    maxBays: 4,
    buses: [
      { id: 'b1', x: 2, y: 0, width: 2, height: 1, direction: 'L', color: 'GREEN', capacity: 3, seated: 0 },
      { id: 'b2', x: 2, y: 2, width: 1, height: 2, direction: 'U', color: 'RED', capacity: 3, seated: 0 },
      { id: 'b3', x: 4, y: 2, width: 1, height: 2, direction: 'D', color: 'BLUE', capacity: 3, seated: 0 },
      { id: 'b4', x: 1, y: 4, width: 2, height: 1, direction: 'L', color: 'RED', capacity: 3, seated: 0 }
    ],
    passengers: [
      'GREEN', 'GREEN', 'GREEN',
      'RED', 'RED', 'RED',
      'BLUE', 'BLUE', 'BLUE',
      'RED', 'RED', 'RED'
    ]
  },
  {
    id: 3,
    name: "Thử Thách Xếp Slot",
    gridWidth: 6,
    gridHeight: 6,
    maxBays: 4,
    buses: [
      { id: 'b1', x: 0, y: 1, width: 1, height: 2, direction: 'U', color: 'PURPLE', capacity: 3, seated: 0 },
      { id: 'b2', x: 2, y: 1, width: 1, height: 2, direction: 'U', color: 'YELLOW', capacity: 3, seated: 0 },
      { id: 'b3', x: 4, y: 1, width: 1, height: 2, direction: 'U', color: 'BLUE', capacity: 3, seated: 0 },
      { id: 'b4', x: 1, y: 4, width: 2, height: 1, direction: 'R', color: 'RED', capacity: 3, seated: 0 },
      { id: 'b5', x: 4, y: 4, width: 1, height: 2, direction: 'D', color: 'GREEN', capacity: 3, seated: 0 }
    ],
    passengers: [
      'PURPLE', 'YELLOW', 'BLUE', 'RED', 'PURPLE', 'PURPLE',
      'YELLOW', 'YELLOW', 'BLUE', 'BLUE', 'RED', 'RED',
      'GREEN', 'GREEN', 'GREEN'
    ]
  },
  {
    id: 4,
    name: "Giờ Cao Điểm",
    gridWidth: 6,
    gridHeight: 6,
    maxBays: 4,
    buses: [
      { id: 'b1', x: 0, y: 0, width: 2, height: 1, direction: 'L', color: 'RED', capacity: 3, seated: 0 },
      { id: 'b2', x: 0, y: 1, width: 1, height: 2, direction: 'U', color: 'BLUE', capacity: 3, seated: 0 },
      { id: 'b3', x: 3, y: 0, width: 2, height: 1, direction: 'R', color: 'GREEN', capacity: 3, seated: 0 },
      { id: 'b4', x: 4, y: 1, width: 1, height: 2, direction: 'U', color: 'YELLOW', capacity: 3, seated: 0 },
      { id: 'b5', x: 2, y: 3, width: 2, height: 1, direction: 'R', color: 'PURPLE', capacity: 3, seated: 0 },
      { id: 'b6', x: 1, y: 4, width: 1, height: 2, direction: 'D', color: 'RED', capacity: 3, seated: 0 }
    ],
    passengers: [
      'RED', 'RED', 'RED',
      'BLUE', 'BLUE', 'GREEN',
      'GREEN', 'GREEN', 'BLUE',
      'YELLOW', 'PURPLE', 'YELLOW',
      'YELLOW', 'PURPLE', 'PURPLE',
      'RED', 'RED', 'RED'
    ]
  }
];
