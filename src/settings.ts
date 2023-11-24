export const settings = {
  sets: 2,

  minWeight: 10,
  step: 2.5,

  minReps: 4,
  maxReps: 10,

  exercises: {
    'Chest': [ 'Barbell', 'Dumbbell' ],
    'Shoulder': [ 'Dumbbell press' ],
    'Triceps': [ 'Cable overhead' ],

    'Back': [ 'Pull-down', 'Cable row' ],
    'Biceps': [ 'Cable curl' ],

    'Legs': [ 'Press', 'Toe press' ],
    'Abs': [ 'Cable crunch' ],
  } as { [group: string]: string[] },
};