
"use client";

import { useState, useEffect, useCallback } from "react";
import { startOfWeek, addDays, format, subDays, getISOWeek } from "date-fns";

export function useWeek() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // This effect ensures that if the component is mounted on a new day,
    // the date is updated to reflect that, avoiding hydration mismatches.
    setCurrentDate(new Date());
  }, []);

  const getWeekDays = useCallback((date: Date) => {
    // Week starts on Sunday (0) to match date-fns getDay()
    const start = startOfWeek(date, { weekStartsOn: 0 }); 
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, []);

  const weekDates = isMounted ? getWeekDays(currentDate) : [];

  const goToNextWeek = () => setCurrentDate(prev => addDays(prev, 7));
  const goToPreviousWeek = () => setCurrentDate(prev => subDays(prev, 7));
  const goToCurrentWeek = () => setCurrentDate(new Date());

  const getWeekRangeLabel = useCallback(() => {
    if (!isMounted || weekDates.length === 0) return "Loading...";
    const start = weekDates[0];
    const end = weekDates[weekDates.length - 1];
    
    const currentWeekNumber = getISOWeek(new Date());
    const dateYear = new Date().getFullYear();
    const weekNumber = getISOWeek(start);
    const startYear = start.getFullYear();

    if (currentWeekNumber === weekNumber && dateYear === startYear) {
        return "This Week";
    }

    if (format(start, 'yyyy') === format(end, 'yyyy')) {
        if (format(start, 'MMMM') === format(end, 'MMMM')) {
            return `${format(start, "MMMM d")} - ${format(end, "d, yyyy")}`;
        } else {
            return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
        }
    }
    return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
  }, [isMounted, weekDates]);

  return { weekDates, goToNextWeek, goToPreviousWeek, goToCurrentWeek, getWeekRangeLabel, isMounted };
}

// A custom hook to synchronize state with local storage
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);


  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, isMounted]);

  const setValue = (value: T | ((val: T) => T)) => {
    if (!isMounted) {
      return;
    }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
