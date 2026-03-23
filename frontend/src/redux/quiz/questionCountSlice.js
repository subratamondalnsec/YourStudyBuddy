import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setQuestionCount: (state, action) => {
      state.value = action.payload;
    },
  
  }
});

export const { setQuestionCount } = counterSlice.actions;
export default counterSlice.reducer;
