/**
 * Environment Variables Type Definitions
 * This file provides TypeScript types for all environment variables
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // App Configuration
    readonly REACT_APP_APP_NAME: string;
    readonly REACT_APP_VERSION: string;
    readonly REACT_APP_ENVIRONMENT: 'development' | 'staging' | 'production';

    // API Configuration
    readonly REACT_APP_API_BASE_URL: string;
    readonly REACT_APP_API_TIMEOUT: string;
    readonly REACT_APP_API_VERSION: string;

    // Authentication
    readonly REACT_APP_AUTH_DOMAIN?: string;
    readonly REACT_APP_CLIENT_ID?: string;
    readonly REACT_APP_REDIRECT_URI?: string;

    // External Services
    readonly REACT_APP_GOOGLE_MAPS_API_KEY?: string;
    readonly REACT_APP_FIREBASE_API_KEY?: string;
    readonly REACT_APP_FIREBASE_AUTH_DOMAIN?: string;
    readonly REACT_APP_FIREBASE_PROJECT_ID?: string;
    readonly REACT_APP_FIREBASE_STORAGE_BUCKET?: string;
    readonly REACT_APP_FIREBASE_MESSAGING_SENDER_ID?: string;
    readonly REACT_APP_FIREBASE_APP_ID?: string;

    // Analytics
    readonly REACT_APP_GOOGLE_ANALYTICS_ID?: string;
    readonly REACT_APP_MIXPANEL_TOKEN?: string;

    // Feature Flags
    readonly REACT_APP_FEATURE_NEW_UI?: string;
    readonly REACT_APP_FEATURE_BETA_ACCESS?: string;
    readonly REACT_APP_FEATURE_DEBUG_MODE?: string;

    // CDN & Assets
    readonly REACT_APP_CDN_URL?: string;
    readonly REACT_APP_ASSETS_URL?: string;

    // Social Login
    readonly REACT_APP_FACEBOOK_APP_ID?: string;
    readonly REACT_APP_GITHUB_CLIENT_ID?: string;
    readonly REACT_APP_LINKEDIN_CLIENT_ID?: string;

    // Monitoring & Error Tracking
    readonly REACT_APP_SENTRY_DSN?: string;
    readonly REACT_APP_HOTJAR_ID?: string;

    // Development Tools
    readonly REACT_APP_MOCK_API?: string;
    readonly REACT_APP_LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';

    // Build Configuration
    readonly GENERATE_SOURCEMAP?: string;
    readonly INLINE_RUNTIME_CHUNK?: string;
    readonly FAST_REFRESH?: string;
  }
}