import React, { useState, useEffect, useRef, useCallback } from 'react';
import OpenSeadragon from 'openseadragon';
import * as d3 from 'd3';
import './style.css';
import Overlay from './utils';
import { Radio } from 'antd';
const EXAMPLE_IMAGE = {
  id: 'randomId',
  filePath:
    'https://www.nps.gov/common/uploads/cropped_image/primary/4103A4CA-09D3-A4DC-FF31563D33AA3D1D.jpg?width=1600&quality=90&mode=crop',
};
export const drawingToolKey = 'drawingTool';

export default function App() {
  const imgEl = useRef<HTMLImageElement>(null);
  const [activeShape, setActiveShape] = useState<
    'dot' | 'image' | 'pin' | undefined
  >(localStorage.getItem(drawingToolKey) as 'dot' | 'image');
  const [viewer, setViewer] = useState<any>(null);
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
      maxZoomLevel: 7,
      visibilityRatio: 1,
      zoomPerScroll: 2,
      defaultZoomLevel: 1,
      zoomPerClick: 1,
    });
    setViewer(openSeaDragonViewer);

    const overlay = new Overlay(openSeaDragonViewer);

    openSeaDragonViewer.addHandler('canvas-click', function (event) {
      if (event.quick) {
        var point = event.position;
        var vp =
          openSeaDragonViewer.viewport.viewerElementToViewportCoordinates(
            point
          );
        console.log(vp);
        const existingTool = localStorage.getItem(drawingToolKey);
        if (existingTool === 'dot') {
          d3.select(overlay.getNode())
            .append('circle')
            .style('fill', '#f00')
            .attr('cx', vp.x)
            .attr('cy', vp.y)
            .attr('r', 0.02)
            .style('opacity', 1);
        }
        if (existingTool === 'image') {
          d3.select(overlay.getNode())
            .append('image')
            .attr(
              'xlink:href',
              'https://m.media-amazon.com/images/I/41Bk064aTrL.jpg'
            )
            .attr('width', 0.1)
            .attr('height', 0.1)
            .attr('x', vp.x)
            .attr('y', vp.y);
        }
        if (existingTool === 'pin') {
          d3.select(overlay.getNode())
            .append('path')
            .attr(
              'd',
              'M356.36,202.77c-3.45,201.59-303.3,201.56-306.72,0C53.09,1.19,352.94,1.22,356.36,202.77Z'
            )
            .attr('class', 'a9s-outer')
            .attr('x', vp.x)
            .attr('y', vp.y)
            .size(47);
        }
      }
    });
    return () => openSeaDragonViewer.destroy();
  };
  const setShape = useCallback(async (shape: 'dot' | 'image' | undefined) => {
    shape === undefined
      ? localStorage.removeItem(drawingToolKey)
      : localStorage.setItem(drawingToolKey, shape);
    setActiveShape(shape);
  }, []);

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
    <div>
      <Radio.Group
        value={activeShape}
        onChange={(e) =>
          e.target.value === 'stop'
            ? setShape(undefined)
            : setShape(e.target.value)
        }
      >
        <Radio.Button value="dot">Dot</Radio.Button>
        <Radio.Button value="image">Image</Radio.Button>
        <Radio.Button value="pin">Pin</Radio.Button>
        <Radio.Button value="stop">STOP</Radio.Button>
      </Radio.Group>
      {activeShape}
      <div
        id="openseadragon1"
        className="tutu"
        ref={imgEl}
        style={{
          width: '80vw',
          height: '80vh',
        }}
      ></div>
    </div>
  );
}
