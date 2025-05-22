import { api } from './index'

export const fetchQuestionsByBook = (bookId: number) =>
  api.get(`/questions/by-book/${bookId}`)

export const deleteQuestionById = (id: number) =>
  api.delete(`/questions/${id}`)

export const updateStarStatus = (id: number, isStar: boolean) =>
  api.patch(`/questions/${id}/star`, { isStar })

export const updateNote = (id: number, note: string) => {
   return api.patch(`/questions/${id}/note`, { note })
}

export const fetchRandomQuestion = () =>
  api.get('/questions/random');

export async function fetchQuestionsByBookPractice(bookId: number) {
  const res = await api.get(`/questions/by-book/${bookId}`)
  return res.data // ✅ 這裡要回傳資料，不是整個 response
}

export async function fetchRandomQuestionsPractice(bookId: number, userId: number, count: number) {
  const res = await api.get(`/questions/random-practice`, {
    params: { bookId, userId, count }
  })
  return res.data
}

export async function fetchMostWrongQuestions(bookId: number, userId: number, count: number) {
  const res = await api.get(`/questions/most-wrong`, {
    params: { bookId, userId, count }
  })
  return res.data
}

export async function fetchQuestionCount(bookId: number) {
  const res = await api.get(`/questions/count/${bookId}`)
  return res.data.count
}

export const submitQuestion = (id: number, answer: string) =>
  api.post(`/questions/${id}/submit`, { answer });

export const updateQuestionById = (qid: number, form: FormData) =>
  api.patch(`/question/${qid}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
