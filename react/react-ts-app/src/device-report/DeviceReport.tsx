import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CloudDBService } from '../cloudDB/cloudDB.service';
import { LogosService } from '../logo-setting/logos.service';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import QRCode from 'qrcode';
import '../styles/cloudDB-listing.css';

const svc = new CloudDBService();
const logoSvc = new LogosService();

export default function DeviceReport() {
  const [searchParams] = useSearchParams();
  const [deviceRecord, setDeviceRecord] = useState<Record<string, any> | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<any>(null);
  const [testRecords, setTestRecords] = useState<any[]>([]);
  const [countPassed, setCountPassed] = useState<number>(0);
  const [countFailed, setCountFailed] = useState<number>(0);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string>('');
  const [qrcodedata, setQrcodedata] = useState<string>('');
  const [eraseDate, setEraseDate] = useState<string>('');
  const [logoImage, setLogoImage] = useState<string>('');
  const pdfTableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      const id = Number(idParam);
      setTransactionId(id);
      svc.getDeviceByTransactionId(id).then((res) => {
        if (res && (res as any).status) {
          const record = (res as any).data[0];
          setDeviceRecord(record);
          mapRecordToState(record);
          // try to load logo if available
          if (record?.clientId) loadClientLogo(record.clientId);
        }
      }).catch(console.error);
    }
  }, [searchParams]);

  async function loadClientLogo(clientId: number) {
    try {
      const resp: any = await logoSvc.getClientLogo(clientId);
      if (resp && resp.status && resp.data?.imageURL) {
        const base64 = await getBase64ImageFromUrl(resp.data.imageURL);
        setLogoImage(String(base64 || ''));
      }
    } catch (err) {
      // ignore
    }
  }

  async function getBase64ImageFromUrl(url: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  }

  function mapRecordToState(record: Record<string, any>) {
    try {
      if (record?.batteryInfo) setBatteryInfo(JSON.parse(record.batteryInfo));
      setTransactionId(record.transactionId || transactionId || null);
      if (record?.eraseInfo && typeof record.eraseInfo === 'object') setEraseDate(record.eraseInfo.eraseDateTime || '');

      const tests: any[] = [];
      let failed = 0;
      let passed = 0;
      if (record?.testInfo?.failedResult) {
        const failedResult = String(record.testInfo.failedResult || '');
        const failedTests = failedResult.split(',').filter(Boolean);
        failed += failedTests.length;
        tests.push(...failedTests.map((t) => ({ name: t, status: 'failed' })));
      }
      if (record?.testInfo?.passedResult) {
        const passedResult = String(record.testInfo.passedResult || '');
        const passedTests = passedResult.split(',').filter(Boolean);
        passed += passedTests.length;
        tests.push(...passedTests.map((t) => ({ name: t, status: 'passed' })));
      }
      setCountFailed(failed);
      setCountPassed(passed);
      setTestRecords(tests);

      const baseUrl = window.location.origin;
  const qdata = `${baseUrl}/device-report?id=${record.transactionId}&IMEI=${record.imei}`;
  setQrcodedata(qdata);
  QRCode.toDataURL(qdata).then((url: string) => setQrCodeImageUrl(url)).catch((e: any) => console.error(e));
    } catch (err) {
      console.error(err);
    }
  }

  function printPage() {
    const printStylesheet = document.querySelector('link[media="print"]');
    if (printStylesheet) printStylesheet.setAttribute('media', 'all');
    window.print();
    if (printStylesheet) printStylesheet.setAttribute('media', 'print');
  }

  function downloadPdf() {
    const element = pdfTableRef.current;
    if (!element) return;
  html2canvas(element, { scale: 1 }).then((canvas: HTMLCanvasElement) => {
      const pdf = new jspdf('portrait', 'mm', 'a4', true);
      const ratio = canvas.width / canvas.height;
      const pdfWidth = 210;
      const leftMargin = 0;
      const imgWidth = pdfWidth - leftMargin;
      const imgHeight = imgWidth / ratio;
      const zoomFactor = 1;
      const adjustedImgWidth = imgWidth * zoomFactor;
      const adjustedImgHeight = imgHeight * zoomFactor;
      const offsetX = (imgWidth - adjustedImgWidth) / 2;
      const topMargin = 20;
      const offsetY = (imgHeight - adjustedImgHeight) / 2 + topMargin;
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', leftMargin + offsetX, offsetY, adjustedImgWidth, adjustedImgHeight);
      const fileName = `report${transactionId || ''}.pdf`;
      pdf.save(fileName);
    }).catch(console.error);
  }

  function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) result.push(array.slice(i, i + chunkSize));
    return result;
  }

  return (
    <div className="container-fluid pt-4">
      <div className="row">
        <div className="col-12">
          {deviceRecord && (
            <div>
              <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-dark-custom btn-sm mr-2" onClick={printPage}><i className="fa fa-print" /></button>
                <button className="btn btn-dark-custom btn-sm" onClick={downloadPdf}><i className="fa fa-download" /></button>
              </div>
              <div ref={pdfTableRef as any} style={{ fontFamily: 'Arial' }}>
                <div className="container">
                  <div className="row pt-3">
                    <div className="col-md-6">
                      {logoImage && <img src={logoImage} style={{ maxHeight: '5rem' }} alt="logo" />}
                      <div className="pt-3"><span style={{ border: '2px solid #000', borderRadius: 10, padding: 5, fontSize: 22, fontWeight: 600, color: '#000' }}>Report ID: <span style={{ color: '#294174' }}>{deviceRecord.transactionId}</span></span></div>
                    </div>
                    <div className="col-md-6 text-right">
                      <div className="border-1">
                        <span style={{ padding: 5, fontSize: 20, fontWeight: 600, color: '#294174' }}>Tested on: <span style={{ color: '#000' }}>{new Date(deviceRecord.createdAt).toLocaleString()}</span></span>
                      </div>
                      <div style={{ float: 'right', height: '9rem' }}>
                        {qrcodedata && qrCodeImageUrl && <img src={qrCodeImageUrl} alt="QR Code" />}
                      </div>
                    </div>
                  </div>

                  <hr className="print-hr" />
                  <table className="table print-table">
                    <thead>
                      <tr>
                        <th style={{ width: '20%', borderRight: '1px solid #000', fontWeight: 600 }}>Device Name</th>
                        <th style={{ width: '80%' }}><h1>{deviceRecord.modelName} {deviceRecord.storage ? `${deviceRecord.storage}GB` : ''} {deviceRecord.colorName}</h1></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><h3>IMEI Number</h3></td>
                        <td>{deviceRecord.imei}{deviceRecord.imei2 ? `, ${deviceRecord.imei2}` : ''}</td>
                      </tr>
                      <tr>
                        <td><h3>Serial Number</h3></td>
                        <td>{deviceRecord.serial}</td>
                      </tr>
                      <tr>
                        <td><h3>Battery Health</h3></td>
                        <td>{batteryInfo?.healthPercentage ? `${batteryInfo.healthPercentage}%` : '-'}</td>
                      </tr>
                      <tr>
                        <td><h3>Carrier</h3></td>
                        <td>{deviceRecord.deviceCarrier || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><h3>Version</h3></td>
                        <td>{deviceRecord.osVersion}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="table print-table2" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>{deviceRecord.os === 'ios' ? 'FMI' : 'FRP'}</th>
                        <th>{deviceRecord.os === 'ios' ? 'JAIL' : 'Rooted'}</th>
                        <th className="text-center">GRADE</th>
                        <th className="text-center">ESN</th>
                        <th className="text-center">MDM</th>
                        <th className="text-center">Data Wipe</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{deviceRecord.deviceLock || '-'}</td>
                        <td>{deviceRecord.rooted != null ? (deviceRecord.rooted === 1 ? 'Yes' : 'No') : '-'}</td>
                        <td className="text-center">{deviceRecord.grade || '-'}</td>
                        <td className="text-center">{deviceRecord.esnResponse?.status || deviceRecord.esnResponse?.Status}</td>
                        <td className="text-center">{String(deviceRecord.mdmResponse?.mdmOn) === 'true' ? 'On' : 'Off'}</td>
                        <td className="text-center">{eraseDate ? 'Yes' : 'No'}</td>
                      </tr>
                    </tbody>
                  </table>

                  {deviceRecord?.oemParts && (
                    <div>
                      <table className="table print-table2" style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '15%' }}>Part</th>
                            <th>Factory Serial Number</th>
                            <th>Current Serial Number</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deviceRecord.oemParts.map((p: any, i: number) => (
                            <tr key={i}>
                              <td className="ellipses-cell">{p.partName}</td>
                              <td className="ellipses-cell">{p.factorySerial}</td>
                              <td className="ellipses-cell">{p.currentSerial}</td>
                              <td className="ellipses-cell">{p.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div>
                    <table className="table print-table2" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Test Name</th>
                          <th>Result</th>
                          <th>Test Name</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testRecords.length > 0 ? (
                          chunkArray(testRecords, 2).map((pair, idx) => (
                            <tr key={idx}>
                              {pair.map((t, j) => (
                                <React.Fragment key={j}>
                                  <td className="bold-text">{t.name}</td>
                                  <td>{t.status === 'failed' ? <img src="/assets/img/brand/cross.png" alt="Cross" /> : <img src="/assets/img/brand/tick.png" alt="Tick" />}</td>
                                </React.Fragment>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={4}>This device has not performed any test.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ paddingBottom: 60 }}>
                    {testRecords.length > 0 ? (
                      <div>
                        <span style={{ fontWeight: 700, color: '#000', fontSize: 20, textDecoration: 'underline' }}>Diagnostic Result :</span>&nbsp;&nbsp;<span style={{ fontSize: 20, color: '#294174' }}>This device has passed {countPassed || 0} tests {countFailed ? `with ${countFailed} failures` : 'with no errors'}.</span>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontWeight: 700, color: '#000', fontSize: 20, textDecoration: 'underline' }}>Diagnostic Result :</span>&nbsp;&nbsp;<span style={{ fontSize: 20, color: '#294174' }}>This device has not Performed any test.</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
