import React from 'react';
import { useApp } from '@/context/AppContext';
import OfficerHome from '@/components/officer/OfficerHome';
import ApplicationQueue from '@/components/officer/ApplicationQueue';

export default function OfficerDashboard() {
  const { activeView } = useApp();

  switch (activeView) {
    case 'queue':
      return <ApplicationQueue />;
    case 'dashboard':
    default:
      return <OfficerHome />;
  }
}
