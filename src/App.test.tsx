import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// this will be osme tests

// we don't have a react link anymore. TODO: check for something else.
// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

test('just log to console', () => {
  console.log("just log to console from App.test")
});


