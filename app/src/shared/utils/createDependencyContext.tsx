import React, { createContext, type ReactNode, useContext } from 'react';

/**
 * A typed React context for one feature's injected dependencies
 * (implementations are chosen in src/app/dependencies.ts).
 */
export function createDependencyContext<T>(name: string) {
  const Context = createContext<T | null>(null);

  function Provider(props: { value: T; children: ReactNode }) {
    return <Context.Provider value={props.value}>{props.children}</Context.Provider>;
  }

  function useDependencies(): T {
    const value = useContext(Context);
    if (!value) throw new Error(`${name}DependenciesProvider is missing`);
    return value;
  }

  return { Provider, useDependencies };
}
