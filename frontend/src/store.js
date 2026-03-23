import { configureStore } from '@reduxjs/toolkit';
import questionCount from './redux/quiz/questionCountSlice';
import quizId from './redux/quiz/quizIdSlice';

export const store = configureStore({
  reducer: {
    questionCounter: questionCount,
    quizId: quizId
  }
});
