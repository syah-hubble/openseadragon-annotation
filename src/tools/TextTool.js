import OpenSeadragon, {  Placement, Point, Rect } from 'openseadragon';
import DrawingTool, { Drawing } from './DrawingTool';
import { drawingToolKey } from '../constants';

export default class TextTool extends DrawingTool {
  fontSize = 20;
  fontColor = 'black';

  constructor(viewer) {
    super(viewer);

    this.viewer.addHandler('canvas-pinch', () => {
      this.pinching = true;
    });

    viewer.addHandler('canvas-click', (event) => {
      console.log('canvas-click', event, event.quick);
      const existingTool = localStorage.getItem(drawingToolKey);
      if (existingTool!== 'text') {
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

      var text = new Text(this.fontSize, this.fontColor);

      text.onDeletePress(() => {
        this.deleteDrawing(text);
      });

      this.addDrawing(text, viewportPoint, Placement.CENTER);

      const mouseTracker = this.applyDefaultMouseTracking(
        text,
        Placement.CENTER
      );
      mouseTracker.pressHandler = () => {
        text.focus();
      };

      text.onLeftDragged((event) => {
        // calculate new width and position of overlay based on left handle drag

        const newPosition = viewer.viewport.windowToViewportCoordinates(
          new OpenSeadragon.Point(
            event.originalEvent.x,
            text._input.clientHeight
          )
        );

        const overlay = viewer.getOverlayById(text.element);
        const overlayBounds = overlay.getBounds(viewer.viewport);

        const newWidth =
          overlayBounds.width + (overlayBounds.x - newPosition.x);

        const newHeight = newPosition.y;
        if (newWidth < 0) {
          return;
        }
        viewer.updateOverlay(
          text.element,
          new Rect(newPosition.x, overlayBounds.y, newWidth, newHeight)
        );
      });

      text.onRightDragged((event) => {
        // calculate new width and position of overlay based on left handle drag

        console.log('rightDragged', text._input.clientHeight);
        const newPosition = viewer.viewport.windowToViewportCoordinates(
          new OpenSeadragon.Point(
            event.originalEvent.x,
            text._input.clientHeight
          )
        );

        const overlay = viewer.getOverlayById(text.element);
        const overlayBounds = overlay.getBounds(viewer.viewport);

        const newWidth =
          overlayBounds.width +
          (newPosition.x - (overlayBounds.x + overlayBounds.width));

        const newHeight = newPosition.y;
        if (newWidth < 0) {
          return;
        }
        viewer.updateOverlay(
          text.element,
          new Rect(overlayBounds.x, overlayBounds.y, newWidth, newHeight)
        );
      });

      text.onKey(() => {
        //clear the height calculated by the dragging
        text.element.style.height = 'auto';
      });
      // mouseTracker.releaseHandler = (event) => {
      //   console.log("release");
      //   text.setEditable(false);
      // };
      //focus automatically
      text.focus();
      this.tool = null;
    });

    viewer.addHandler('zoom', (event) => {
      if (!this.overlays) {
        return;
      }
      const zoom = event.zoom;
      const containerWidth = viewer.viewport.getContainerSize().x;

      const scale = (zoom * containerWidth) / viewer.world.getContentFactor();
      Object.values(this.overlays).forEach((o) => {
        o.scale(scale);
      });
    });
  }
  setCurrentTool(tool, fontSize, fontColor) {
    this.tool = tool;
    this.fontSize = fontSize;
    this.fontColor = fontColor;
  }
}

export class Text extends Drawing {
  _input;
  _span;
  constructor(fontSize, fontColor) {
    super();

    this.element.classList.add('text');

    this._input = document.createElement('div');
    this._input.style.color = fontColor;
    this._input.style.fontSize = fontSize;
    this._input.setAttribute('contentEditable', 'true');

    this._input.setAttribute('tabindex', 0);
    this._input.setAttribute('class', 'text-input');
    this._input.addEventListener('focusout', () => {
      this.setEditable(false);
      this.unselect();
    });

    this._leftHandle = document.createElement('div');
    this._leftHandle.classList.add('left-handle');
    this._rightHandle = document.createElement('div');
    this._rightHandle.classList.add('right-handle');
    this.element.append(this._leftHandle);
    this.element.append(this._rightHandle);

    // this._span = document.createElement("span");
    // this._span.style.display = "none";

    this.element.appendChild(this._input);
  }
  focus() {
    this._input.focus();
  }
  setEditable(editable) {
    this._input.setAttribute('disabled', editable);
  }

  onKey(handler) {
    new OpenSeadragon.MouseTracker({
      element: this._input,
      keyHandler: handler,
    });
  }

  onLeftDragged(handler) {
    new OpenSeadragon.MouseTracker({
      element: this._leftHandle,
      dragHandler: handler,
    });
  }
  onRightDragged(handler) {
    new OpenSeadragon.MouseTracker({
      element: this._rightHandle,
      dragHandler: handler,
    });
  }
  scale(scale) {
    this.element.style.transform = `scale(${scale})`;
    this.element.style.transformOrigin = 'center';
  }
}
