import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// Only IDs are stored: article contents have a single owner, postsSlice.
const initialState: { byReader: Record<string, number[]> } = { byReader: {} };
export const readingSlice = createSlice({
  name: 'reading',
  initialState,
  reducers: {
    toggleSaved: (
      state,
      { payload }: PayloadAction<{ reader: string; id: number }>,
    ) => {
      const ids = (state.byReader[payload.reader] ??= []);
      const index = ids.indexOf(payload.id);
      if (index < 0) ids.push(payload.id);
      else ids.splice(index, 1);
    },
  },
});
export const { toggleSaved } = readingSlice.actions;
