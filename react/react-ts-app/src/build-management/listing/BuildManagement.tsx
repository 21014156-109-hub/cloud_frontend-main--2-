import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { BuildManagementService } from '../build-management.service';
import './build-management.css';
import { PaginationLinks } from '../../components';

interface BuildRecord {
  id?: number;
  buildName?: string;
  buildNo?: string;
  version?: string;
  buildNumber?: string;
  fileName?: string;
  name?: string;
  createdAt?: string;
}

interface ListingPage {
  totalItems?: number;
  totalPages?: number;
  data?: BuildRecord[];
}

const service = new BuildManagementService();

export default function BuildManagement() {
  // breadcrumb placeholder (header component not yet ported)
  const [records, setRecords] = useState<BuildRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [displayUploadModal, setDisplayUploadModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileLabelText, setFileLabelText] = useState<string>('Choose file');
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const modalHeader = useMemo(() => 'Upload Build', []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = useCallback(async (page: number) => {
    setCurrentPage(page);
    try {
      const response = await service.listing(page - 1, pageSize);
      if (response?.status) {
        const records: ListingPage = response.data || {};
        setTotalRecords(records.totalItems || 0);
        setTotalPages(records.totalPages || 0);
        setRecords(records.data || []);
      }
    } catch {
      // ignore
    }
  }, [pageSize]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Build Management', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  function pageChange(page: number) {
    fetchData(page);
  }

  function changePage(newPageSize: number) {
    setPageSize(newPageSize);
    fetchData(currentPage);
  }

  function openUploadModal() {
    setSelectedFile(null);
    setFileLabelText('Choose file');
    setDisplayUploadModal(true);
  }

  function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileLabelText(file.name);
    }
  }

  async function uploadFile() {
    if (!selectedFile) return;
    setBusy(true);
    try {
      const res = await service.uploadBuild(selectedFile);
      if (res.status) {
        const action = res.data?.action;
        let message = 'Build uploaded successfully';
        if (action === 'created') message = 'Build created successfully';
        else if (action === 'updated') message = 'Build updated successfully';
        toast.success(message);
        setDisplayUploadModal(false);
        fetchData(currentPage);
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      const message = (typeof err === 'object' && err && 'error' in err) ? (err as { error?: { error?: string } }).error?.error : 'Upload failed';
      toast.error(message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }
  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileLabelText(file.name);
    }
  }

  async function confirmDelete(buildId: number) {
    // Simple confirm for now; could replace with a modal later
    if (window.confirm('Are you sure? You will not be able to recover this!')) await deleteBuild(buildId);
  }

  async function deleteBuild(buildId: number) {
    try {
      const res = await service.deleteBuild(buildId);
      if (res.status) {
        toast.success('Build deleted successfully');
        fetchData(currentPage);
      } else {
        toast.error('Delete failed');
      }
    } catch (err) {
      const message = (typeof err === 'object' && err && 'error' in err) ? (err as { error?: { error?: string } }).error?.error : 'Delete failed';
      toast.error(message || 'Delete failed');
    }
  }

  return (
    <div className="container-fluid pt-8">
      <div className="row">
        <div className="col">
          <div className="card shadow">
            <div className="row search_row">
              <div className="col-sm-6">
                <button type="button" className="btn btn-padding btn-dark-custom btn-bold" onClick={openUploadModal}>
                  <i className="fa fa-plus" aria-hidden="true" /> Add
                </button>
              </div>
              <div className="offset-md-4 col-md-2 col-sm-12">
                <input id="search-textbox" className="form-control search-textbox" type="text" placeholder="Search" style={{ height: 36 }} disabled />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Build Name</th>
                    <th>Build No</th>
                    <th>File Name</th>
                    <th>Uploaded At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row, rowIndex) => (
                    <tr key={row.id || rowIndex}>
                      <td>{((currentPage - 1) * pageSize) + rowIndex + 1}</td>
                      <td>{row.buildName || '-'}</td>
                      <td>{row.buildNo || row.version || row.buildNumber || '-'}</td>
                      <td>{row.fileName || row.name}</td>
                      <td>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}</td>
                      <td>
                        <a className="text-black-50" href="#" onClick={(e) => { e.preventDefault(); if (row.id != null) confirmDelete(row.id); }}>
                          <i className="fa fa-trash text-danger" aria-hidden="true" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {records.length > 0 && (
              <PaginationLinks
                totalRecords={totalRecords}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={pageChange}
                onPageSizeChange={changePage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Upload modal (simple) */}
      {displayUploadModal && (
        <div className="p-4" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card">
            <div className="card-header"><strong>{modalHeader}</strong></div>
            <div className="card-body">
              <div className="form-group">
                <input id="fileInput" ref={fileInputRef} type="file" className="form-control" onChange={onFileSelected} />
                <label htmlFor="fileInput" className="mt-2">{fileLabelText}</label>
              </div>
              <div className={`dropzone ${isDraggingOver ? 'drag-over' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                Drag & drop your build file here, or click above to select
              </div>
              <div className="text-right mt-3">
                <button className="btn btn-dark" disabled={!selectedFile || busy} onClick={uploadFile}>
                  {busy ? 'Submitting…' : 'Submit'}
                </button>
                <button className="btn btn-link ml-2" onClick={() => setDisplayUploadModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
