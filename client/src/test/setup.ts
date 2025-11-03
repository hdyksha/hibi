import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure React Testing Library
configure({
  // Automatically wrap async utilities in act()
  asyncUtilTimeout: 5000,
});