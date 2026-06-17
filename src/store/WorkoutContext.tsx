import React, { createContext, useContext, useRef, useState } from 'react';
import * as db from '@/db/database';
import { suggestWeight } from '@/lib/progression';

export interface ActiveSet {
  id: number;
  setIndex: number;
  weight: number;
  reps: number;
  targetReps: string | null;
  done: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  restSec: number;
  rpe?: string;
  suggestedWeight: number;
  suggestionReason: 'first' | 'progress' | 'repeat';
  sets: ActiveSet[];
}

interface WorkoutState {
  workoutId: number | null;
  name: string;
  mode: 'program' | 'free';
  startedAt: number;
  exercises: ActiveExercise[];
}

interface WorkoutContextValue {
  active: WorkoutState | null;
  start: (
    name: string,
    mode: 'program' | 'free',
    programDay: number | null,
    plan: { exerciseId: string; sets: number; reps: string; rpe?: string; restSec: number }[]
  ) => Promise<void>;
  addExercise: (exerciseId: string, sets?: number, reps?: string, restSec?: number) => Promise<void>;
  addSetTo: (exerciseId: string) => Promise<void>;
  saveSet: (exerciseId: string, setId: number, weight: number, reps: number, done: boolean) => Promise<void>;
  removeSet: (exerciseId: string, setId: number) => Promise<void>;
  finish: () => Promise<void>;
  cancel: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<WorkoutState | null>(null);
  const stateRef = useRef<WorkoutState | null>(null);
  const setState = (s: WorkoutState | null) => {
    stateRef.current = s;
    setActive(s);
  };

  const start: WorkoutContextValue['start'] = async (name, mode, programDay, plan) => {
    const workoutId = await db.startWorkout(name, mode, programDay);
    const exercises: ActiveExercise[] = [];
    for (const p of plan) {
      const suggestion = await suggestWeight(p.exerciseId);
      const sets: ActiveSet[] = [];
      for (let i = 0; i < p.sets; i++) {
        const id = await db.addSet(workoutId, p.exerciseId, i, suggestion.weight, 0, p.reps);
        sets.push({
          id,
          setIndex: i,
          weight: suggestion.weight,
          reps: db.parseTargetReps(p.reps) ?? 0,
          targetReps: p.reps,
          done: false,
        });
      }
      exercises.push({
        exerciseId: p.exerciseId,
        restSec: p.restSec,
        rpe: p.rpe,
        suggestedWeight: suggestion.weight,
        suggestionReason: suggestion.reason,
        sets,
      });
    }
    setState({ workoutId, name, mode, startedAt: Date.now(), exercises });
  };

  const addExercise: WorkoutContextValue['addExercise'] = async (
    exerciseId,
    setsCount = 3,
    reps = '10',
    restSec = 120
  ) => {
    const s = stateRef.current;
    if (!s?.workoutId) return;
    if (s.exercises.some((e) => e.exerciseId === exerciseId)) return;
    const suggestion = await suggestWeight(exerciseId);
    const sets: ActiveSet[] = [];
    for (let i = 0; i < setsCount; i++) {
      const id = await db.addSet(s.workoutId, exerciseId, i, suggestion.weight, 0, reps);
      sets.push({
        id,
        setIndex: i,
        weight: suggestion.weight,
        reps: db.parseTargetReps(reps) ?? 0,
        targetReps: reps,
        done: false,
      });
    }
    setState({
      ...s,
      exercises: [
        ...s.exercises,
        {
          exerciseId,
          restSec,
          suggestedWeight: suggestion.weight,
          suggestionReason: suggestion.reason,
          sets,
        },
      ],
    });
  };

  const addSetTo: WorkoutContextValue['addSetTo'] = async (exerciseId) => {
    const s = stateRef.current;
    if (!s?.workoutId) return;
    const ex = s.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) return;
    const lastSet = ex.sets[ex.sets.length - 1];
    const idx = ex.sets.length;
    const id = await db.addSet(
      s.workoutId, exerciseId, idx, lastSet?.weight ?? 0, 0, lastSet?.targetReps ?? null
    );
    const newSet: ActiveSet = {
      id,
      setIndex: idx,
      weight: lastSet?.weight ?? 0,
      reps: lastSet?.reps ?? 0,
      targetReps: lastSet?.targetReps ?? null,
      done: false,
    };
    setState({
      ...s,
      exercises: s.exercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, sets: [...e.sets, newSet] } : e
      ),
    });
  };

  const saveSet: WorkoutContextValue['saveSet'] = async (exerciseId, setId, weight, reps, done) => {
    const s = stateRef.current;
    if (!s) return;
    await db.updateSet(setId, weight, reps, done);
    setState({
      ...s,
      exercises: s.exercises.map((e) =>
        e.exerciseId === exerciseId
          ? {
              ...e,
              sets: e.sets.map((st) => (st.id === setId ? { ...st, weight, reps, done } : st)),
            }
          : e
      ),
    });
  };

  const removeSet: WorkoutContextValue['removeSet'] = async (exerciseId, setId) => {
    const s = stateRef.current;
    if (!s) return;
    await db.deleteSet(setId);
    setState({
      ...s,
      exercises: s.exercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, sets: e.sets.filter((st) => st.id !== setId) } : e
      ),
    });
  };

  const finish = async () => {
    const s = stateRef.current;
    if (s?.workoutId) await db.finishWorkout(s.workoutId);
    setState(null);
  };

  const cancel = async () => {
    const s = stateRef.current;
    if (s?.workoutId) await db.deleteWorkout(s.workoutId);
    setState(null);
  };

  return (
    <WorkoutContext.Provider
      value={{ active, start, addExercise, addSetTo, saveSet, removeSet, finish, cancel }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout outside WorkoutProvider');
  return ctx;
}
