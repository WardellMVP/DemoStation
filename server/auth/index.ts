import { Express, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { OIDCStrategy } from 'passport-azure-ad';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import OktaJwtVerifier from '@okta/jwt-verifier';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { User } from '@shared/schema';
import { storage } from '../storage';
import { pool } from '../db';

// Define user object in req.user
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name?: string | null;
      provider: string;
      providerId: string;
    }
  }
}

// Initialize session storage with PostgreSQL
const PgSessionStore = pgSession(session);

export function setupAuth(app: Express) {
  // Set up express-session
  app.use(
    session({
      store: new PgSessionStore({
        pool,
        tableName: 'session', // Table name for sessions
        createTableIfMissing: true
      }),
      secret: process.env.SESSION_SECRET || 'developmentSessionSecret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Azure AD OIDC strategy setup
  if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET) {
    passport.use(
      'azure',
      new OIDCStrategy(
        {
          identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
          clientID: process.env.AZURE_CLIENT_ID,
          clientSecret: process.env.AZURE_CLIENT_SECRET,
          responseType: 'code',
          responseMode: 'form_post',
          redirectUrl: process.env.AZURE_REDIRECT_URI || 'http://localhost:5000/auth/azure/callback',
          passReqToCallback: false,
          scope: ['profile', 'email', 'openid'],
        },
        async (profile: any, done: any) => {
          try {
            // Get or create user in database
            let user = await storage.getUserByEmail(profile.upn || profile.email);
            
            if (!user) {
              const newUser = {
                email: profile.upn || profile.email,
                name: profile.displayName,
                provider: 'azure',
                providerId: profile.oid
              };
              user = await storage.createUser(newUser);
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Okta OAuth2 strategy
  if (process.env.OKTA_CLIENT_ID && process.env.OKTA_CLIENT_SECRET) {
    const oktaJwtVerifier = new OktaJwtVerifier({
      issuer: process.env.OKTA_ISSUER || ''
    });

    passport.use(
      'okta',
      new OAuth2Strategy(
        {
          authorizationURL: `${process.env.OKTA_ISSUER}/v1/authorize`,
          tokenURL: `${process.env.OKTA_ISSUER}/v1/token`,
          clientID: process.env.OKTA_CLIENT_ID,
          clientSecret: process.env.OKTA_CLIENT_SECRET,
          callbackURL: process.env.OKTA_REDIRECT_URI || 'http://localhost:5000/auth/okta/callback',
          scope: ['openid', 'email', 'profile']
        },
        async (accessToken: string, refreshToken: string, params: any, profile: any, done: any) => {
          try {
            // Verify the token and extract user info
            const jwt = params.id_token;
            const { claims } = await oktaJwtVerifier.verifyAccessToken(accessToken, 'api://default');
            
            const email = claims.sub;
            const name = claims.name || null;
            
            // Get or create user in database
            let user = await storage.getUserByEmail(email);
            
            if (!user) {
              const newUser = {
                email,
                name,
                provider: 'okta',
                providerId: claims.sub
              };
              user = await storage.createUser(newUser);
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Serialize and deserialize user
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.get('/login', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    res.redirect('/auth/login');
  });

  app.get('/auth/login', (req: Request, res: Response) => {
    // This is where we'll render a login page with provider options
    res.json({
      message: 'Please select a login provider',
      providers: [
        process.env.AZURE_CLIENT_ID ? { name: 'Microsoft Entra ID', url: '/auth/azure' } : null,
        process.env.OKTA_CLIENT_ID ? { name: 'Okta', url: '/auth/okta' } : null
      ].filter(Boolean)
    });
  });

  app.get('/auth/azure', passport.authenticate('azure'));
  app.post('/auth/azure/callback', passport.authenticate('azure', {
    successRedirect: '/',
    failureRedirect: '/auth/login'
  }));

  app.get('/auth/okta', passport.authenticate('okta'));
  app.get('/auth/okta/callback', passport.authenticate('okta', {
    successRedirect: '/',
    failureRedirect: '/auth/login'
  }));

  app.get('/logout', (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });

  // Authentication middleware for protected routes
  app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
    // Skip authentication for certain public API routes
    const publicApiRoutes = [
      '/api/health', 
      '/api/version', 
      '/api/auth/user', 
      '/api/websocket-status'
    ];
    
    if (publicApiRoutes.some(route => req.path.startsWith(route))) {
      return next();
    }
    
    // Allow all API access in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Bypassing authentication in development mode');
      return next();
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  });

  // Auth status endpoint
  app.get('/api/auth/user', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(200).json({ authenticated: false });
    }
    res.json({
      authenticated: true,
      user: {
        id: req.user?.id,
        email: req.user?.email,
        name: req.user?.name,
        provider: req.user?.provider
      }
    });
  });
}