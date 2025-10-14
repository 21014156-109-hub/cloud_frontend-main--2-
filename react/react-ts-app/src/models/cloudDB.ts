export interface cloudDBListing {
    status?: boolean;
    mesage?: string;
    data?: DataEntity;
}
export interface DataEntity {
    totalItems : number;
    totalPages: number;
    currentPage: number;
    data: any ;
}

export interface ExportFile {
  status?: boolean;
  message?: string;
  data?: any;
}
