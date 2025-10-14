declare module 'html2canvas';
declare module 'jspdf';
declare module 'qrcode';

// Minimal typing fallbacks for jspdf default export
declare module 'jspdf' {
  const jsPDF: any;
  export default jsPDF;
}
