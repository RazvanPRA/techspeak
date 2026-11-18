import { configureStore } from '@reduxjs/toolkit';
import { shadowingReducer } from '@/features/shadowing';
import { vocabularyReducer } from '@/features/vocabulary';

export function createStore() {
  return configureStore({
    reducer: { shadowing: shadowingReducer, vocabulary: vocabularyReducer },
  });
}

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore['getState']>;
