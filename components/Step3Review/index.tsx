/**
 * Main Step3Review module entry point
 * Consolidates all exports from sub-folders for cleaner imports
 */

// Main component (default export)
export { default } from '../Step3Review';

// Types
export type { Step3ReviewProps, LogbookEntry, Lecturer } from './types';

// Utilities - re-export from utils/index
export * from './utils';

// Hooks - re-export from hooks/index
export * from './hooks';

// Components - re-export from components/index
export * from './components';
