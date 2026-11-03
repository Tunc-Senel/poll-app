import { EnvironmentConfig } from '../app/models/environment-config';

/**
 * Settings for local development (ng serve).
 * Replaces environment.ts via fileReplacements in angular.json.
 * The publishable key is public by design, access is protected by RLS.
 */
export const environment: EnvironmentConfig = {
  supabaseUrl: 'https://xmxumyhafdbizvenjgsw.supabase.co',
  supabaseKey: 'sb_publishable_NubptiRiVEhqQppekdZlWw_uc5ilTmK'
};
