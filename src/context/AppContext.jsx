import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { translations } from '@/i18n/translations';

const API_BASE = '/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en'); // 'en' | 'mr'
  const [role, setRole] = useState('entrepreneur'); // 'entrepreneur' | 'officer'
  const [activeView, setActiveView] = useState('dashboard');
  const [applications, setApplications] = useState([]);
  const [activeApplicationId, setActiveApplicationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const t = translations[lang] || translations.en;

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'mr' : 'en'));
  }, []);

  const switchRole = useCallback((nextRole) => {
    setRole(nextRole);
    setActiveView('dashboard');
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/applications`);
      if (!res.ok) {
        throw new Error(`Failed to fetch applications: ${res.statusText}`);
      }
      const data = await res.json();
      setApplications(data);
      if (data.length > 0) {
        setActiveApplicationId((prev) => prev || data[0].id);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch applications from the backend on mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const addApplication = useCallback(async (applicationData) => {
    try {
      const isFormData = applicationData instanceof FormData;
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? applicationData : JSON.stringify(applicationData),
      });

      if (!res.ok) {
        let errMessage = `Failed to create application (${res.status})`;
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const created = await res.json();
      setApplications((prev) => [created, ...prev]);
      setActiveApplicationId(created.id);
      return created;
    } catch (err) {
      console.error('Error adding application:', err);
      throw err;
    }
  }, []);

  const updateDepartmentStatus = useCallback(async (appId, departmentKey, status) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}/department`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: departmentKey, status }),
      });

      if (!res.ok) {
        let errMessage = `Failed to update department status (${res.status})`;
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const updated = await res.json();
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? updated : app))
      );
      return updated;
    } catch (err) {
      console.error('Error updating department status:', err);
      throw err;
    }
  }, []);

  const updateApplicationDecision = useCallback(async (appId, { decision, remark }) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, remark }),
      });

      if (!res.ok) {
        let errMessage = `Failed to update decision (${res.status})`;
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const updated = await res.json();
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? updated : app))
      );
      return updated;
    } catch (err) {
      console.error('Error updating decision:', err);
      throw err;
    }
  }, []);

  const uploadDocument = useCallback(async (appId, file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      const res = await fetch(`${API_BASE}/applications/${appId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errMessage = `Failed to upload document (${res.status})`;
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const updated = await res.json();
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? updated : app))
      );
      return updated;
    } catch (err) {
      console.error('Error uploading document:', err);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      t,
      toggleLang,
      role,
      switchRole,
      activeView,
      setActiveView,
      applications,
      addApplication,
      updateDepartmentStatus,
      updateApplicationDecision,
      uploadDocument,
      activeApplicationId,
      setActiveApplicationId,
      loading,
      error,
      fetchApplications,
    }),
    [
      lang,
      t,
      toggleLang,
      role,
      switchRole,
      activeView,
      applications,
      addApplication,
      updateDepartmentStatus,
      updateApplicationDecision,
      uploadDocument,
      activeApplicationId,
      loading,
      error,
      fetchApplications,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
