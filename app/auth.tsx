import { useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackScreen() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const onboardingComplete = data.session.user.user_metadata?.onboarding_complete;
        if (onboardingComplete) {
          router.replace('/(parent)');
        } else {
          router.replace('/(onboarding)/parent/family-setup');
        }
      } else {
        router.replace('/(onboarding)');
      }
    });
  }, []);

  return null;
}
