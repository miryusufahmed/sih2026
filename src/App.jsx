import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EntrepreneurDashboard from '@/pages/EntrepreneurDashboard';
import OfficerDashboard from '@/pages/OfficerDashboard';

function AppShell() {
  const { role } = useApp();
  return (
    <DashboardLayout>
      {role === 'entrepreneur' ? <EntrepreneurDashboard /> : <OfficerDashboard />}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
