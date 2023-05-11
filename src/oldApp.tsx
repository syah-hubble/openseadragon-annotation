import React, { useState, useEffect, useRef, useCallback } from 'react';
import OpenSeadragon, { Placement, Point } from 'openseadragon';
import OpenSeadragonViewerInputHook from '@openseadragon-imaging/openseadragon-viewerinputhook';

import PinpointTool, { Pinpoint } from './tools/PinPointTool';
import FreehandToll from './tools/FreehandTool';
import TextTool from './tools/TextTool';
import './style.css';
import { Badge, Button, Radio } from 'antd';
import { annotationData, drawingToolKey } from './constants';

const EXAMPLE_IMAGE = {
  id: 'randomId',
  filePath:
    'https://www.csustan.edu/sites/default/files/DIRECTORIES/Maps_n_Plans/Campus_Plans/Building/floor_plans/007-Theatre/theatre-lrg-1flr-2022.jpg',
};

export default function App() {
  const imgEl = useRef<HTMLImageElement>(null);

  const [activeShape, setActiveShape] = useState<
    'dot' | 'freehand' | 'pin' | 'text' | undefined
  >(localStorage.getItem(drawingToolKey) as 'dot' | 'freehand');
  const [viewer, setViewer] = useState<OpenSeadragon.Viewer | null>(null);
  const imagesJson = localStorage.getItem('imagesJson');
  const images = imagesJson ? JSON.parse(imagesJson) : [EXAMPLE_IMAGE];

  const initOpenseadragon = () => {
    viewer && viewer.destroy();
    const openSeaDragonViewer = OpenSeadragon({
      id: 'openseadragon1',
      animationTime: 0.5,
      blendTime: 0.1,
      constrainDuringPan: true,
      maxZoomPixelRatio: 2,
      minZoomLevel: 1,
      maxZoomLevel: 7,
      visibilityRatio: 1,
      zoomPerScroll: 2,
      defaultZoomLevel: 1,
      zoomPerClick: 1,
      homeFillsViewer: true,
      gestureSettingsMouse: {
        clickToZoom: false,
      },
      gestureSettingsTouch: {
        clickToZoom: false,
      },
    });
    setViewer(openSeaDragonViewer);

    new OpenSeadragonViewerInputHook({
      viewer: openSeaDragonViewer,
      hooks: [
        { tracker: 'viewer', handler: 'keyHandler', hookHandler: onViewerKey },
        {
          tracker: 'viewer',
          handler: 'keyUpHandler',
          hookHandler: onViewerKey,
        },
        {
          tracker: 'viewer',
          handler: 'keyDownHandler',
          hookHandler: onViewerKey,
        },
      ],
    });
    function onViewerKey(event) {
      event.stopHandlers = true;
      event.preventDefaultAction = true;
    }
    let minZoomLevel;
    // get the default zoom  level
    openSeaDragonViewer.addHandler('open', function () {
      // get the min zoom level
      minZoomLevel = openSeaDragonViewer.viewport.getZoom();
    });

    openSeaDragonViewer.addHandler('zoom', function (event) {
      // zoom happening beyond the minZoomLevel,
      // overwrite the zoom level
      if (event.zoom < minZoomLevel) {
        openSeaDragonViewer.viewport.zoomTo(minZoomLevel);
      }
    });
    const pinpointTool = new PinpointTool(openSeaDragonViewer);
    const textTool = new TextTool(openSeaDragonViewer);
    const freehandTool = new FreehandToll(openSeaDragonViewer);
    pinpointTool.setCurrentTool('pin');
    freehandTool.setCurrentTool('freehand');
    textTool.setCurrentTool('text', 12, 'green');

    return () => openSeaDragonViewer.destroy();
  };
  const setShape = useCallback(
    async (shape: 'dot' | 'freehand' | undefined) => {
      shape === undefined
        ? localStorage.removeItem(drawingToolKey)
        : localStorage.setItem(drawingToolKey, shape);

      setActiveShape(shape);
    },
    [],
  );

  const onLoadAnnotation = async () => {
    if (viewer) {
      viewer.viewport.goHome(true);
      console.log(annotationData);
      annotationData.forEach(data => {
        const pinpoint = new Pinpoint(1);

        pinpoint.onDeletePress(() => {
          viewer.removeOverlay(pinpoint.element);
        });
        const viewportPoint = viewer.viewport.windowToViewportCoordinates(
          new Point(data.x, data.y),
        );

        viewer.addOverlay({
          element: pinpoint.element,
          location: viewportPoint,
          placement: Placement.CENTER,
        });
      });
    }
  };

  useEffect(() => {
    initOpenseadragon();
  }, []);
  useEffect(() => {
    if (images && viewer) {
      viewer.open({
        type: 'image',
        url: images[0].filePath,
      });
    }
  }, [images, viewer]);
  return (
    <div
      style={{
        width: '768px',
        height: '768px',
      }}
    >
      <Radio.Group
        value={activeShape}
        onChange={e =>
          e.target.value === 'stop'
            ? setShape(undefined)
            : setShape(e.target.value)
        }
      >
        <Radio.Button value="dot">Dot</Radio.Button>
        <Radio.Button value="freehand">Freehand</Radio.Button>
        <Radio.Button value="pin">Pin</Radio.Button>
        <Radio.Button value="text">Text</Radio.Button>
        <Radio.Button value="stop">STOP</Radio.Button>
      </Radio.Group>
      <Button onClick={() => onLoadAnnotation()}>Load Annotation</Button>
      <div
        style={{
          height: '10vh',
        }}
      />

      <Badge.Ribbon
        text={activeShape}
        style={{
          padding: 15,
          display: activeShape ? 'inherit' : 'none',
        }}
      >
        <div
          id="openseadragon1"
          className="tutu"
          ref={imgEl}
          style={{
            width: '768px',
            height: '768px',
          }}
        ></div>
      </Badge.Ribbon>
    </div>
  );
}
