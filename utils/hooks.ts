import { useEffect } from 'react';

const keyCodeMap = {
  "left": 37,
  "right": 39
}

export const keyToCode = (key: keyof typeof keyCodeMap) => {
  return keyCodeMap[key]
}

export function useKeyPress (keyCode: number, callback: (e: any) => void, node: any = document) {
  const keyPressEvent = (e: any) => {
    if (e.keyCode === keyCode) {
      callback(e)
    }
  };

  useEffect(() => {
    node.addEventListener("keydown", keyPressEvent);

    return () => {
      node.removeEventListener("keydown", keyPressEvent);
    };
  })
}