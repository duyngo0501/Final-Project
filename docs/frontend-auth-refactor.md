# Frontend Authentication Refactoring Summary

This document summarizes the refactoring process undertaken to integrate the frontend authentication system with the backend API using SWR for data fetching and state management, replacing the previous mock implementation.

**Goal:**

*   Replace mock authentication logic (login, register, get user) with actual API calls.
*   Utilize the auto-generated API client (created by Kubb, located in `src/gen/`).
*   Implement robust state management, caching, and revalidation using SWR (`useSWR`, `useSWRMutation`).
*   Centralize API interaction logic into custom SWR hooks.
*   Refactor `AuthContext` to leverage these hooks.

**Files Involved:**

*   `apps/frontend/src/contexts/AuthContext.tsx`: The main context provider.
*   `apps/frontend/src/hooks/useApi.ts`: (New File) Contains custom SWR hooks wrapping API calls.
*   `apps/frontend/src/services/api.ts`: Previously contained mock API functions; now partially updated.
*   `apps/frontend/src/gen/`: Directory containing the Kubb-generated types and client functions.

**Steps Taken:**

1.  **Analysis:**
    *   Examined `AuthContext.tsx` and identified its reliance on `useState` and mock functions imported from `services/api.ts`.
    *   Examined `services/api.ts` and confirmed it used mock data and `setTimeout` to simulate API calls.

2.  **Initial API Service Update (`services/api.ts`):**
    *   Attempted to replace mock functions in `authAPI` with calls to assumed Kubb client functions (e.g., `authLogin`, `authRegisterUser`).
    *   Correct import paths and function/type names from `src/gen/` are still required to fully resolve linter errors here.
    *   Added placeholder `refreshToken` function.
    *   `FIXME` comments were added for parts requiring the actual Kubb function names for `getCurrentUser` and `refreshToken`.

3.  **Created SWR Hooks (`hooks/useApi.ts`):**
    *   Created a new file to encapsulate API interactions using SWR.
    *   Defined `useCurrentUser` using `useSWR` to fetch user data (currently contains a `FIXME` as the exact Kubb call is unknown).
    *   Defined `useLoginMutation` using `useSWRMutation` to handle the login process, calling the assumed `authLogin` Kubb function. Includes `onSuccess` logic to store the token and `onError` handling.
    *   Defined `useRegisterMutation` using `useSWRMutation`, calling the assumed `authRegisterUser` Kubb function.
    *   Defined `useLogoutMutation` using `useSWRMutation` to handle clearing local storage and the SWR user cache (contains a `FIXME` regarding an optional backend logout call).
    *   Defined `useRefreshTokenMutation` using `useSWRMutation` (contains a `FIXME` as the exact Kubb refresh call is unknown).

4.  **Refactored `AuthContext.tsx`:**
    *   Removed internal `useState` hooks for managing `user`, `loading`, and `error` state related to authentication.
    *   Imported and utilized the SWR hooks (`useCurrentUser`, `useLoginMutation`, etc.) from `hooks/useApi.ts`.
    *   Updated the `AuthContextValue` interface to reflect the state provided by the SWR hooks (e.g., `isUserLoading`, `loginError`, `isLoggingIn`).
    *   Rewrote the `login`, `register`, and `logout` functions provided by the context to simply call the `trigger` functions returned by the corresponding SWR mutation hooks.
    *   Updated derived state calculations (`isAuthenticated`, `isAdmin`) to use the user state from `useCurrentUser`. (Note: `isAdmin` check has a linter error due to type mismatch assumption).
    *   Addressed a type issue with `useContextSelector` by casting the context type.

**Current Status & Next Steps:**

*   The core structure for using SWR hooks for authentication is in place in `hooks/useApi.ts` and integrated into `AuthContext.tsx`.
*   **Blocking Issues:**
    *   **Kubb Imports:** The exact import paths and exported names for types (e.g., `AuthLoginRequest`) and client functions (e.g., `authLogin`, `getCurrentUser`, `refreshToken`) from `src/gen/` need to be provided and corrected in both `services/api.ts` and `hooks/useApi.ts` to resolve linter errors.
    *   **`getCurrentUser` / `refreshToken` Implementation:** The actual Kubb client function calls for fetching the current user and refreshing the token need to be implemented within the respective SWR hooks in `hooks/useApi.ts`.
    *   **Type Mismatches:** The `User` type used in the context (`UserReadSchema` from SWR) needs to be reconciled with the properties expected (e.g., for the `isAdmin` check). The actual properties of `UserReadSchema` need to be confirmed from the generated types.
*   **Further Steps:**
    *   Refactor Login/Register components (and any others displaying user info/logout buttons) to use the updated `useAuth` hook and consume the SWR-provided state (e.g., `isLoggingIn`, `loginError`, `user`, `isUserLoading`).
    *   Implement token refresh interceptors (example commented out in `services/api.ts`) or integrate refresh logic into the SWR fetcher/hooks.
    *   Introduce Immer for state mutations where applicable (e.g., if managing token state directly in context).
    *   Manually test the complete authentication flow.
    *   Remove the remaining mock APIs (`gamesAPI`, `cartAPI`) from `services/api.ts` or refactor them similarly using SWR hooks in subsequent tasks. 