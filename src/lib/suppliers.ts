import { apiRequest, ApiError } from './helper'; 
import { Supplier, CreateSupplierPayload, UpdateSupplierPayload } from '@/lib/types/suppliers';

export { ApiError }; 

/** GET /api/v1/suppliers - Get all suppliers */
export const getAllSuppliers = async (): Promise<Supplier[]> => {
    return apiRequest<Supplier[]>('suppliers', { method: 'GET' }); 
};

/** GET /api/v1/suppliers/{id} - Get supplier by ID */
export const getSupplierById = async (id: string): Promise<Supplier> => {
    return apiRequest<Supplier>(`suppliers/${id}`, { method: 'GET' });
};

/** POST /api/v1/suppliers - Create a new supplier */
export const createSupplier = async (payload: CreateSupplierPayload): Promise<Supplier> => {
    return apiRequest<Supplier>('suppliers', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

/** PUT /api/v1/suppliers/{id} - Update supplier */
export const updateSupplier = async (id: string, payload: UpdateSupplierPayload): Promise<Supplier> => {
    return apiRequest<Supplier>(`suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
};

/** DELETE /api/v1/suppliers/{id} - Delete supplier */
export const deleteSupplier = async (id: string): Promise<void> => {
    return apiRequest<void>(`suppliers/${id}`, { method: 'DELETE' }); 
};