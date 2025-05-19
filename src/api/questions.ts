import { api } from './index'

/** 取得指定題本的全部題目（含本人才能看的欄位） */
export const fetchQuestionsByBook = (bookId: number) =>
  api.get(`/questions/by-book/${bookId}`)
