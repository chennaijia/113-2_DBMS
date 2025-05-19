import { api } from './index'

export const fetchQuestionsByBook = (bookId: number) =>
  api.get(`/questions/by-book/${bookId}`)

export const deleteQuestionById = (id: number) =>
  api.delete(`/questions/${id}`)

export const updateStarStatus = (id: number, isStar: boolean) =>
  api.patch(`/questions/${id}/star`, { isStar })

export const updateNote = (id: any, note: any) => {
   return api.patch(`/questions/${id}/note`, { note })
}

export const fetchRandomQuestion = () =>
  api.get('/questions/random');
