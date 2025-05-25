import { api } from './index'

export interface PracticeQuestionRecord {
  Rquestion_Id: number;
  user_answer: string;
  is_correct: boolean;
}

export interface PracticeSubmitPayload {
  total_qCount: number;
  err_qCount: number;
  accuracy: number;
  time_spent: number;
  questions: PracticeQuestionRecord[];
}

export const submitPracticeResult = async (payload: PracticeSubmitPayload) => {
  const res = await api.post('/review-test', payload)
  return res.data
}

