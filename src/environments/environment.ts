import { EnvironmentConfig } from '../app/models/environment-config';

/**
 * Settings for the production build (ng build).
 * The publishable key is public by design, access is protected by RLS.
 */
export const environment: EnvironmentConfig = {
  supabaseUrl: 'https://xmxumyhafdbizvenjgsw.supabase.co',
  supabaseKey: 'sb_publishable_NubptiRiVEhqQppekdZlWw_uc5ilTmK'
};
