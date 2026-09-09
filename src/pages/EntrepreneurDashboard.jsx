import React from 'react';
import { useApp } from '@/context/AppContext';
import EntrepreneurHome from '@/components/entrepreneur/EntrepreneurHome';
import ApplicationForm from '@/components/entrepreneur/ApplicationForm';
import ApprovalTracker from '@/components/entrepreneur/ApprovalTracker';
import SubsidyMatcher from '@/components/entrepreneur/SubsidyMatcher';

export default function EntrepreneurDashboard() {
  const { activeView } = useApp();

  switch (activeView) {
    case 'application':
      return <ApplicationForm />;
    case 'tracker':
      return <ApprovalTracker />;
    case 'subsidy':
      return <SubsidyMatcher />;
    case 'dashboard':
    default:
      return <EntrepreneurHome />;
  }
}
