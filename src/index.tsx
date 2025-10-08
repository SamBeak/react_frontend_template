import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import WrapComponent from './components/WrapComponent';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
	<WrapComponent />
);