import React, { useEffect, useState } from 'react';
import * as PDFJS from 'pdfjs-dist-es5';
import pdfjsWorker from 'pdfjs-dist-es5/build/pdf.worker.entry';
import PDFViewer from './components/PDFViewer';

if (typeof window !== 'undefined' && 'Worker' in window) {
  PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}
const PDFPage = () => {
  const [pdf, setPdf] = useState<PDFJS.PDFDocumentProxy>();
  const url = './assets/HAMLET.pdf';
  // Load PDF on mount
  useEffect(() => {
    PDFJS.getDocument(url).promise.then(
      pdf => {
        setPdf(pdf);
      },
      error => console.error(error),
    );
  }, []);

  return pdf === undefined ? <div>oiiiii</div> : <PDFViewer pdf={pdf} />;
};

export default PDFPage;
