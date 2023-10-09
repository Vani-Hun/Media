import * as admin from 'firebase-admin';

const serviceAccount = require('../../../serviceFirebase.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://fir-76c15.appspot.com', // Thay thế bằng ID của ứng dụng Firebase Storage của bạn
});

// Cấu hình CORS cho Firebase Storage
export const bucket = admin.storage().bucket();

export const firebaseAdmin = admin;
