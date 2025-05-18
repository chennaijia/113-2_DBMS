import { api } from './index';

export const fetchQBs   = ()            => api.get ('/qb');
export const createQB   = (data: any)   => api.post('/qb', data);
export const updateQB   = (id: number, data: any) => api.put   (`/qb/${id}`, data);
export const deleteQB   = (id: number)  => api.delete(`/qb/${id}`);
export const copyQB   = (id: number)             => api.post  (`/qb/${id}/copy`);
