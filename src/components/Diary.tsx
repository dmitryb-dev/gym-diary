import { useDiaryState } from '../useDiaryState.ts';
import { none, State } from '@hookstate/core';
import { settings } from '../settings.ts';
import { createContext, useContext, useEffect, useState } from 'react';

const ActionContext = createContext('increase')
let lastAtionTime = Date.now();

export function Diary() {
  const [action, setAction] = useState('increase');
  const [timer, setTimer] = useState('0:0');

  useEffect(() => {
    window.scrollTo(document.body.scrollWidth, 0);

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastAtionTime;
      setTimer(new Date(elapsed).toISOString().substr(14, 5))
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const diary = useDiaryState(true);

  return <ActionContext.Provider value={action}>
    <table>
      <thead>
        <tr>
          <th/>
          {diary.dates.map(date =>
            <WorkoutDate key={date.get()} date={date}/>
          )}
        </tr>
      </thead>
      <tbody>
        {Object.keys(settings.exercises).map(group =>
          <ExerciseGroup key={group} group={group}/>
        )}
      </tbody>
    </table>

    <div className='footer'>
      <p className='timer'>Last action timer: {timer}</p>
      <button className='action'
              onClick={() => setAction(action == 'increase' ? 'decrease' : 'increase')}>
        on-click: {action}
      </button>
    </div>
  </ActionContext.Provider>;
}

function WorkoutDate({ date }: { date: State<string> }) {
  const parsed = new Date(date.get());
  return <th>{parsed.getDate()}.{parsed.getMonth()}</th>;
}

function ExerciseGroup({ group }: { group: string }) {
  const diary = useDiaryState();

  return <>
    <tr className='group'>
      <td>{group}</td>
      <td colSpan={diary.dates.length}></td>
    </tr>
    {settings.exercises[group].map(exercise =>
      <Exercise key={exercise} group={group} exercise={exercise}/>
    )}
  </>;
}

function Exercise({ group, exercise }: { group: string, exercise: string }) {
  return <>
    {Array(settings.sets).fill(null).map((_i, i) =>
      <ExerciseSet key={i} group={group} exercise={exercise} set={i}/>
    )}
  </>;
}

function ExerciseSet({ group, exercise, set }: {
  group: string,
  exercise: string,
  set: number,
}) {
  const diary = useDiaryState();

  return <tr>
    {set == 0 ? <td>{exercise}</td> : <td/>}
    {diary.dates.get().map(date =>
      <ExerciseSetDate key={date} group={group} exercise={exercise} set={set} date={date}/>
    )}
  </tr>;
}

function ExerciseSetDate({ group, exercise, set, date }: {
  group: string,
  exercise: string,
  set: number,
  date: string,
}) {
  const diary = useDiaryState();
  const action = useContext(ActionContext);
  const setData = diary.groups[group]?.[exercise]?.[set]?.[date];

  function handleClick() {
    lastAtionTime = Date.now();

    if (!setData?.get()) {
      diary.groups[group].merge({});
      diary.groups[group][exercise].merge({});
      diary.groups[group][exercise][set].merge({});

      const setData = diary.groups[group][exercise][set][date];
      let prevDay: string | null = null;
      diary.dates.forEach(d => {
        if (new Date(d.get()).getTime() < new Date(date).getTime()
          && (!prevDay || new Date(d.get()).getTime() > new Date(prevDay).getTime())
          && diary.groups[group]?.[exercise]?.[set]?.[d.get()]?.get()
        ) {
          prevDay = d.get();
        }
      });
      const prevDaySetData = diary.groups[group]?.[exercise]?.[set]?.[prevDay || '']?.get();

      setData.set({
        weight: prevDaySetData?.weight || settings.minWeight,
        reps: prevDaySetData?.reps || settings.minReps,
      });
      return;
    }

    switch (action) {
      case 'increase': {
        if (setData.reps.get() >= settings.maxReps) {
          setData.reps.set(() => settings.minReps);
          setData.weight.set(w => w + settings.step);
        } else {
          setData.reps.set(r => r + 1);
        }
        break
      }
      case 'decrease': {
        if (setData.reps.get() <= settings.minReps) {
          setData.reps.set(() => settings.maxReps);
          setData.weight.set(w => w - settings.step);

          if (setData.weight.get() <= settings.minWeight) {
            setData.set(none);
          }
        } else {
          setData.reps.set(r => r - 1);
        }
        break
      }
    }
  }

  if (!setData?.get()) return <td onClick={handleClick}/>;
  return <td onClick={handleClick}>{setData?.weight?.get()}/{setData?.reps?.get()}</td>;
}