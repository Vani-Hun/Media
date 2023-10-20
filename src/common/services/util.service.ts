import { BadRequestException } from '@nestjs/common';
import { createReadStream, createWriteStream, existsSync, mkdirSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import { staticFolder } from '../utils/constant';
import * as _ from 'lodash';
import { bucket, firebaseAdmin, videoFile } from '../utils/firebase.config';
const { Storage } = require('@google-cloud/storage');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');


export class UtilService {

  checkFormat(file: Express.Multer.File, format: string[]) {
    if (!format.includes(_.last(file.originalname.split('.')))) {
      this.clearTmp(file.path);
      throw new BadRequestException(
        `You can only upload file with format: ${format}`,
      );
    }
  }

  updateFile(file: Express.Multer.File, oldFile: string) {
    const readStream = createReadStream(file.path)
    this.checkExist(oldFile) && this.clearFile(oldFile);
    const writeSteam = createWriteStream(join(staticFolder, oldFile))

    readStream.pipe(writeSteam)

    this.clearTmp(file.path)

    return `/${oldFile}`
  }


  async uploadVideo(input) {
    console.log("input:", input)
    const videoData = readFileSync(input.video.path);

    // Tạo Buffer từ dữ liệu video
    const videoBuffer = Buffer.from(videoData);
    const file = bucket.file(`videos/${input.video.filename}`);


    await file.save(videoBuffer, {
      metadata: {
        contentType: 'video/mp4',
      },
    });


    await this.clearTmp(input.video.path);
    const fileRef = await getStorage().bucket(`${bucket.name}`).file(`${file.name}`);
    const downloadURL = await getDownloadURL(fileRef);
    // return downloadURL;
  }
  async uploadFile(input) {
    const data = readFileSync(input.avatar.path);
    const fileBuffer = Buffer.from(data);
    const filePath = `avatars/${input.user.id}`;
    const file = bucket.file(filePath);
    const [fileExists] = await file.exists();
    if (fileExists) {
      await file.delete();
      console.log(`Đã xóa tệp tin tồn tại: ${filePath}`);
    }
    await file.save(fileBuffer, {
      metadata: {
        contentType: input.avatar.mimetype,
      },
    });
    await this.clearTmp(input.avatar.path);
    const fileRef = await getStorage().bucket(`${bucket.name}`).file(`${file.name}`);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  }

  async loadVideo() {
    const url = await videoFile.getSignedUrl({
      action: 'read',
      expires: '03-17-2025' // Thời gian URL sẽ hết hạn
    });

    console.log('Video URL:', url);
    return
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
