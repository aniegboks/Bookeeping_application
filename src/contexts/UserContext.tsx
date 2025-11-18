"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Map Supabase roles to backend role codes
  const mapRoleToBackendCode = (role: string): string => {
    const roleMap: Record<string, string> = {
      'admin': 'ADMIN',
      'super-admin': 'SUPER_ADMIN',
      'editor': 'ADMIN', // Map editor to ADMIN if needed
      'teacher': 'CLASS_TEACHER',
      'user': 'STUDENTS', // Default users to STUDENTS role
      // Add more mappings as needed
    };
    
    // Return mapped role or uppercase the role as fallback
    return roleMap[role.toLowerCase()] || role.toUpperCase();
  };

  const fetchMenus = useCallback(async (roles: string[]) => {
    try {
      // Map Supabase roles to backend role codes
      const backendRoles = roles.map(mapRoleToBackendCode);
      console.log('🔄 Mapped roles:', { original: roles, backend: backendRoles });

      // Fetch menus for each role using proxy
      const menusPromises = backendRoles.map(async (roleCode: string) => {
        try {
          const res = await fetch(`/api/proxy/role_menus/role/${roleCode}`);
          
          if (res.ok) {
            const data: RoleMenuResponse[] = await res.json();
            // Extract menu objects from role_menus response
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

      // Remove duplicates based on menu id
      const uniqueMenus = Array.from(
        new Map(allMenus.map((menu) => [menu.id, menu])).values()
      );

      // Sort alphabetically by caption
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

  const fetchUser = useCallback(async () => {
    try {
      // Fetch user via proxy - uses /api/v1/auth/test endpoint
      const res = await fetch("/api/proxy/auth/test");
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        // After getting user, fetch their menus based on roles
        if (data.user?.roles && data.user.roles.length > 0) {
          await fetchMenus(data.user.roles);
        } else {
          setMenus([]);
        }
      } else {
        setUser(null);
        setMenus([]);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, [fetchMenus]);

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
      setMenus([]);
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, menus, loading, logout, refreshUser: fetchUser }}>
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