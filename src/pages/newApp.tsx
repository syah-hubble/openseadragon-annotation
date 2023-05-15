import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ImageAnnotator } from 'image-annotation';

import { Badge, Button, Radio } from 'antd';
import { drawingToolKey } from '../constants';

const EXAMPLE_IMAGE = {
  id: 'randomId',
  filePath:
    'https://www.csustan.edu/sites/default/files/DIRECTORIES/Maps_n_Plans/Campus_Plans/Building/floor_plans/007-Theatre/theatre-lrg-1flr-2022.jpg',
};

export default function App() {
  const imgEl = useRef<HTMLDivElement>(null);
  const [activeShape, setActiveShape] = useState<
    'dot' | 'freehand' | 'pin' | 'text' | undefined
  >(localStorage.getItem(drawingToolKey) as 'dot' | 'freehand');

  const imagesJson = localStorage.getItem('imagesJson');
  const images = imagesJson ? JSON.parse(imagesJson) : [EXAMPLE_IMAGE];

  const initOpenseadragon = () => {
    localStorage.removeItem(drawingToolKey);
    const imgAnnotator = new ImageAnnotator();
    console.log(imgAnnotator);
    imgAnnotator.id = 'openseadragon1';
    imgAnnotator.src = images[0].filePath;
    imgAnnotator.width = '768px';
    imgAnnotator.height = '768px';
    imgEl && imgEl.current?.appendChild(imgAnnotator);

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
  };

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
    if (imgEl.current) {
      initOpenseadragon();
    }
  }, [imgEl]);
  return (
    <div>
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
        style={{
          width: '768px',
          height: '768px',
        }}
      >
        <Badge.Ribbon
          text={activeShape}
          style={{
            padding: 15,
            display: activeShape ? 'inherit' : 'none',
          }}
        >
          <div
            ref={imgEl}
            style={{
              width: '768px',
              height: '768px',
            }}
          />
        </Badge.Ribbon>
      </div>
    </div>
  );
}
