export function passThroughLog <T>(result: T, prettyPrint?: boolean): T {
  if (prettyPrint) {
    console.debug(JSON.stringify(result, null, 2));
  } else {
    console.debug(result)
  }
  return result
}

export const Debug = (o: any) => <pre>{JSON.stringify(o, null, 2)}</pre>