'use client';
import { useEffect, useState } from 'react';
import { fetchGitHubJson } from '../../services/githubService';
import SEO from '../components/SEO';

export default function Debug() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGitHubJson('Profile/user.json').then(setData).catch(setError);
  }, []);

  return (
    <>
    <SEO title="Debug" description="FocusLinks debug information page." keywords="debug, diagnostics" />
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </>
  );
}
