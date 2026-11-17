import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { ShadowingDependenciesProvider } from '@/features/shadowing';
import { createDependencies } from './dependencies';
import { RootTabs } from './navigation/RootTabs';
import { createStore } from './store';

export function App() {
  const [store] = useState(createStore);
  const [deps] = useState(createDependencies);
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ShadowingDependenciesProvider value={deps.shadowing}>
          <NavigationContainer>
            <RootTabs />
          </NavigationContainer>
        </ShadowingDependenciesProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
