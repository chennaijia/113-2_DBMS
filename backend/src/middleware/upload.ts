import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({ storage }).fields([
  { name: 'content_pic', maxCount: 1 },
  { name: 'answer_pic', maxCount: 1 },
  { name: 'detail_ans_pic', maxCount: 1 },
]);
