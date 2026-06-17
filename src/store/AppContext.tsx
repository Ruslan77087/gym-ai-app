import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDatabase } from '@/db/database';
import { UserProfile } from '@/lib/types';

const STORAGE_KEY = 'user_settings_v1';

export const DEFAULT_PROFILE: UserProfile = {
  onboardingDone: false,
  goal: 'mass',
  level: 'intermediate',
  trainingDays: [1, 3, 5],
  sex: 'male',
  age: 30,
  weightKg: 80,
  heightCm: 180,
  programId: 'fullbody-3',
};

interface AppContextValue {
  ready: boolean;
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
}

const AppContext = createContext<AppContextValue>({
  ready: false,
  profile: DEFAULT_PROFILE,
  updateProfile: async () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
      } catch (e) {
        console.warn('App init failed', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const updateProfile = async (patch: Partial<UserProfile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <AppContext.Provider value={{ ready, profile, updateProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
