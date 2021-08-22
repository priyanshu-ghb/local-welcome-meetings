import { useEffect, useRef, useState } from 'react';

const keyCodeMap = {
  "left": 37,
  "right": 39
}

export const keyToCode = (key: keyof typeof keyCodeMap) => {
  return keyCodeMap[key]
}

export function useKeyPress (keyCode: number, callback: (e: any) => void) {
  const keyPressEvent = (e: any) => {
    if (e.keyCode === keyCode) {
      callback(e)
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keyPressEvent);

    return () => {
      document.removeEventListener("keydown", keyPressEvent);
    };
  })
}

export function usePrevious<T>(value: T) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T>();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export function useTime () {
  const [time, setTime] = useState(new Date)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return time;
}