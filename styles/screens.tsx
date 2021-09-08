import { theme } from 'twin.macro'

/**
 * NOTE: Keep this in sync with the (custom) Tailwind theme `screens` config.
 * @see https://tailwindcss.com/docs/breakpoints
 */
export type Screen = "sm" | "md" | "lg" | "xl" | "2xl";
export const screens: any = theme`screens`

// The maximum value is calculated as the minimum of the next one less 0.02px.
// @see https://www.w3.org/TR/mediaqueries-4/#mq-min-max
const getNextBpValue = (bp: string) => {
  return `${parseInt(bp) - 0.02}px`;
};

export const up = (bp: Screen) => {
  const screen = screens[bp];
  return `@media only screen and (min-width: ${screen})`;
};

export const down = (bp: Screen) => {
  const screen = getNextBpValue(screens[bp]);
  return `@media only screen and (max-width: ${screen})`;
};

export const between = (bpMin: Screen, bpMax: Screen) => {
  const screenMin = screens[bpMin];
  const screenMax = getNextBpValue(screens[bpMax]);
  return `@media only screen and (min-width: ${screenMin}) and (max-width: ${screenMax})`;
};

export const only = (bp: Screen) => {
  const screenKeys = Object.keys(screens) as Screen[];
  const currentKeyIndex = screenKeys.indexOf(bp);
  const nextBp = screenKeys[currentKeyIndex + 1];
  return nextBp ? between(bp, nextBp) : up(bp);
};

import { useEffect, useState } from "react";

export const isClient = typeof window !== "undefined";
export const isServer = typeof window === "undefined";

export const isAnalyzing = process.env.ANALYZE === "true";
export const isDev = process.env.NODE_ENV === "development";
export const isProd = process.env.NODE_ENV === "production";

const getMatch = (query: string) => {
  return window.matchMedia(query);
};

const parseQueryString = (query: string) => {
  return query.replaceAll("@media only screen and", "").trim();
};

export const useMediaQuery = (query: string, defaultState = false) => {
  const parseAndMatch = (s: string) => getMatch(parseQueryString(s));
  const [state, setState] = useState(isClient ? () => parseAndMatch(query)?.matches ?? [] : defaultState);

  useEffect(() => {
    let mounted = true;
    const mql = parseAndMatch(query);

    const onChange = () => {
      if (!mounted) return;
      setState(!!mql?.matches);
    };

    if (mql?.addEventListener) {
      mql?.addEventListener("change", onChange);
    } else {
      mql?.addListener(onChange); // iOS 13 and below
    }

    if (mql?.matches) {
      setState(mql.matches);
    }

    return () => {
      mounted = false;

      if (mql?.removeEventListener) {
        mql?.removeEventListener("change", onChange);
      } else {
        mql?.removeListener(onChange); // iOS 13 and below
      }
    };
  }, [query]);

  return state;
};