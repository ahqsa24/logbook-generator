/**
 * Main Step1Authentication module entry point
 * Consolidates all exports from sub-folders
 */

// Main component (default export)
export { default } from '../Step1Authentication';

// Types
export type { Step1AuthenticationProps, AuthMethod, ValidationResult } from './types';

// Utilities
export * from './utils';

// Hooks
export * from './hooks';

// Components
export * from './components';
