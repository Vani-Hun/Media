// import { signInWithPhoneNumber, PhoneAuthProvider, getAuth, } from 'firebase/auth';
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyAbjYYbreGwSN-pY5UoNZp-KF4yJcgWNV8",
//     authDomain: "fir-76c15.firebaseapp.com",
//     projectId: "fir-76c15",
//     storageBucket: "fir-76c15.appspot.com",
//     messagingSenderId: "112323394158",
//     appId: "1:112323394158:web:db2d6bf8492a523ced847f",
//     measurementId: "G-Q7ZQR4556T"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = getAuth(app);
// const phoneNumber = "0399427359"
// const confirmationResult = await (await signInWithPhoneNumber(auth, phoneNumber, {
//     recaptcha: window.recaptchaVerifier // Use a reCAPTCHA verifier (required for web)
// }));


// // Send the verification code to the user (via SMS, email, etc.)
// console.log("Verification ID:", confirmationResult.verificationId); // Use this ID for confirmation