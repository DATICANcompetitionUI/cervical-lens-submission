import { createContext, useContext } from "react";

/** Lets any screen (e.g. Profile's sign-out) flip RootNavigator back to the login gate. */
export const AuthContext = createContext<{ signOut: () => void }>({
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
