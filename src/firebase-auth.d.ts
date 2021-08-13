/* Type declarations for firebase-auth-lite */
declare module 'firebase-auth-lite' {
  export type ProviderUser = {
    readonly email: string;
    readonly federatedId: string;
    readonly providerId: string;
    readonly rawId: string;
  };
  export type TokenManager =
    | {
        readonly displayName: string;
        readonly email: string;
        readonly expiresIn: string;
        readonly idToken: string;
        readonly kind: string;
        readonly localId: string;
        readonly refreshToken: string;
        readonly registered: boolean;
      }
    | {
        readonly expiresAt: number;
        readonly idToken: string;
        readonly refreshToken: string;
      };
  export type User = {
    readonly createdAt: string;
    readonly email: string;
    readonly emailVerified: boolean;
    readonly lastLoginAt: string;
    readonly lastRefreshAt: string;
    readonly localId: string;
    readonly passwordHash: string;
    readonly passwordUpdatedAt: number;
    readonly providerUserData: ProviderUser[];
    readonly tokenManager: TokenManager;
    readonly validSince: string;
  };

  export type ProvidersForEmailResponse = {
    readonly allProviders: string[];
    readonly registered: boolean;
    readonly sessionId: string;
    readonly signInMethods: string[];
  };

  export interface ProviderOptions {
    readonly name: string;

    readonly scope?: string;
  }

  export interface OAuthFlowOptions {
    readonly provider: string;

    readonly context?: string;
    readonly linkAccount?: boolean;
  }

  export interface ProviderSignInOptions {
    provider: string;

    context?: string;
    linkAccount?: boolean;
    oauthScope?: string;
  }

  export interface AuthOptions {
    apiKey: string;
    redirectUrl?: string;
  }

  export default class Auth {
    constructor(options: AuthOptions);

    signUp(email: string, password: string): Promise<User>;
    signUp(): Promise<User>;
    signIn(email: string, password: string): Promise<void>;
    signInWithCustomToken(tkoen: string): Promise<User>;
    signInWithProvider(options: ProviderSignInOptions | 'string'): never;
    signOut(): Promise<null>;

    handleSignInRedirect(): void;

    resetPassword(oobCode: string, newPassword: string): Promise<string>;
    deleteAccount(): Promise<void>;

    sendOobCode(requestType: 'PASSWORD_RESET', email: string): void;
    sendOobCode(requestType: 'EMAIL_SIGNIN' | 'VERIFY_EMAIL'): void;

    fetchProvidersForEmail(email: string): ProvidersForEmailResponse;
    fetchProfile(tokenManager?: TokenManager): Promise<User>;
    updateProfile(newData: User): Promise<User>;

    listen(callback: (user: User) => void): () => void;
    authorizedRequest(
      resource: Request | RequestInfo,
      init: RequestInit
    ): Promise<Response>;
  }
}
