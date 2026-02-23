import { useEffect, useState } from 'react';

type Org = { id: string; name: string } | null;

export function useOrg() {
  const [org, setOrg] = useState<Org>(null);

  useEffect(() => {
    const raw = localStorage.getItem('active_org');
    if (raw) setOrg(JSON.parse(raw));
  }, []);

  const setActiveOrg = (next: Org) => {
    setOrg(next);
    if (next) localStorage.setItem('active_org', JSON.stringify(next));
    else localStorage.removeItem('active_org');
  };

  return { org, setActiveOrg };
}
