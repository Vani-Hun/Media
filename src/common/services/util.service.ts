import { BadRequestException } from '@nestjs/common';
import { createReadStream, createWriteStream, existsSync, mkdirSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import { staticFolder } from '../utils/constant';
import * as _ from 'lodash';
import { bucket, firebaseAdmin, videoFile } from '../utils/firebase.config';
const { Storage } = require('@google-cloud/storage');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
import * as fs from 'fs';
import * as path from 'path';

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
    console.log("file.path:", file.path)

    return `/${oldFile}`
  }


  async uploadVideo(input) {
    try {
      const base64Data = input.image.replace(/^data:image\/jpeg;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const videoStream = createReadStream(input.video.path);
      const videoFile = bucket.file(`videos/${input.video.filename}`);
      const imageFile = bucket.file(`cover/${input.video.filename}`);
      const uploadStream = await videoFile.createWriteStream({
        metadata: {
          contentType: 'video/mp4',
        },
      })
      // Sử dụng Promise.allSettled() để đảm bảo rằng tất cả các promise đã được giải quyết
      const results = await Promise.allSettled([
        new Promise((resolve, reject) => {
          videoStream.pipe(uploadStream)
            .on('finish', resolve)
            .on('error', reject);
        }),
        imageFile.save(imageBuffer, {
          metadata: {
            contentType: 'image/jpeg',
          },
        }),
      ]);

      // Kiểm tra kết quả của các promise
      for (const result of results) {
        if (result.status === 'rejected') {
          throw result.reason;
        }
      }


      await uploadStream.end();
      await this.clearTmp(input.video.path);

      const [imgRef, fileRef] = await Promise.all([
        getStorage().bucket(`${bucket.name}`).file(`${imageFile.name}`),
        getStorage().bucket(`${bucket.name}`).file(`${videoFile.name}`),
      ]);
      const [imageURL, videoURL] = await Promise.all([
        getDownloadURL(imgRef),
        getDownloadURL(fileRef),
      ]);
      if (imageURL && videoURL) {
        return { imageURL, videoURL };
      }
    } catch (error) {
      console.error(error);
    }
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
