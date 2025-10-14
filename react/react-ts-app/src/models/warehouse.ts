export interface AddWarehouse {
    status?: boolean;
    mesage?: string;
    data?: Data | null;
}
export interface Data {
    collectionType: string;
    status: number;
    _id: string;
    _postman_id: string;
    name: string;
    schema: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}
export interface WarehouseById {
    status?: boolean;
    mesage?: string;
    data?: Data | null;
}
export interface DeleteWarehouse {
    status?: boolean;
    message?: string;
    data?: any
}
export interface WarehouseInfoListing {
    status?: boolean;
    mesage?: string;
    data?: DataEntity[] | null;
}
export interface DataEntity {
  key :string ,
  value :string
}
