// Owns profile PATCH operations and keeps server-confirmed account data in auth state.
import { useCallback } from 'react';
import { profileSchema } from '@typeflow/shared';
import { updateMyProfile } from '../../../api/users.js';

export function useProfile({ csrfToken, updateUser }) {
  const saveProfile = useCallback(async (profile) => {
    const parsed = profileSchema.safeParse(profile);
    if (!parsed.success) {
      const error = new Error('Invalid profile fields');
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    const response = await updateMyProfile(parsed.data, csrfToken);
    updateUser(response.user);
    return response.user;
  }, [csrfToken, updateUser]);

  return { saveProfile };
}
