/**
 * Environment Configuration
 * Centralized environment variable management with type safety and validation
 */

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  api: {
    baseUrl: string;
    timeout: number;
    version: string;
  };
  auth?: {
    domain: string;
    clientId: string;
    redirectUri: string;
  };
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  analytics?: {
    googleAnalyticsId: string;
    mixpanelToken: string;
  };
  features: {
    newUI: boolean;
    betaAccess: boolean;
    debugMode: boolean;
  };
  assets?: {
    cdnUrl: string;
    assetsUrl: string;
  };
  social?: {
    facebookAppId: string;
    githubClientId: string;
    linkedinClientId: string;
  };
  monitoring?: {
    sentryDsn: string;
    hotjarId: string;
  };
  development: {
    mockApi: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

/**
 * Get environment variable with optional fallback
 */
const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || fallback || '';
};

/**
 * Parse boolean environment variable
 */
const parseBoolean = (value: string | undefined, fallback = false): boolean => {
  if (!value) return fallback;
  return value.toLowerCase() === 'true';
};

/**
 * Parse number environment variable
 */
const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Application configuration object
 */
export const config: AppConfig = {
  app: {
    name: getEnvVar('REACT_APP_APP_NAME', 'React App'),
    version: getEnvVar('REACT_APP_VERSION', '1.0.0'),
    environment: getEnvVar('REACT_APP_ENVIRONMENT', 'development') as AppConfig['app']['environment'],
  },
  api: {
    baseUrl: getEnvVar('REACT_APP_API_BASE_URL'),
    timeout: parseNumber(process.env.REACT_APP_API_TIMEOUT, 10000),
    version: getEnvVar('REACT_APP_API_VERSION', 'v1'),
  },
  auth: process.env.REACT_APP_AUTH_DOMAIN ? {
    domain: getEnvVar('REACT_APP_AUTH_DOMAIN'),
    clientId: getEnvVar('REACT_APP_CLIENT_ID'),
    redirectUri: getEnvVar('REACT_APP_REDIRECT_URI'),
  } : undefined,
  firebase: process.env.REACT_APP_FIREBASE_API_KEY ? {
    apiKey: getEnvVar('REACT_APP_FIREBASE_API_KEY'),
    authDomain: getEnvVar('REACT_APP_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('REACT_APP_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('REACT_APP_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('REACT_APP_FIREBASE_APP_ID'),
  } : undefined,
  analytics: (process.env.REACT_APP_GOOGLE_ANALYTICS_ID || process.env.REACT_APP_MIXPANEL_TOKEN) ? {
    googleAnalyticsId: getEnvVar('REACT_APP_GOOGLE_ANALYTICS_ID', ''),
    mixpanelToken: getEnvVar('REACT_APP_MIXPANEL_TOKEN', ''),
  } : undefined,
  features: {
    newUI: parseBoolean(process.env.REACT_APP_FEATURE_NEW_UI),
    betaAccess: parseBoolean(process.env.REACT_APP_FEATURE_BETA_ACCESS),
    debugMode: parseBoolean(process.env.REACT_APP_FEATURE_DEBUG_MODE),
  },
  assets: (process.env.REACT_APP_CDN_URL || process.env.REACT_APP_ASSETS_URL) ? {
    cdnUrl: getEnvVar('REACT_APP_CDN_URL', ''),
    assetsUrl: getEnvVar('REACT_APP_ASSETS_URL', ''),
  } : undefined,
  social: (process.env.REACT_APP_FACEBOOK_APP_ID || process.env.REACT_APP_GITHUB_CLIENT_ID || process.env.REACT_APP_LINKEDIN_CLIENT_ID) ? {
    facebookAppId: getEnvVar('REACT_APP_FACEBOOK_APP_ID', ''),
    githubClientId: getEnvVar('REACT_APP_GITHUB_CLIENT_ID', ''),
    linkedinClientId: getEnvVar('REACT_APP_LINKEDIN_CLIENT_ID', ''),
  } : undefined,
  monitoring: (process.env.REACT_APP_SENTRY_DSN || process.env.REACT_APP_HOTJAR_ID) ? {
    sentryDsn: getEnvVar('REACT_APP_SENTRY_DSN', ''),
    hotjarId: getEnvVar('REACT_APP_HOTJAR_ID', ''),
  } : undefined,
  development: {
    mockApi: parseBoolean(process.env.REACT_APP_MOCK_API),
    logLevel: (process.env.REACT_APP_LOG_LEVEL as AppConfig['development']['logLevel']) || 'info',
  },
};

/**
 * Utility functions for environment checks
 */
export const isDevelopment = () => config.app.environment === 'development';
export const isStaging = () => config.app.environment === 'staging';
export const isProduction = () => config.app.environment === 'production';

/**
 * Validate required environment variables on app startup
 */
export const validateConfig = (): void => {
  const requiredVars = [
    'REACT_APP_API_BASE_URL',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

export default config;