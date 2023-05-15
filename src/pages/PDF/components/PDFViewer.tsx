import React, { useEffect, useRef } from 'react';
import { ImageAnnotator } from 'image-annotation';
import * as PDFJS from 'pdfjs-dist-es5';
import { RenderParameters } from 'pdfjs-dist-es5/types/src/display/api';

const PDFViewer = (props: { pdf: PDFJS.PDFDocumentProxy }) => {
  const { pdf } = props;
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewerContainerRef.current) return;
    // calculate optimal zoom level to fit the page width
    // getFitScale(props.pdf, viewerContainerRef).then(() => void 0);
    pdf.getPage(1).then(page => {
      const viewport = page.getViewport({ scale: 1 });
      const outputScale = window.devicePixelRatio || 1;
      const existingCanvas =
        viewerContainerRef.current?.querySelector(`canvas#page-1`);
      if (existingCanvas) {
        existingCanvas.remove();
      }
      const canvas = document.createElement('canvas');
      canvas.setAttribute('id', 'page-1');
      canvas.setAttribute('class', 'imageLayer');
      canvas.setAttribute('data-page', '1');

      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      canvas.style.width = `${Math.floor(viewport.width)}px`;

      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

      const renderContext: RenderParameters = {
        canvasContext: canvas.getContext('2d')!,
        viewport,
        transform,
      };
      console.log(page);
      page.render(renderContext).promise.then(() => {
        console.log(renderContext);
        const imgAnnotator = new ImageAnnotator();
        console.log(imgAnnotator);
        imgAnnotator.id = 'openseadragon1';
        imgAnnotator.src = canvas.toDataURL();
        imgAnnotator.width = '100%';
        imgAnnotator.height = '100%';
        viewerContainerRef.current?.appendChild(imgAnnotator);
      });
    });
  }, [pdf]);

  return (
    <div
      ref={viewerContainerRef}
      style={{
        width: '50vh',
        height: '50vh',
      }}
    />
  );
};

export default PDFViewer;
