// google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.OAUTH2_CLIENT_ID,
            clientSecret: process.env.OAUTH2_CLIENT_SECRET,
            callbackURL: process.env.OAUTH2_REDIRECT,
            passReqToCallback: true,
            scope: ['profile', 'email'],
        });
    }

    async validate(request: any, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback,): Promise<any> {
        // console.log("profile:", profile)
        // console.log("refreshToken:", refreshToken)
        // console.log("accessToken:", accessToken)
        // Validate and store the user profile information
        // Return the user information to be stored in the JWT or session
        return done(null, profile);
    }
}
