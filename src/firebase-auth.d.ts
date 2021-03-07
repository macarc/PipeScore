declare module 'firebase-auth-lite' {
  class User {
    readonly email: string
    readonly localId: string
  }

  export default class Auth {
    constructor(options: { apiKey: string, redirectUrl?: string })

    signUp(email: string, password: string): Promise<void>
    signIn(email: string, password: string): Promise<void>
    signOut(): Promise<void>

    authorizedRequest(input: RequestInfo, init?: RequestInit): Promise<Response>
    listen(callback: (user: User) => void): () => void;
  }
}
