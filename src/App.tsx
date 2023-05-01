import React, { useState, useEffect, useRef, useCallback } from 'react';
import OpenSeadragon from 'openseadragon';
import PinpointTool from './tools/PinPointTool';
import './style.css';
import { Radio, Input, Modal } from 'antd';
const { TextArea } = Input;

const EXAMPLE_IMAGE = {
  id: 'randomId',
  filePath:
    'https://www.nps.gov/common/uploads/cropped_image/primary/4103A4CA-09D3-A4DC-FF31563D33AA3D1D.jpg?width=1600&quality=90&mode=crop',
};
export const drawingToolKey = 'drawingTool';

export default function App() {
  const imgEl = useRef<HTMLImageElement>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeShape, setActiveShape] = useState<
    'dot' | 'image' | 'pin' | 'text' | undefined
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
      homeFillsViewer: true,
      gestureSettingsMouse: {
        clickToZoom: false,
      },
      gestureSettingsTouch: {
        clickToZoom: false,
      },
    });
    setViewer(openSeaDragonViewer);


    const pinpointTool = new PinpointTool(openSeaDragonViewer);
    openSeaDragonViewer.addHandler('canvas-click', function (event) {
      if (event.quick) {
        const point = event.position;
        const vp =
          openSeaDragonViewer.viewport.viewerElementToViewportCoordinates(
            point,
          );
        console.log(vp);
        const existingTool = localStorage.getItem(drawingToolKey);
        if (existingTool === 'dot') {
          //dot
        }
        if (existingTool === 'image') {
          //image
        }
        if (existingTool === 'pin') {
          //pin
          pinpointTool.setCurrentTool("pin");
        }
        if (existingTool === 'text') {
          setIsModalOpen(true);
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
  const onChangeHandler = event => {
    setInputValue(event.target.value);
  };
  const handleOk = () => {
    setInputValue('');
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setInputValue('');
    setIsModalOpen(false);
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
    <div>
      <Radio.Group
        value={activeShape}
        onChange={e =>
          e.target.value === 'stop'
            ? setShape(undefined)
            : setShape(e.target.value)
        }
      >
        <Radio.Button value="dot">Dot</Radio.Button>
        <Radio.Button value="image">Image</Radio.Button>
        <Radio.Button value="pin">Pin</Radio.Button>
        <Radio.Button value="text">Text</Radio.Button>
        <Radio.Button value="stop">STOP</Radio.Button>
      </Radio.Group>
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <TextArea
          showCount
          maxLength={100}
          style={{
            height: 120,
            width: '50%',
            resize: 'none',
          }}
          value={inputValue}
          onChange={onChangeHandler}
          placeholder="disable resize"
        />
      </Modal>
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
