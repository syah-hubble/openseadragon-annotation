import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImageAnnotator } from 'image-annotation';
import * as PDFJS from 'pdfjs-dist-es5';
import { RenderParameters } from 'pdfjs-dist-es5/types/src/display/api';
import { drawingToolKey } from 'src/constants';
import { Button, Radio } from 'antd';

const PDFViewer = (props: { pdf: PDFJS.PDFDocumentProxy }) => {
  const { pdf } = props;
  const [activeShape, setActiveShape] = useState<
    'dot' | 'freehand' | 'pin' | 'text' | undefined
  >(localStorage.getItem(drawingToolKey) as 'dot' | 'freehand');

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const setShape = useCallback(
    async (shape: 'dot' | 'freehand' | 'pin' | 'text' | undefined) => {
      shape === undefined
        ? localStorage.removeItem(drawingToolKey)
        : localStorage.setItem(drawingToolKey, shape);
      switch (shape) {
        case 'pin':
          window.dispatchEvent(
            new CustomEvent('ext-setTool', { detail: { name: 'pin', tag: 3 } }),
          );
          break;
        case 'freehand':
          window.dispatchEvent(
            new CustomEvent('ext-setTool', {
              detail: { name: 'freehand', tag: 3, strokeColor: 'blue' },
            }),
          );
          break;
        case 'text':
          window.dispatchEvent(
            new CustomEvent('ext-setTool', {
              detail: { name: 'text', fontSize: 16, fontColor: 'black' },
            }),
          );
          break;
      }

      setActiveShape(shape);
    },
    [],
  );
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
        window.addEventListener('ext-setTool', (event: any) => {
          // eslint-disable-next-line no-use-before-define
          console.log(`Received message: ${event.detail}`, event.detail);
          const toolName = event.detail.name;
          imgAnnotator.setCurrentTool(toolName, { ...event.detail });
        });

        window.addEventListener('ext-setAnnotations', () => {
          //const jsonString = jsonString;
          //const annotations = JSON.parse(jsonString);
          // imgAnnotator.setW3cAnnotations(annotations);
        });

        window.addEventListener('ext-getAnnotations', () => {
          const annotations = imgAnnotator.getW3cAnnotations();
          console.log('annotations', JSON.stringify(annotations));
        });

        window.addEventListener('ext-updateDrawing', () => {
          //test
        });

        window.addEventListener('ext-readonly', () => {
          //test
        });

        imgAnnotator.onDrawingSelected((overlayId, annotation, drawing) => {
          console.log('onDrawingSelected', overlayId, annotation, drawing);
        });

        imgAnnotator.onDrawingCreated((overlayId, annotation, drawing) => {
          console.log('onDrawingCreated', overlayId, annotation, drawing);
        });

        imgAnnotator.onDrawingDeleted((overlayId, annotation, drawing) => {
          console.log('onDrawingDeleted', overlayId, annotation, drawing);
        });
      });
    });
  }, [pdf]);

  return (
    <>
      <Radio.Group
        value={activeShape}
        onChange={e =>
          e.target.value === 'stop'
            ? setShape(undefined)
            : setShape(e.target.value)
        }
      >
        <Radio.Button value="pin">Pin</Radio.Button>
        <Radio.Button value="freehand">Freehand</Radio.Button>
        <Radio.Button value="text">Text</Radio.Button>
        <Radio.Button value="stop">STOP</Radio.Button>
      </Radio.Group>
      <Button onClick={() => void 0}>Load Annotation</Button> {activeShape}
      <div
        ref={viewerContainerRef}
        style={{
          width: '50vh',
          height: '50vh',
        }}
      />
    </>
  );
};

export default PDFViewer;
