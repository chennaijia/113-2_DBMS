import { api } from './index'

export const createCheckIn = (date: string) =>
  api.post('/checking', { date })

export const fetchCheckInsByMonth = (month: string) =>
  api.get(`/checkings?month=${month}`)
