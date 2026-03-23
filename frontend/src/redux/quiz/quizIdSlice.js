import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: ""
};

const quizIdSlice = createSlice({
  name: 'quizId',
  initialState,
  reducers: {
    setQuizId: (state, action) => {
      state.value = action.payload;
    },
  
  }
});

export const { setQuizId } = quizIdSlice.actions;
export default quizIdSlice.reducer;
