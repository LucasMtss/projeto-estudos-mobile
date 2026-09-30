import type { Puzzle } from "@/game/types";

// Edite este arquivo para alterar as fases.
// r e c começam em 0 no canto superior esquerdo.
// r = linha, c = coluna, rot = rotação.
// rot 0 = peça deitada (mais larga), rot 1 = em pé.
// K1 = 1x1, K2 = 1x2, K3 = 1x3.

export const PUZZLES: Puzzle[] = [
  {
    "id": 1,
    "stars": 1,
    "blockers": [
      {
        "id": "K1",
        "r": 6,
        "c": 7,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 2,
        "c": 2,
        "rot": 1
      }
    ]
  },
  {
    "id": 2,
    "stars": 1,
    "blockers": [
      {
        "id": "K1",
        "r": 6,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 1,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 5,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 3,
    "stars": 1,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 5,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 5,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 4,
    "stars": 1,
    "blockers": [
      {
        "id": "K1",
        "r": 7,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 0,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 5,
        "c": 0,
        "rot": 0
      }
    ]
  },
  {
    "id": 5,
    "stars": 1,
    "blockers": [
      {
        "id": "K1",
        "r": 1,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 5,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 6,
        "c": 3,
        "rot": 0
      }
    ]
  },
  {
    "id": 6,
    "stars": 1,
    "blockers": [
      {
        "id": "K1",
        "r": 7,
        "c": 1,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 6,
        "c": 1,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 2,
        "c": 0,
        "rot": 0
      }
    ]
  },
  {
    "id": 7,
    "stars": 1,
    "blockers": [
      {
        "id": "K1",
        "r": 7,
        "c": 7,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 2,
        "c": 4,
        "rot": 0
      }
    ]
  },
  {
    "id": 8,
    "stars": 1,
    "blockers": [
      {
        "id": "K1",
        "r": 7,
        "c": 7,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 1,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 2,
        "c": 1,
        "rot": 1
      }
    ]
  },
  {
    "id": 9,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 2,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 1,
        "c": 4,
        "rot": 1
      }
    ]
  },
  {
    "id": 10,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 6,
        "c": 7,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 3,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 5,
        "c": 0,
        "rot": 0
      }
    ]
  },
  {
    "id": 11,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 0,
        "c": 7,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 5,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 12,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 7,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 0,
        "c": 3,
        "rot": 1
      }
    ]
  },
  {
    "id": 13,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 7,
        "c": 1,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 7,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 14,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 1,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 6,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 7,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 15,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 0,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 16,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 6,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 1,
        "c": 3,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 0,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 17,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 7,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 7,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 18,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 6,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 1,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 19,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 1,
        "c": 3,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 6,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 20,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 0,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 0,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 21,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 7,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 0,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 22,
    "stars": 2,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 1,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 0,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 23,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 2,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 5,
        "c": 4,
        "rot": 0
      }
    ]
  },
  {
    "id": 24,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 6,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 4,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 2,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 25,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 0,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 0,
        "c": 0,
        "rot": 0
      }
    ]
  },
  {
    "id": 26,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 6,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 4,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 0,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 27,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 0,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 1,
        "c": 0,
        "rot": 1
      }
    ]
  },
  {
    "id": 28,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 0,
        "c": 0,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 0,
        "c": 3,
        "rot": 1
      }
    ]
  },
  {
    "id": 29,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 6,
        "c": 7,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 5,
        "c": 1,
        "rot": 0
      }
    ]
  },
  {
    "id": 30,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 7,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 4,
        "c": 4,
        "rot": 0
      }
    ]
  },
  {
    "id": 31,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 7,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 4,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 32,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 7,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 0,
        "c": 3,
        "rot": 1
      }
    ]
  },
  {
    "id": 33,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 7,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 5,
        "c": 3,
        "rot": 0
      }
    ]
  },
  {
    "id": 34,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 7,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 3,
        "c": 3,
        "rot": 0
      }
    ]
  },
  {
    "id": 35,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 2,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 36,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 0,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 3,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 37,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 0,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 3,
        "c": 0,
        "rot": 0
      }
    ]
  },
  {
    "id": 38,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 6,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 0,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 5,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 39,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 7,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 0,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 3,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 40,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 5,
        "c": 4,
        "rot": 0
      }
    ]
  },
  {
    "id": 41,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 1,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 5,
        "c": 4,
        "rot": 1
      }
    ]
  },
  {
    "id": 42,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 6,
        "c": 2,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 0,
        "c": 3,
        "rot": 1
      }
    ]
  },
  {
    "id": 43,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 6,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 6,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 44,
    "stars": 3,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 6,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 6,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 45,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 6,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 2,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 0,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 46,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 3,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 47,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 0,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 5,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 48,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 1,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 2,
        "c": 0,
        "rot": 1
      }
    ]
  },
  {
    "id": 49,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 7,
        "c": 5,
        "rot": 1
      }
    ]
  },
  {
    "id": 50,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 1,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 2,
        "c": 0,
        "rot": 1
      }
    ]
  },
  {
    "id": 51,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 7,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 0,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 4,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 52,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 2,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 53,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 7,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 0,
        "c": 3,
        "rot": 0
      }
    ]
  },
  {
    "id": 54,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 2,
        "c": 0,
        "rot": 1
      }
    ]
  },
  {
    "id": 55,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 5,
        "c": 3,
        "rot": 1
      }
    ]
  },
  {
    "id": 56,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 7,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 3,
        "c": 0,
        "rot": 0
      }
    ]
  },
  {
    "id": 57,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 0,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 3,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 58,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 7,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 2,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 59,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 6,
        "c": 3,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 2,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 60,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 4,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 5,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 61,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 6,
        "c": 2,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 3,
        "c": 5,
        "rot": 1
      }
    ]
  },
  {
    "id": 62,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 6,
        "c": 4,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 0,
        "c": 3,
        "rot": 1
      }
    ]
  },
  {
    "id": 63,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 3,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 64,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 2,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 5,
        "c": 4,
        "rot": 1
      }
    ]
  },
  {
    "id": 65,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 3,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 4,
        "c": 4,
        "rot": 0
      }
    ]
  },
  {
    "id": 66,
    "stars": 4,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 0,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 3,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 67,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 0,
        "c": 3,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 7,
        "c": 0,
        "rot": 0
      }
    ]
  },
  {
    "id": 68,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 7,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 69,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 7,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 70,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 7,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 71,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 7,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 72,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 7,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 7,
        "c": 0,
        "rot": 0
      }
    ]
  },
  {
    "id": 73,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 5,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 5,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 74,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 6,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 5,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 75,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 6,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 7,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 7,
        "c": 0,
        "rot": 0
      }
    ]
  },
  {
    "id": 76,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 2,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 77,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 6,
        "c": 4,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 7,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 78,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 4,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 7,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 79,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 4,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 0,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 80,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 0,
        "c": 0,
        "rot": 1
      }
    ]
  },
  {
    "id": 81,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 5,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 82,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 3,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 3,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 0,
        "c": 2,
        "rot": 0
      }
    ]
  },
  {
    "id": 83,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 4,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 0,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 3,
        "c": 7,
        "rot": 1
      }
    ]
  },
  {
    "id": 84,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 2,
        "c": 0,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 2,
        "c": 1,
        "rot": 0
      }
    ]
  },
  {
    "id": 85,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 2,
        "c": 2,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 4,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 3,
        "c": 5,
        "rot": 0
      }
    ]
  },
  {
    "id": 86,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 4,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 0,
        "c": 3,
        "rot": 0
      },
      {
        "id": "K3",
        "r": 0,
        "c": 5,
        "rot": 1
      }
    ]
  },
  {
    "id": 87,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 5,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 0,
        "c": 7,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 3,
        "c": 0,
        "rot": 0
      }
    ]
  },
  {
    "id": 88,
    "stars": 5,
    "blockers": [
      {
        "id": "K1",
        "r": 1,
        "c": 5,
        "rot": 0
      },
      {
        "id": "K2",
        "r": 3,
        "c": 7,
        "rot": 1
      },
      {
        "id": "K3",
        "r": 0,
        "c": 5,
        "rot": 0
      }
    ]
  }
];
