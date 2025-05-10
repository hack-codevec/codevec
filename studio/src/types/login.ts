export type Providers = "google" | "github";

export type role = "anon" | "authenticated";

export interface User {
    email: string;
    role: role
}