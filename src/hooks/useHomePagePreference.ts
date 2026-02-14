import { useState, useEffect } from 'react';

export type HomePageOption = 
  | '/'
  | '/dashboard'
  | '/classes'
  | '/todo'
  | '/study-groups'
  | '/settings';

export interface HomePageConfig {
  value: HomePageOption;
  label: string;
}

export const homePageOptions: HomePageConfig[] = [
  { value: '/', label: 'Calendar' },
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/classes', label: 'Classes' },
  { value: '/todo', label: 'To-Do' },
  { value: '/study-groups', label: 'Study Hub' },
  { value: '/settings', label: 'Settings' },
];

const STORAGE_KEY = 'forward-home-page';

export function useHomePagePreference() {
  const [homePage, setHomePageState] = useState<HomePageOption>('/');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && homePageOptions.some(opt => opt.value === stored)) {
      setHomePageState(stored as HomePageOption);
    }
  }, []);

  const setHomePage = (page: HomePageOption) => {
    setHomePageState(page);
    localStorage.setItem(STORAGE_KEY, page);
  };

  return {
    homePage,
    setHomePage,
    homePageOptions,
  };
}
