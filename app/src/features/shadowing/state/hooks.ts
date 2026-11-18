import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { ShadowingRootState } from './slice';

export const useShadowingSelector = useSelector.withTypes<ShadowingRootState>();
export const useShadowingDispatch = useDispatch.withTypes<Dispatch<UnknownAction>>();
