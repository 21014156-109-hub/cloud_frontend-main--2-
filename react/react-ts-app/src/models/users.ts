export interface Add {
  status?: boolean;
  message?: string;
  data?: any;
}

export interface CollectionById {
  status?: boolean;
  message?: string;
  data?: any;
}

export interface PaginatedListing {
  status?: boolean;
  message?: string;
  data?: PageDataEntity;
}
export interface PageDataEntity {
  totalItems : number;
  totalPages: number;
  currentPage: number;
  data: any;
}
export interface Delete {
  status?: boolean;
  message?: string;
  data?: any
}
export interface CollectionListing {
  status?: boolean;
  message?: string;
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
