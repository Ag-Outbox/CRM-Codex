import { useState } from 'react';
import { Activity } from '../lib/types';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);

  const addActivity = (entry: Omit<Activity, 'id' | 'created_at'>) => {
    setActivities((prev) => [
      {
        ...entry,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return { activities, addActivity };
}
