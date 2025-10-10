import React from 'react';
import Login from './auth/login/Login';
import './App.css';

export default function App(): JSX.Element {
  // Render the Login screen by default. Further routing will be added later.
  return <Login />;
}
