const PROXY_BASE_URL = "/api/proxy";

/**
 * Generic fetch wrapper for reference data that uses the secure server proxy.
 * @param path The specific endpoint path (e.g., "categories", "brands")
 */
async function fetchProxy(path: string) {
    const url = `${PROXY_BASE_URL}/${path}`;
    
    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 401) {
                // If unauthorized, redirect to login
                window.location.href = "/login";
                // Throwing an error ensures the rest of the promise chain stops
                throw new Error("Unauthorized"); 
            }
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || response.statusText);
        }

        return response.json();
    } catch (err) {
        console.error(`Fetch failed for ${path}:`, err);
        throw err;
    }
}

export const referenceDataApi = {
    fetchCategories: () => fetchProxy("categories"),
    fetchBrands: () => fetchProxy("brands"),
    fetchSubCategories: () => fetchProxy("sub_categories"),
    fetchUOMs: () => fetchProxy("uoms"),
};