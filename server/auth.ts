import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import PgSession from 'connect-pg-simple';
import express, { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { User, InsertUser } from '@shared/schema';
import { pool } from './db';
import crypto from 'crypto';

// Extend SessionData to include our custom properties
declare module 'express-session' {
  interface SessionData {
    returnTo?: string;
  }
}

// Extend Express types to include user
declare global {
  namespace Express {
    // Custom interface for user in passport session
    interface User {
      id: number;
      email: string;
      name: string;
      password?: string;
      oktaId?: string;
      avatar: string | null;
      lastLogin?: Date;
      createdAt?: Date;
    }
  }
}

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

// Password hashing functions
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${hash}.${salt}`;
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  const [hash, salt] = hashedPassword.split('.');
  const calculatedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === calculatedHash;
}

// Default avatars based on user initials
function generateAvatar(name: string): string {
  // Create SVG avatar with user's first name initial in a green circle
  const initial = name.charAt(0).toUpperCase();
  const avatarSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="#0e3320" />
      <circle cx="20" cy="20" r="18" fill="#0d5a2c" />
      <text x="20" y="25" font-family="Arial" font-size="16" fill="#e0ffe0" text-anchor="middle">${initial}</text>
    </svg>
  `;
  
  // Convert to a data URL
  const avatarBase64 = Buffer.from(avatarSvg).toString('base64');
  return `data:image/svg+xml;base64,${avatarBase64}`;
}

export const setupAuth = (app: express.Express) => {
  // Initialize passport and session
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up local strategy for username/password authentication
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      // Check if user exists by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Incorrect email or password' });
      }
      
      // Verify password
      if (!user.password || !verifyPassword(password, user.password)) {
        return done(null, false, { message: 'Incorrect email or password' });
      }
      
      // Update last login time
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Serialize and deserialize user
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        // Convert any null values to undefined to match Express.User interface
        const adaptedUser = {
          ...user,
          password: undefined, // Remove password from session
          lastLogin: user.lastLogin || undefined,
          createdAt: user.createdAt || undefined
        };
        done(null, adaptedUser);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });

  // User registration endpoint
  app.post('/api/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      // Validate required fields
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
      
      // Create new user
      const hashedPassword = hashPassword(password);
      const avatar = generateAvatar(name);
      
      const user = await storage.createUser({
        email,
        name,
        password: hashedPassword,
        avatar,
        lastLogin: new Date()
      });
      
      // Mask password in the response
      const userResponse = { ...user, password: undefined };
      
      // Log user in automatically
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Authentication error' });
        }
        return res.status(201).json(userResponse);
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

  // Login route
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ error: info?.message || 'Authentication failed' });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Mask password in the response
        const userResponse = { ...user, password: undefined };
        return res.json(userResponse);
      });
    })(req, res, next);
  });
  
  // Login form route (for redirect)
  app.get('/login', (req, res) => {
    // Store the original URL if it was passed in the redirect_to query parameter
    if (req.query.redirect_to) {
      req.session.returnTo = req.query.redirect_to as string;
    }
    
    // For SPA, redirect to the client-side login page
    res.redirect('/#/login');
  });
  
  // Logout route
  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      
      res.json({ success: true });
    });
  });
  
  app.get('/logout', (req, res) => {
    const redirectUrl = req.query.redirect_to as string || '/';
    
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
      }
      
      res.redirect(redirectUrl);
    });
  });
  
  // Middleware to check if user is authenticated
  app.get('/api/me', (req, res) => {
    if (req.isAuthenticated()) {
      // Convert Date objects to ISO strings for consistent handling in the frontend
      const user = {
        ...req.user,
        password: undefined, // Make sure password is never sent to client
        lastLogin: req.user.lastLogin ? new Date(req.user.lastLogin).toISOString() : null,
        createdAt: req.user.createdAt ? new Date(req.user.createdAt).toISOString() : null,
      };
      res.json(user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
  
  // Endpoint to check authentication status
  app.get('/api/auth/status', (req, res) => {
    res.json({ 
      configured: true,
      provider: 'local',
      message: 'Authentication configured'
    });
  });
};

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};