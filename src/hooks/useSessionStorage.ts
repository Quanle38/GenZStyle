import { useState, useEffect } from "react";

export default function useSessionStorage<T>(keyName: string, defaultValue: T) {
    //state luu gia tri
  const [storedValue, setStoredValue] = useState<T>(defaultValue);

  useEffect(() => {
    const savedValue = sessionStorage.getItem(keyName);
    if (savedValue) {
      setStoredValue(JSON.parse(savedValue));
    } else {
      sessionStorage.setItem(keyName, JSON.stringify(defaultValue));
    }
  }, [keyName, defaultValue]);

  const saveValue = (newValue: T) => {
    setStoredValue(newValue);
    sessionStorage.setItem(keyName, JSON.stringify(newValue));
  };

  return { storedValue, saveValue };
}
