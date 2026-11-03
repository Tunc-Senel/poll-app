/**
 * Shape of the environment files.
 * Both environment.ts and environment.development.ts use it,
 * so they must always contain the same keys.
 */
export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseKey: string;
}
