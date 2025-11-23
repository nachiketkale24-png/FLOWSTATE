// src/components/DebugButton.jsx - Floating Debug Button

import React from 'react';
import { Link } from 'react-router-dom';
import { Bug } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Floating debug button - only shows if logging enabled
 */
export default function DebugButton() {
  // Only show in dev or if logging enabled
  if (!APP_CONFIG.LOG_ERRORS && !import.meta.env.DEV) {
    return null;
  }

  return (
    <Link
      to="/debug"
      className="fixed bottom-4 right-4 z-50 p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-all hover:scale-110"
      title="Debug Dashboard"
    >
      <Bug className="w-5 h-5" />
    </Link>
  );
}
