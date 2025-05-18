import { Router } from 'express';
import {
  createQB,   // POST   /api/books      → 建立題本
  listQB,     // GET    /api/books      → 所有題本清單
  getQB,      // GET    /api/books/:id  → 取得單一本
  updateQB,   // PUT    /api/books/:id  → 修改題本
  deleteQB,   // DELETE /api/books/:id  → 刪除題本
  copyQB,    // POST   /api/books/:id/copy → 複製題本
} from '../controllers/qb.controller';
import { auth } from '../middleware/auth';

export const qbRouter = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/* ---------- CRUD routes ---------- */
qbRouter.post('/',      auth, asyncHandler(createQB));   // 需要登入
qbRouter.get('/',              asyncHandler(listQB));   // 公開列出
qbRouter.get('/:id', asyncHandler(getQB));    // 公開單一題本
qbRouter.put('/:id',    auth,  asyncHandler(updateQB)); // 需要登入+擁有者
qbRouter.delete('/:id', auth,  asyncHandler(deleteQB)); // 需要登入+擁有者
qbRouter.post('/:id/copy', auth, asyncHandler(copyQB)); // 需要登入+擁有者
