import { useEffect } from 'react';

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