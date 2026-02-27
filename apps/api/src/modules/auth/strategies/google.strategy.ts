import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID') || 'placeholder',
      clientSecret: config.get('GOOGLE_CLIENT_SECRET') || 'placeholder',
      callbackURL: config.get('OAUTH_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { id: string; emails: { value: string }[]; displayName: string; photos: { value: string }[] },
    done: VerifyCallback,
  ) {
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      provider: 'google',
      avatarUrl: profile.photos[0]?.value,
    };
    done(null, user);
  }
}
