import { BadRequestException, Inject } from '@nestjs/common';
import { createReadStream, createWriteStream, existsSync, mkdirSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import { staticFolder } from '../utils/constant';
import { VideoService } from 'src/video/video.service';
const { Storage } = require('@google-cloud/storage');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');

export class UtilService {

  // checkFormat(file: Express.Multer.File, format: string[]) {
  //   if (!format.includes(_.last(file.originalname.split('.')))) {
  //     this.clearTmp(file.path);
  //     throw new BadRequestException(
  //       `You can only upload file with format: ${format}`,
  //     );
  //   }
  // }

  updateFile(file: Express.Multer.File, oldFile: string) {
    const readStream = createReadStream(file.path)
    this.checkExist(oldFile) && this.clearFile(oldFile);
    const writeSteam = createWriteStream(join(staticFolder, oldFile))

    readStream.pipe(writeSteam)

    this.clearTmp(file.path)
    console.log("file.path:", file.path)

    return `/${oldFile}`
  }



  checkExist(path: string): boolean {
    return path && existsSync(join(staticFolder, path))
  }

  clearTmp(tmpPath: string) {
    unlinkSync(tmpPath);
  }

  clearFile(path) {
    unlinkSync(join(staticFolder, path));
  }

  async deleteFile(bucket, file) {
    const storage = new Storage();
    // Xác định tên bucket và tên đối tượng
    const bucketName = bucket.name;
    const filePath = `https://storage.googleapis.com/${bucket.name}/${file.name}`

    try {
      // Lấy đối tượng file
      const file = storage.bucket(bucketName).file(filePath);
      if (file['name']) {
        console.log("file['name']:", file['name'])
        // Nếu tệp tin tồn tại, xóa nó
        await file.delete();
        console.log(`Đã xóa tệp tin: ${filePath}`);
      } else {
        console.log(`Tệp tin không tồn tại: ${filePath}`);
      }
    } catch (error) {
      console.error(`Lỗi khi xóa tệp tin: ${error}`);
    }
  }
}
