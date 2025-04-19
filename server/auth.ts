import passport from 'passport';
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import session from 'express-session';
import PgSession from 'connect-pg-simple';
import express, { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { User, InsertUser } from '@shared/schema';
import { pool } from './db';

// Configure session storage with PostgreSQL
const PostgresStore = PgSession(session);
const sessionStore = new PostgresStore({
  pool: pool,
  tableName: 'session',
  createTableIfMissing: true,
});

export const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'demo-codex-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
});

export const setupAuth = (app: express.Express) => {
  // Initialize passport and session
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Okta strategy when credentials are available
  if (process.env.OKTA_ISSUER && process.env.OKTA_CLIENT_ID && process.env.OKTA_CLIENT_SECRET) {
    passport.use('okta', new OpenIDConnectStrategy({
      issuer: process.env.OKTA_ISSUER,
      authorizationURL: `${process.env.OKTA_ISSUER}/v1/authorize`,
      tokenURL: `${process.env.OKTA_ISSUER}/v1/token`,
      userInfoURL: `${process.env.OKTA_ISSUER}/v1/userinfo`,
      clientID: process.env.OKTA_CLIENT_ID,
      clientSecret: process.env.OKTA_CLIENT_SECRET,
      callbackURL: '/auth/okta/callback',
      scope: ['openid', 'profile', 'email']
    }, async (issuer, profile, done) => {
      try {
        // Look for existing user by Okta ID
        let user = await storage.getUserByOktaId(profile.id);
        
        // If user doesn't exist, create a new user
        if (!user) {
          const newUser: InsertUser = {
            oktaId: profile.id,
            email: profile.emails?.[0]?.value || 'unknown@example.com',
            name: profile.displayName || 'Unknown User',
            avatar: profile.photos?.[0]?.value || null,
          };
          
          user = await storage.createUser(newUser);
        } else {
          // Update last login time
          await storage.updateUser(user.id, { lastLogin: new Date() });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }));

    // Serialize and deserialize user
    passport.serializeUser((user: Express.User, done) => {
      done(null, (user as User).id);
    });

    passport.deserializeUser(async (id: number, done) => {
      try {
        const user = await storage.getUser(id);
        done(null, user);
      } catch (error) {
        done(error);
      }
    });

    // Auth routes
    app.get('/login', passport.authenticate('okta'));
    
    app.get('/auth/okta/callback', 
      passport.authenticate('okta', { failureRedirect: '/login' }),
      (req, res) => {
        res.redirect('/');
      }
    );
    
    app.get('/logout', (req, res) => {
      req.logout(() => {
        res.redirect('/');
      });
    });
  } else {
    console.warn('Okta configuration missing. SSO login is disabled.');
  }
  
  // Middleware to check if user is authenticated
  app.get('/api/me', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
};

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};