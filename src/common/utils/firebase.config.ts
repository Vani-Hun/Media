// FirebaseConfigModule.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { getAuth, signInWithPhoneNumber } from 'firebase/auth';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'FIREBASE_CONFIG',
            useFactory: (configService: ConfigService) => {
                const serviceAccount = {
                    type: configService.get<string>('SERVICE_ACCOUNT_TYPE'),
                    project_id: configService.get<string>('SERVICE_ACCOUNT_PROJECT_ID'),
                    private_key_id: configService.get<string>('SERVICE_ACCOUNT_PRIVATE_KEY_ID'),
                    private_key: configService.get<string>('SERVICE_ACCOUNT_PRIVATE_KEY'),
                    client_email: configService.get<string>('SERVICE_ACCOUNT_CLIENT_EMAIL'),
                    client_id: configService.get<string>('SERVICE_ACCOUNT_CLIENT_ID'),
                    auth_uri: configService.get<string>('SERVICE_ACCOUNT_AUTH_URI'),
                    token_uri: configService.get<string>('SERVICE_ACCOUNT_TOKEN_URI'),
                    auth_provider_x509_cert_url: configService.get<string>('SERVICE_ACCOUNT_AUTH_PROVIDER'),
                    client_x509_cert_url: configService.get<string>('SERVICE_ACCOUNT_CLIENT'),
                    universe_domain: configService.get<string>('SERVICE_ACCOUNT_UNIVERSE_DOMAIN'),
                };
                const serviceAccountTyped: admin.ServiceAccount = serviceAccount as admin.ServiceAccount;
                const firebaseAdmin = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccountTyped),
                    storageBucket: 'gs://fir-76c15.appspot.com', // Lấy giá trị từ configService
                });

                const bucket = firebaseAdmin.storage().bucket();
                bucket.setCorsConfiguration([
                    {
                        origin: [configService.get<string>('ORIGIN'), 'http://localhost:3000'],
                        method: ["GET", "POST", "PUT", "DELETE"],
                        responseHeader: ["Content-Type"]
                    }
                ]);
                return { firebaseAdmin, bucket };
            },
            inject: [ConfigService],
        },
    ],
    exports: ['FIREBASE_CONFIG'],
})
export class FirebaseConfigModule { }
