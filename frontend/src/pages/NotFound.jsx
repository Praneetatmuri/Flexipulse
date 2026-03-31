import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="neo-card text-center fade-up">
          <p className="eyebrow">404</p>
          <h1 className="page-title">Oops, you lifted too heavy and broke the URL.</h1>
          <p className="page-subtitle mt-2">
            This page does not exist. Let&apos;s get you back to training mode.
          </p>
          <div className="mt-8">
            <Link to="/" className="primary-cta inline-flex items-center justify-center px-8">
              Back To Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
