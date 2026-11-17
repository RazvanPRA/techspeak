import { configureStore } from '@reduxjs/toolkit';
import { shadowingReducer } from '@/features/shadowing';

export function createStore() {
  return configureStore({ reducer: { shadowing: shadowingReducer } });
}

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore['getState']>;
