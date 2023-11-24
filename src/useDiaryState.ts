import { hookstate, none, State, useHookstate } from '@hookstate/core';
import { localstored } from '@hookstate/localstored';
import { settings } from './settings.ts';
import { useEffect } from 'react';


export type GymData = {
  dates: string[],
  groups: {
    [group: string]: {
      [exercise: string]: {
        [set: number]: {
          [date: string]: {
            weight: number,
            reps: number,
          }
        }
      }
    },
  },
};


const globalState = hookstate<GymData>({ dates: [], groups: {} }, localstored({ key: 'gym-diary' }));

export function useDiaryState(validation?: boolean): State<GymData> {
  const state = useHookstate(globalState);
  useEffect(() => {
    if (validation) validate(state);
  }, []);

  return state;
}


function validate(data: State<GymData>) {
  function addToday() {
    const today = new Date();
    const lastDay = data.dates.length && new Date(data.dates[data.dates.length - 1].get());

    if (!lastDay || lastDay.toDateString() !== today.toDateString()) {
      data.dates.merge([ today.toString() ]);
    }
  }

  function removeEmptyDays() {
    data.dates.forEach(date => {
      let hasData = false;
      findLoop: for (const group in settings.exercises) {
        for (const exercise of settings.exercises[group]) {
          for (const set in Array(settings.sets).fill(null)) {
            if (data.groups[group]?.[exercise]?.[set]?.[date.get()]?.get()) {
              hasData = true;
              break findLoop;
            }
          }
        }
      }
      if (!hasData) date.set(none);
    });
  }

  removeEmptyDays();
  addToday();
}