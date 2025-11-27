/**
 * Structure of privileges from API
 * Example response:
 * {
 *   "role_code": "STUDENTS",
 *   "privileges": {
 *     "brands": [
 *       { "description": "Get all brands", "status": "active" },
 *       { "description": "Create a new brand", "status": "active" },
 *       { "description": "Update a brand by ID", "status": "inactive" },
 *       { "description": "Delete a brand by ID", "status": "inactive" }
 *     ],
 *     "categories": [...],
 *     ...
 *   }
 * }
 */

export interface Privilege {
  description: string;
  status: 'active' | 'inactive';
}

export interface UserPrivileges {
  [module: string]: Privilege[];
}

interface RolePrivilegesResponse {
  role_code: string;
  privileges: {
    [module: string]: Privilege[];
  };
}

/* -------------------------------------------------------------------------- */
/*                         SUPER ADMIN OVERRIDE HELPERS                        */
/* -------------------------------------------------------------------------- */

const SUPER_ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", ];

export function isSuperAdmin(roleCodes: string[]): boolean {
  return roleCodes.some((role) =>
    SUPER_ADMIN_ROLES.includes(role.toUpperCase())
  );
}

/* -------------------------------------------------------------------------- */
/*                       UI MODULE ➜ API RESOURCE MAPPING                     */
/* -------------------------------------------------------------------------- */

export const MODULE_TO_RESOURCE: Record<string, string> = {
  'Dashboard': 'dashboard',
  'Brands': 'brands',
  'Categories': 'categories',
  'Sub Categories': 'sub_categories',
  'Unit of Measurements': 'uoms',
  'Academic Sessions': 'academic_session_terms',
  'Classes': 'school_classes',
  'Students': 'students',
  'Teachers': 'class_teachers',
  'Inventory Items': 'inventory_items',
  'Inventory Transactions': 'inventory_transactions',
  'Inventory Summary': 'inventory_summary',
  'Suppliers': 'suppliers',
  'Supplier Transactions': 'supplier_transactions',
  'Entitlements': 'class_inventory_entitlements',
  'Student Collections': 'student_inventory_collection',
  'Distributions': 'inventory_transactions',
  'Collection Summary': 'inventory_summary',
  'Collection Report': 'inventory_summary',
  'Users': 'users',
  'Roles': 'roles',
  'Privileges': 'role_privileges',
  'Menus': 'menus',
  'Settings': 'settings',
};

const ACTION_PATTERNS: Record<string, string[]> = {
  'read': ['Get all', 'Get a', 'Get an'],
  'get': ['Get all', 'Get a', 'Get an'],
  'create': ['Create a new'],
  'update': ['Update a', 'Update an'],
  'delete': ['Delete a', 'Delete an'],
};

/* -------------------------------------------------------------------------- */
/*                            UTILITY FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

export function getResourceKey(moduleName: string): string {
  return MODULE_TO_RESOURCE[moduleName] || moduleName.toLowerCase().replace(/ /g, '_');
}

/* -------------------------------------------------------------------------- */
/*                     FETCH PRIVILEGES FOR A SINGLE ROLE                     */
/* -------------------------------------------------------------------------- */

async function fetchRolePrivileges(roleCode: string): Promise<UserPrivileges> {
  try {
    const response = await fetch(
      `/api/proxy/role_privileges?role_code=${roleCode}`,
      { headers: { 'accept': 'application/json' } }
    );

    if (!response.ok) {
      console.warn(`⚠️ No privileges found for role: ${roleCode}`);
      return {};
    }

    const data: RolePrivilegesResponse = await response.json();
    return data.privileges || {};
  } catch (error) {
    console.error(`❌ Failed to fetch privileges for role ${roleCode}:`, error);
    return {};
  }
}

/* -------------------------------------------------------------------------- */
/*                   MERGE PRIVILEGES ACROSS MULTIPLE ROLES                  */
/* -------------------------------------------------------------------------- */

function mergePrivileges(existing: Privilege[], incoming: Privilege[]): Privilege[] {
  const merged = [...existing];

  incoming.forEach((p) => {
    const index = merged.findIndex((e) => e.description === p.description);
    if (index >= 0) {
      if (p.status === 'active') merged[index].status = 'active';
    } else {
      merged.push(p);
    }
  });

  return merged;
}

/* -------------------------------------------------------------------------- */
/*       FETCH PRIVILEGES FOR ALL USER ROLES (WITH SUPER ADMIN OVERRIDE)     */
/* -------------------------------------------------------------------------- */

export async function fetchUserPrivilegesForRoles(
  roleCodes: string[]
): Promise<UserPrivileges> {

  // SUPER ADMIN → GIVE ALL ACCESS
  if (isSuperAdmin(roleCodes)) {
    return {
      "*": [{ description: "ALL_PRIVILEGES", status: "active" }]
    };
  }

  try {
    const privilegesPromises = roleCodes.map((roleCode) =>
      fetchRolePrivileges(roleCode)
    );

    const privilegesArray = await Promise.all(privilegesPromises);

    const mergedPrivileges: UserPrivileges = {};

    privilegesArray.forEach((rolePrivs) => {
      Object.keys(rolePrivs).forEach((module) => {
        mergedPrivileges[module] = mergedPrivileges[module]
          ? mergePrivileges(mergedPrivileges[module], rolePrivs[module])
          : rolePrivs[module];
      });
    });

    return mergedPrivileges;
  } catch (error) {
    console.error('Failed to fetch user privileges:', error);
    return {};
  }
}

/* -------------------------------------------------------------------------- */
/*                                CHECKERS                                    */
/* -------------------------------------------------------------------------- */

export function hasPrivilege(
  privileges: UserPrivileges,
  privilegeDescription: string,
  module?: string
): boolean {
  if (!privileges) return false;

  if (privileges["*"]) return true; // SUPER ADMIN

  if (module) {
    const resourceKey = getResourceKey(module);
    const modulePrivileges = privileges[resourceKey];
    if (!modulePrivileges) return false;

    return modulePrivileges.some(
      (priv) =>
        priv.description.toLowerCase().includes(privilegeDescription.toLowerCase()) &&
        priv.status === 'active'
    );
  }

  return Object.values(privileges).some((privs) =>
    privs.some(
      (priv) =>
        priv.description.toLowerCase().includes(privilegeDescription.toLowerCase()) &&
        priv.status === 'active'
    )
  );
}

/* -------------------------------------------------------------------------- */
/*                     CAN USER PERFORM ACTION? (MAIN CHECK)                 */
/* -------------------------------------------------------------------------- */

export function canPerformAction(
  privileges: UserPrivileges,
  moduleName: string,
  action: 'create' | 'read' | 'update' | 'delete' | 'get'
): boolean {
  if (!privileges) return false;

  if (privileges["*"]) return true; // SUPER ADMIN

  const resourceKey = getResourceKey(moduleName);
  const modulePrivileges = privileges[resourceKey];

  if (!modulePrivileges) {
    console.warn(`⚠️ No privileges found for module: ${moduleName} (${resourceKey})`);
    return false;
  }

  const patterns = ACTION_PATTERNS[action.toLowerCase()];
  if (!patterns) return false;

  const allowed = modulePrivileges.some((priv) =>
    patterns.some((pattern) => 
      priv.description.startsWith(pattern) && priv.status === 'active'
    )
  );

  return allowed;
}

/* -------------------------------------------------------------------------- */
/*                              MODULE HELPERS                                */
/* -------------------------------------------------------------------------- */

export function getModulePrivileges(
  privileges: UserPrivileges,
  moduleName: string
): Privilege[] {
  if (privileges["*"]) return [{ description: "ALL_PRIVILEGES", status: "active" }];

  const resourceKey = getResourceKey(moduleName);
  return privileges[resourceKey]?.filter((p) => p.status === 'active') || [];
}

export function hasAnyPrivilegeInModule(
  privileges: UserPrivileges,
  moduleName: string
): boolean {
  if (privileges["*"]) return true;

  const resourceKey = getResourceKey(moduleName);
  const modulePrivileges = privileges[resourceKey];

  if (!modulePrivileges) return false;

  return modulePrivileges.some((priv) => priv.status === 'active');
}

export function getAccessibleModules(privileges: UserPrivileges): string[] {
  if (privileges["*"]) return ["*"];

  return Object.keys(privileges).filter((module) =>
    privileges[module].some((priv) => priv.status === 'active')
  );
}
