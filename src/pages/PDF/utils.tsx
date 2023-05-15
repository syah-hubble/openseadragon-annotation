import * as PDFJS from 'pdfjs-dist-es5';

export const getFitScale = (
  pdf,
  containerRef: React.RefObject<HTMLDivElement>,
) =>
  new Promise<number>(resolve =>
    pdf.getPage(1).then(page => {
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth =
        containerRef.current!.getBoundingClientRect().width;
      console.log(containerWidth);
      const fitWidth = containerWidth - 24 * 2; // 48px padding
      const fitScale = parseFloat((fitWidth / viewport.width).toPrecision(2));
      resolve(fitScale);
    }),
  );

export const getPage = (pdf: PDFJS.PDFDocumentProxy, pageNumber: number) => {
  return pdf.getPage(pageNumber);
};
