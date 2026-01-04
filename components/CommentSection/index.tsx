/**
 * Main CommentSection module entry point
 * Consolidates all exports from sub-folders
 */

// Main component (default export)
export { default } from '../CommentSection';

// Types
export type { Comment, Reply, SortOption, DeleteTarget } from './types';

// Utilities
export * from './utils';

// Hooks
export * from './hooks';

// Components
export * from './components';
