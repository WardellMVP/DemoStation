import passport from 'passport';
import { Strategy as OIDCStrategy, StrategyOptions } from 'passport-openidconnect';
import { pool } from './db';
import { storage } from './storage';

// Configure and use the Okta OpenID Connect Strategy
export function setupOktaAuth(app: any) {
  const oktaIssuer = process.env.OKTA_ISSUER!;
  
  passport.use('okta', new OIDCStrategy(
    {
      issuer: oktaIssuer,
      authorizationURL: `${oktaIssuer}/v1/authorize`,
      tokenURL: `${oktaIssuer}/v1/token`,
      userInfoURL: `${oktaIssuer}/v1/userinfo`,
      clientID: process.env.OKTA_CLIENT_ID!,
      clientSecret: process.env.OKTA_CLIENT_SECRET!,
      callbackURL: '/api/auth/okta/callback',
      scope: ['openid', 'profile', 'email']
    } as StrategyOptions,
    async (_issuer: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        
        if (!email || !name) {
          return done(new Error('Invalid profile information'));
        }
        
        // Check if user exists by email
        let user = await storage.getUserByEmail(email);
        
        if (!user) {
          // If user doesn't exist, create a new user with Okta profile
          const avatar = generateAvatar(name);
          
          user = await storage.createUser({
            email,
            name,
            avatar,
            lastLogin: new Date()
          });
        } else {
          // Update last login time
          await storage.updateUser(user.id, { lastLogin: new Date() });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Setup Okta authentication routes
  app.get('/api/auth/okta', passport.authenticate('okta'));

  app.get('/api/auth/okta/callback',
    passport.authenticate('okta', { 
      failureRedirect: '/auth',
      successRedirect: '/'
    })
  );
}

// Generate a profile avatar from user's name (same logic as in auth.ts)
function generateAvatar(name: string): string {
  // Create SVG avatar with user's first name initial in a blue circle
  const initial = name.charAt(0).toUpperCase();
  const avatarSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="#0e3250" />
      <circle cx="20" cy="20" r="18" fill="#0d4a8a" />
      <text x="20" y="25" font-family="Arial" font-size="16" fill="#e0f0ff" text-anchor="middle">${initial}</text>
    </svg>
  `;
  
  // Convert to a data URL
  const avatarBase64 = Buffer.from(avatarSvg).toString('base64');
  return `data:image/svg+xml;base64,${avatarBase64}`;
}