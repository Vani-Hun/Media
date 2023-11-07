import * as admin from 'firebase-admin';

const serviceAccount = require('../../../serviceFirebase.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://fir-76c15.appspot.com', // Thay thế bằng ID của ứng dụng Firebase Storage của bạn
});

// Cấu hình CORS cho Firebase Storage
const bucket = admin.storage().bucket()
bucket.setCorsConfiguration([
    {
        origin: ["http://localhost:3000"],
        method: ["GET", "POST", "PUT", "DELETE"],
        responseHeader: ["Content-Type"]
    }
]);
export { bucket }
export const videoFile = admin.storage().bucket().file(`videos/admin_1696780201555`);
export const firebaseAdmin = admin;

