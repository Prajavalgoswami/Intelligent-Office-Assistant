import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getEmployeeMe, type EmployeeMe } from "../api/employee.api";

interface EmployeeAuthContextValue {
  user: EmployeeMe | null;
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  hasRole: (roleName: string) => boolean;
  hasRoleLike: (substring: string) => boolean;
}

const EmployeeAuthContext = createContext<EmployeeAuthContextValue | undefined>(
  undefined,
);

export function EmployeeAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<EmployeeMe | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const response = await getEmployeeMe();
      setUser(response.data);
    } catch (err) {
      console.error("Failed to load employee profile", err);
      setUser(null);
      setError("Unable to load your profile. Please sign in again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const hasRole = useCallback(
    (roleName: string) => {
      if (!user?.roles) return false;
      return user.roles.includes(roleName);
    },
    [user],
  );

  const hasRoleLike = useCallback(
    (substring: string) => {
      if (!user?.roles) return false;
      const lower = substring.toLowerCase();
      return user.roles.some((r) => r.toLowerCase().includes(lower));
    },
    [user],
  );

  const value: EmployeeAuthContextValue = {
    user,
    loading,
    error,
    refresh,
    hasRole,
    hasRoleLike,
  };

  return (
    <EmployeeAuthContext.Provider value={value}>
      {children}
    </EmployeeAuthContext.Provider>
  );
}

export function useEmployeeAuth(): EmployeeAuthContextValue {
  const ctx = useContext(EmployeeAuthContext);
  if (!ctx) {
    throw new Error(
      "useEmployeeAuth must be used within an EmployeeAuthProvider",
    );
  }
  return ctx;
}

