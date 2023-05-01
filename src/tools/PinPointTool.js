import  {   Placement, Point    } from 'openseadragon';
import DrawingTool, { Drawing } from './DrawingTool';
 
const pin = "https://res.cloudinary.com/shangyilim/image/upload/v1682511949/pin.png";

export default class PinpointTool extends DrawingTool {
  constructor(viewer) {
    super(viewer);

 
    viewer.addHandler('canvas-click', (event) => {
      console.log('canvas-click', event, event.quick);
      if (this.tool !== 'pin') {
        return;
      }

      if (this.pinching) {
        this.pinching = false;
        return;
      }
      if (this.dragging) {
        this.dragging = false;
        return;
      }

      this.viewer.panHorizontal = true;
      this.viewer.panVertical = true;

      const viewportPoint = viewer.viewport.windowToViewportCoordinates(
        new Point(event.position.x, event.position.y)
      );

      var pinpoint = new Pinpoint(1);

      pinpoint.onDeletePress(() => {
        this.deleteDrawing(pinpoint);
      });

      this.addDrawing(pinpoint, viewportPoint, Placement.BOTTOM);

      this.applyDefaultMouseTracking(pinpoint, Placement.BOTTOM);
    });
  }
}

export class Pinpoint extends Drawing {
  constructor(tag) {
    super();
 
    const img = document.createElement('img');
    img.setAttribute('src', pin);
    img.setAttribute('width', 33);
    img.setAttribute('height', 45);

    this.element.appendChild(img);

    var pinNumberEle = document.createElement('div');
    pinNumberEle.setAttribute('class', 'pinpoint-number');
    pinNumberEle.innerHTML = tag;
    this.element.appendChild(pinNumberEle);
  }
}
