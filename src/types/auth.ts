export interface AuthCredentials {
  email: string;
  password?: string; // Password might not be needed for all auth actions (e.g. OAuth)
  displayName?: string; // For signup
}
