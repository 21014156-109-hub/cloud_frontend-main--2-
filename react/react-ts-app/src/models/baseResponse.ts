export interface BaseResponse {
    status: boolean;
    message: string;
    data?: any;
}

export interface ListingResponse {
  status: boolean;
  message: string;
  data?: ListingDataEntity;
}

export interface ListingDataEntity {
  totalItems : number;
  totalPages: number;
  currentPage: number;
  data: [] | null ;
}
