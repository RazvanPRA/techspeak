import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { VocabularyRootState } from './slice';

export const useVocabularySelector = useSelector.withTypes<VocabularyRootState>();
export const useVocabularyDispatch = useDispatch.withTypes<Dispatch<UnknownAction>>();
