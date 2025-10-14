export interface AddStation {
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
export interface CollectionById {
    status?: boolean;
    mesage?: string;
    data?: Data | null;
}
export interface DeleteCollection {
    status?: boolean;
    message?: string;
    data?: any
}
export interface CollectionInfoListing {
    status?: boolean;
    mesage?: string;
    data?: DataEntity[] | null;
}
export interface DataEntity {
    total_apis: number;
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
