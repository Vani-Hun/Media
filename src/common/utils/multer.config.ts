import * as multer from 'multer';
import { join } from 'path';
import { staticFolder } from './constant';

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./client/public/audio/`)
  },
  filename: function (req, file, cb) {
    const filename = `${req['user'].id}_${Date.now()}`;
    cb(null, filename);
  },
});
