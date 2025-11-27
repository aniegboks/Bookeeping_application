"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchUserPrivilegesForRoles, hasPrivilege, canPerformAction, UserPrivileges } from "@/lib//auth/privilages";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  teacher_id?: string | null;
}

interface Menu {
  id: string;
  route: string;
  caption: string;
  created_at: string;
  updated_at: string;
}

interface RoleMenuResponse {
  menu: Menu;
}

interface UserContextType {
  user: User | null;
  menus: Menu[];
  privileges: UserPrivileges;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPrivilege: (privilege: string, module?: string) => boolean;
  canPerformAction: (module: string, action: 'create' | 'read' | 'update' | 'delete' | 'get') => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [privileges, setPrivileges] = useState<UserPrivileges>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Map Supabase roles to backend role codes
  const mapRoleToBackendCode = (role: string): string => {
    const roleMap: Record<string, string> = {
      'admin': 'ADMIN',
      'super-admin': 'SUPER_ADMIN',
      'editor': 'ADMIN',
      'teacher': 'CLASS_TEACHER',
      'user': 'STUDENTS',
    };
    
    return roleMap[role.toLowerCase()] || role.toUpperCase();
  };

  const fetchMenus = useCallback(async (roles: string[]) => {
    try {
      const backendRoles = roles.map(mapRoleToBackendCode);
      console.log('🔄 Mapped roles:', { original: roles, backend: backendRoles });

      const menusPromises = backendRoles.map(async (roleCode: string) => {
        try {
          const res = await fetch(`/api/proxy/role_menus/role/${roleCode}`);
          
          if (res.ok) {
            const data: RoleMenuResponse[] = await res.json();
            return data.map((item) => item.menu);
          }
          console.warn(`⚠️ No menus found for role: ${roleCode}`);
          return [];
        } catch (error) {
          console.error(`❌ Failed to fetch menus for role ${roleCode}:`, error);
          return [];
        }
      });

      const menusArrays = await Promise.all(menusPromises);
      const allMenus = menusArrays.flat();

      const uniqueMenus = Array.from(
        new Map(allMenus.map((menu) => [menu.id, menu])).values()
      );

      uniqueMenus.sort((a, b) => 
        a.caption.localeCompare(b.caption)
      );

      console.log(`✅ Loaded ${uniqueMenus.length} unique menus for roles:`, backendRoles);
      setMenus(uniqueMenus);
    } catch (error) {
      console.error("Failed to fetch menus:", error);
      setMenus([]);
    }
  }, []);

  // ✅ NEW: Fetch user privileges
  const fetchPrivileges = useCallback(async (roles: string[]) => {
    try {
      const backendRoles = roles.map(mapRoleToBackendCode);
      console.log('🔄 Fetching privileges for roles:', backendRoles);

      const userPrivileges = await fetchUserPrivilegesForRoles(backendRoles);
      
      const privilegeCount = Object.values(userPrivileges).reduce(
        (sum, privs) => sum + privs.length, 
        0
      );
      
      console.log(`✅ Loaded ${privilegeCount} privileges across ${Object.keys(userPrivileges).length} modules`);
      setPrivileges(userPrivileges);
    } catch (error) {
      console.error("Failed to fetch privileges:", error);
      setPrivileges({});
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/proxy/auth/test");
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        if (data.user?.roles && data.user.roles.length > 0) {
          // Fetch both menus and privileges
          await Promise.all([
            fetchMenus(data.user.roles),
            fetchPrivileges(data.user.roles)
          ]);
        } else {
          setMenus([]);
          setPrivileges({});
        }
      } else {
        setUser(null);
        setMenus([]);
        setPrivileges({});
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      setMenus([]);
      setPrivileges({});
    } finally {
      setLoading(false);
    }
  }, [fetchMenus, fetchPrivileges]);

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
      setMenus([]);
      setPrivileges({});
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  // ✅ Helper functions for privilege checking
  const checkPrivilege = useCallback((privilege: string, module?: string) => {
    return hasPrivilege(privileges, privilege, module);
  }, [privileges]);

  const checkAction = useCallback((module: string, action: 'create' | 'read' | 'update' | 'delete' | 'get') => {
    return canPerformAction(privileges, module, action);
  }, [privileges]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ 
      user, 
      menus, 
      privileges,
      loading, 
      logout, 
      refreshUser: fetchUser,
      hasPrivilege: checkPrivilege,
      canPerformAction: checkAction
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}