'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchGitHubJson, updateGitHubFile, deleteGitHubFile } from '../services/githubService';

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
  location?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  details?: string;
}

export interface ProfileEvent {
  title: string;
  date: string;
  role: string;
}

export interface Profile {
  type: 'professional' | 'student' | 'association' | 'membership_application';
  name: string;
  title: string;
  location: string;
  description: string;
  image: string;
  email?: string;
  whatsapp?: string;
  linkedin?: string;
  role?: string;
  country?: string;
  id?: string;
  isFounder?: boolean;
  verifiedRole?: string;
  bio?: string;
  links?: {
    linkedin?: string;
    email?: string;
  };
  languages?: string[];
  verified: boolean;
  flCredits?: number;
  joinedDate?: string;
  badges?: string[];
  skills?: string[];
  interests?: string[];
  events?: ProfileEvent[];
  experience?: Experience[];
  education?: Education[];
  profileToken?: string; // Encrypted membershipId
  membershipId?: string; // Original membershipId (used for tracking)
  status?: 'review' | 'accepted' | 'rejected';
  submittedAt?: string;
  migratedAt?: string;
  archivedAt?: string;
  timestamp?: string;
  _isMigrated?: boolean;
  inDirectory?: boolean;
}

export const generateSlug = (name: string) => {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export function useProfiles() {
  const [adminProfiles, setAdminProfiles] = useState<Profile[]>([]);
  const [submissions, setSubmissions] = useState<Profile[]>([]);
  const [archivedProfiles, setArchivedProfiles] = useState<Profile[]>([]);
  const [listProfiles, setListProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorList, setErrorList] = useState<string | null>(null);

  const fetchListProfiles = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await fetchGitHubJson<Profile[]>('list_profiles.json');
      if (Array.isArray(data)) {
        const decryptedData = data.map(profile => {
          return { ...profile, membershipId: profile.membershipId };
        });
        setListProfiles(decryptedData);
      } else {
        setListProfiles([]);
      }
      setErrorList(null);
    } catch (err) {
      console.error('Failed to fetch list_profiles.json:', err);
      setErrorList('Failed to fetch profiles');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const updateListProfilesWithEncryptedIds = async () => {
    try {
      // 1. Fetch all individual user files
      const dirResponse = await fetch('/api/github/fetch?path=Profile/Users');
      if (!dirResponse.ok) throw new Error('Failed to fetch directory');
      
      const contentType = dirResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Check if API routes are working.');
      }
      
      const dirData = await dirResponse.json();
      
      const idMap = new Map<string, string>();
      if (Array.isArray(dirData)) {
        for (const file of dirData) {
          if (file.name && file.name.endsWith('_userdata.json')) {
            const userData = await fetchGitHubJson<Profile>(`Profile/Users/${file.name}`);
            if (userData && userData.membershipId) {
              idMap.set(userData.membershipId, userData.membershipId);
            }
          }
        }
      }

      // 2. Fetch list_profiles.json
      const currentListProfiles = await fetchGitHubJson<Profile[]>('list_profiles.json') || [];

      // 3. Update list_profiles.json with encrypted IDs
      const updatedProfiles = currentListProfiles.map(p => ({
        ...p,
        profileToken: idMap.get(p.membershipId || '') || p.profileToken
      }));

      // 4. Save back to GitHub
      return await updateGitHubFile('list_profiles.json', updatedProfiles, 'Update list_profiles.json with encrypted IDs');
    } catch (err: any) {
      console.error('Error updating list_profiles.json with encrypted IDs:', err);
      return false;
    }
  };

  const updateListProfiles = async (newProfiles: Profile[]) => {
    try {
      const success = await updateGitHubFile('list_profiles.json', newProfiles, 'Update list_profiles.json');
      if (success) {
        setListProfiles(newProfiles);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update list_profiles.json:', err);
      return false;
    }
  };

  const fetchAdminProfiles = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all individual user files directly from the directory
      const response = await fetch('/api/github/fetch?path=Profile/Users');
      if (!response.ok) throw new Error('Failed to fetch directory');
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Check if API routes are working.');
      }
      
      const dirData = await response.json();
      const individualProfiles: Profile[] = [];
      
      if (Array.isArray(dirData)) {
        for (const item of dirData) {
          if (item && item.name && item.name.endsWith('_userdata.json') && item.content) {
            const fileName = item.name;
            const userData = item.content as Profile;
            
            // Extract membershipId from filename: [membershipId]_userdata.json
            const membershipId = fileName.replace('_userdata.json', '');
            
            individualProfiles.push({ 
              ...userData, 
              _isMigrated: true,
              membershipId: membershipId,
              profileToken: membershipId
            });
          }
        }
      }

      setAdminProfiles(individualProfiles);
    } catch (err) {
      console.error('Failed to fetch admin profiles:', err);
      setError('Failed to fetch admin profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    // This is now a wrapper to refresh the relevant data
    await fetchAdminProfiles();
    await fetchListProfiles();
  }, [fetchAdminProfiles, fetchListProfiles]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const data = await fetchGitHubJson<any>('Profile/Submissions_Profile.json');
      setSubmissions(Array.isArray(data) ? data : (data?.submissions || []));
    } catch (err) {
      console.error('Failed to fetch submissions');
    }
  }, []);

  const fetchArchived = useCallback(async () => {
    try {
      const data = await fetchGitHubJson<any>('Profile/Archive/archive.json');
      setArchivedProfiles(Array.isArray(data) ? data : (data?.users || []));
    } catch (err) {
      console.error('Failed to fetch archived profiles');
    }
  }, []);

  const submitProfile = async (profile: Profile) => {
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile_submission',
          membershipId: profile.membershipId,
          ...profile,
          status: 'review',
          submittedAt: new Date().toISOString(),
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit profile');
      }

      return true;
    } catch (err) {
      console.error('Submission failed:', err);
      return false;
    }
  };

  const generateMembershipId = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `FL${result}`;
  };

  const approveProfile = async (submission: Profile) => {
    try {
      const mId = submission.membershipId || generateMembershipId();
      
      const approvedProfile = {
        ...submission,
        membershipId: mId,
        status: 'accepted',
        verified: true,
        profileToken: mId,
      };

      // 1. Save to individual file in Profile/Users/
      const filePath = `Profile/Users/${mId}_userdata.json`;
      await updateGitHubFile(filePath, approvedProfile, `Approve and create individual profile for ${submission.name}`);

      // 2. Update list_profiles.json
      await syncAllMembership();

      // 3. Remove from submissions
      const currentSubmissions = await fetchGitHubJson<any>('Profile/Submissions_Profile.json') || [];
      const submissionsArray = Array.isArray(currentSubmissions) ? currentSubmissions : (currentSubmissions.submissions || []);
      
      const updatedSubmissions = submissionsArray.filter((s: any) => 
        s.membershipId !== submission.membershipId && s.email !== submission.email
      );
      await updateGitHubFile('Profile/Submissions_Profile.json', updatedSubmissions, `Remove approved submission: ${submission.name}`);

      setSubmissions(updatedSubmissions);
      return true;
    } catch (err) {
      console.error('Approval failed:', err);
      return false;
    }
  };

  const rejectProfile = async (membershipId: string) => {
    try {
      const currentSubmissions = await fetchGitHubJson<any>('Profile/Submissions_Profile.json') || [];
      const submissionsArray = Array.isArray(currentSubmissions) ? currentSubmissions : (currentSubmissions.submissions || []);
      
      const updatedSubmissions = submissionsArray.map((s: any) => 
        s.membershipId === membershipId ? { ...s, status: 'rejected' } : s
      );
      
      const success = await updateGitHubFile('Profile/Submissions_Profile.json', updatedSubmissions, `Reject submission: ${membershipId}`);
      if (success) {
        setSubmissions(updatedSubmissions);
      }
      return success;
    } catch (err) {
      console.error('Rejection failed:', err);
      return false;
    }
  };

  const saveAdminProfile = async (profile: Profile, isNew: boolean) => {
    try {
      // Remove internal flag before saving
      const { _isMigrated, ...tempProfile } = profile;
      let profileToSave = { ...tempProfile };

      if (isNew && !profileToSave.membershipId) {
        profileToSave.membershipId = generateMembershipId();
        profileToSave.profileToken = profileToSave.membershipId;
      }

      // Save to individual file in Profile/Users/
      const membershipId = profileToSave.membershipId || '';
      const filePath = `Profile/Users/${membershipId}_userdata.json`;
      
      // Ensure profileToken is saved in the file
      const profileToSaveWithToken = { ...profileToSave, profileToken: membershipId };
      
      const success = await updateGitHubFile(filePath, profileToSaveWithToken, `Admin update profile ${profile.name}`);
      if (success) {
        // Update list_profiles.json
        await syncAllMembership();
        
        await fetchAdminProfiles();
        await fetchListProfiles();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving admin profile:', err);
      return false;
    }
  };

  const updateAdminCredits = async (profile: Profile, newCredits: number) => {
    try {
      const membershipId = profile.membershipId;
      if (!membershipId) {
        throw new Error('No membership ID found for this user');
      }

      const filePath = `Profile/Users/${membershipId}_userdata.json`;
      
      // Fetch current data to ensure we have the latest
      const currentData = await fetchGitHubJson<any>(filePath);
      if (!currentData) {
        throw new Error(`File not found: ${filePath}`);
      }

      const updatedData = { ...currentData, flCredits: newCredits };
      
      const success = await updateGitHubFile(filePath, updatedData, `Update credits for ${profile.name} to ${newCredits}`);
      
      if (success) {
        // Update local state
        setAdminProfiles(prev => prev.map(p => 
          (p.membershipId === membershipId) ? { ...p, flCredits: newCredits } : p
        ));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating admin credits:', err);
      return false;
    }
  };

  const deleteAdminProfile = async (profile: Profile) => {
    try {
      // 0. Archive the profile before deleting
      const archivePath = 'Profile/Archive/archive.json';
      const currentArchive = await fetchGitHubJson<any>(archivePath) || [];
      const isArchiveObject = !Array.isArray(currentArchive) && currentArchive.users;
      const archiveArray = isArchiveObject ? currentArchive.users : (Array.isArray(currentArchive) ? currentArchive : []);
      
      const archivedProfile = {
        ...profile,
        archivedAt: new Date().toISOString(),
        status: 'archived'
      };
      
      const updatedArchive = [...archiveArray, archivedProfile];
      const archiveToSave = isArchiveObject ? { ...currentArchive, users: updatedArchive } : updatedArchive;
      await updateGitHubFile(archivePath, archiveToSave, `Archive profile ${profile.name}`);

      // 1. Delete individual file from Profile/Users/
      if (profile.membershipId) {
        const filePath = `Profile/Users/${profile.membershipId}_userdata.json`;
        await deleteGitHubFile(filePath, `Admin delete profile ${profile.name} individual file`);
      }

      // 2. Sync list_profiles.json
      await syncAllMembership();

      // Refresh everything including archived list
      await fetchAdminProfiles();
      await fetchListProfiles();
      await fetchArchived();
      
      return true;
    } catch (err) {
      console.error('Error deleting admin profile:', err);
      return false;
    }
  };

  const updateUserProfile = async (membershipId: string, name: string, updates: Partial<Profile>) => {
    try {
      const filePath = `Profile/Users/${membershipId}_userdata.json`;
      const individualUser = await fetchGitHubJson<any>(filePath);
      
      if (individualUser) {
        const updatedIndividual = { ...individualUser, ...updates };
        const success = await updateGitHubFile(filePath, updatedIndividual, `Update profile for ${membershipId}`);
        if (success) {
          // Sync list_profiles.json
          await syncAllMembership();

          // Refresh profiles to get the latest data
          await fetchAdminProfiles();
          await fetchListProfiles();
          return true;
        }
      }

      return false;
    } catch (err) {
      console.error('Error updating user profile:', err);
      return false;
    }
  };

  const syncAllMembership = async () => {
    try {
      // Fetch all individual user files directly from the directory
      const response = await fetch('/api/github/fetch?path=Profile/Users');
      if (!response.ok) throw new Error('Failed to fetch directory');
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Check if API routes are working.');
      }
      
      const dirData = await response.json();
      const individualProfiles: Profile[] = [];
      
      if (Array.isArray(dirData)) {
        for (const item of dirData) {
          if (item && item.name && item.name.endsWith('_userdata.json') && item.content) {
            const userData = item.content as Profile;
            individualProfiles.push(userData);
          }
        }
      }

      // Sync list_profiles.json (public directory)
      const listProfilesData = individualProfiles
        .filter(p => p.status === 'accepted' || p.verified)
        .map(p => ({
          ...p,
          membershipId: p.membershipId,
          profileToken: p.membershipId || ''
        }));
      
      await updateGitHubFile('list_profiles.json', listProfilesData, `Sync list_profiles.json`);
      setListProfiles(listProfilesData);

      return true;
    } catch (err) {
      console.error('Error in syncAllMembership:', err);
      return false;
    }
  };

  useEffect(() => {
    // We no longer auto-fetch everything to prevent extra loading.
    // Components should call the fetch functions they need.
  }, []);

  return { 
    adminProfiles,
    submissions, 
    archivedProfiles,
    listProfiles,
    loading, 
    loadingList,
    error, 
    errorList,
    submitProfile, 
    approveProfile, 
    rejectProfile,
    saveAdminProfile,
    deleteAdminProfile,
    updateUserProfile,
    updateAdminCredits,
    syncAllMembership,
    generateMembershipId,
    updateListProfiles,
    fetchAdminProfiles,
    fetchArchived,
    fetchSubmissions,
    fetchListProfiles,
    refresh: async () => {
      await fetchAdminProfiles();
      await fetchArchived();
    }
  };
}
