import { api } from './index';

//export const fetchQBs  = ()                          => api.get   ('/books');
export const createQB  = (data: any)                 => api.post  ('/books', data);
export const updateQB  = (id: number, data: any)     => api.put   (`/books/${id}`, data);
export const deleteQB  = (id: number)                => api.delete(`/books/${id}`);
export const copyQB    = (id: number)                => api.post  (`/books/${id}/copy`);

export const fetchQBs = () => {
  const token = localStorage.getItem('token');
  console.log('📦 token:', token); // ✅ 檢查是否有值
  return api.get('/books', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
