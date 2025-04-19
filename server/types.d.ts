// Add declaration for passport-openidconnect
declare module 'passport-openidconnect' {
  import { Strategy as PassportStrategy } from 'passport';
  
  export interface Profile {
    id: string;
    displayName: string;
    name?: {
      familyName?: string;
      givenName?: string;
      middleName?: string;
    };
    emails?: Array<{ value: string; type?: string }>;
    photos?: Array<{ value: string }>;
  }
  
  export interface StrategyOptions {
    issuer: string;
    authorizationURL: string;
    tokenURL: string;
    userInfoURL: string;
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
  }
  
  export type VerifyCallback = (
    err: Error | null,
    user?: object,
    info?: object
  ) => void;
  
  export type VerifyFunction = (
    issuer: string,
    profile: Profile,
    done: (error: Error | null, user?: any) => void
  ) => void;
  
  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: VerifyFunction
    );
  }
}