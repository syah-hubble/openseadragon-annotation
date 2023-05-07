import { SVG } from '@svgdotjs/svg.js';
import   {   Placement, Point } from 'openseadragon';
import DrawingTool, { Drawing } from './DrawingTool';
import { drawingToolKey } from '../constants';

export default class FreehandTool extends DrawingTool {
  isDrawing = false;
  svgContainer = null;
  svg = null;
  path = null;
  canvasStartingPosition = null;
  strokeColor = 'yellow';
  strokeWidth = 5;

  constructor(viewer) {
    super(viewer);

    let drawing = null;
    // Pen down - Start drawing
    viewer.addHandler('canvas-click ', (event) => {
      console.log('canvas-click');
      drawing = this.startDrawing(event);
    });

    //Pen down - Drawing
    viewer.addHandler('canvas-drag', (event) => {
      console.log('canvas-dragged', event);
      // for touch devices
      if (event.pointerType === 'touch' && !event.speed && !this.isDrawing) {
        drawing = this.startDrawing(event);
        return;
      }
      if (event.pointerType === 'mouse' && !event.speed && !this.isDrawing) {
        drawing = this.startDrawing(event);
        return;
      }
      if (!this.isDrawing) {
        return;
      }
      var currentPoint = {
        x: event.originalEvent.x,
        y: event.originalEvent.y,
      };

      drawing.addLineSegment(currentPoint.x, currentPoint.y);

      viewer.updateOverlay(drawing.element, this.canvasStartingPosition);
    });
    // Pen Up - complete drawing
    viewer.addHandler('canvas-release', () => {
      if (!this.isDrawing) {
        return;
      }

      const pathBBox = drawing.getBBox();
      // remove the excess canvas after drawing
      drawing.finalizeDrawing();

      // In order to ensure its scaled properly, the placement must be marked
      // PLACEMENT.CENTER. Recalculation of the position has to be done since the
      // position was calculated with PLACEMENT.TOP_LEFT

      const recalculatedCenterPosition = {
        x: pathBBox.x + pathBBox.width / 2,
        y: pathBBox.y + pathBBox.height / 2,
      };
      const startDrawingViewportPosition =
        viewer.viewport.windowToViewportCoordinates(
          new Point(recalculatedCenterPosition.x, recalculatedCenterPosition.y)
        );
      viewer.updateOverlay(
        drawing.element,
        new Point(
          startDrawingViewportPosition.x,
          startDrawingViewportPosition.y
        ),
        Placement.CENTER
      );

      super.applyDefaultMouseTracking(drawing);

      this.isDrawing = false;
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

  startDrawing(event) {
    const existingTool = localStorage.getItem(drawingToolKey);
    if (existingTool !== 'freehand') {
      return;
    }

    this.canvasStartingPosition = this.viewer.viewport.pointFromPixel(
      new Point(0, 0)
    );
    const freehand = new Freehand(this.strokeWidth, this.strokeColor);
    freehand.onDeletePress(() => {
      this.deleteDrawing(freehand);
    });

    // this covers the entire screen with a overlay so you can draw
    // anywhere on the current viewport
    freehand.startDrawing(
      this.viewer.viewport.getContainerSize().x,
      this.viewer.viewport.getContainerSize().y,
      event.originalEvent.x,
      event.originalEvent.y
    );

    this.addDrawing(freehand, this.canvasStartingPosition, Placement.TOP_LEFT);

    this.isDrawing = true;
    this.viewer.panHorizontal = false;
    this.viewer.panVertical = false;

    return freehand;
  }
}

export class Freehand extends Drawing {
  _svg;
  _path;
  _strokeWidth;
  _strokeColor;
  _previousPoint;
  constructor(strokeWidth, strokeColor) {
    super();

    this._strokeWidth = strokeWidth;
    this._strokeColor = strokeColor;
  }
  startDrawing(width, height, startingX, startingY) {
    this._previousPoint = {
      x: startingX,
      y: startingY,
    };

    // Create SVG element for drawing
    this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._svg.setAttribute('width', width);
    this._svg.setAttribute('height', height);

    // Create path element for drawing
    this._path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this._path.setAttribute('stroke', this._strokeColor);
    this._path.setAttribute('stroke-width', this._strokeWidth.toString());
    this._path.setAttribute('fill', 'none');
    this._path.setAttribute('d', 'M ' + startingX + ',' + startingY);
    this._svg.appendChild(this._path);
    this.element.appendChild(this._svg);
  }
  addLineSegment(currentX, currentY) {
    // Build the new line segment
    const newLineSegment = `M ${this._previousPoint.x},${this._previousPoint.y} L ${currentX},${currentY}`;

    // Add the new line segment to the path element
    this._path.setAttribute('d', this._path.getAttribute('d') + newLineSegment);

    this._previousPoint.x = currentX;
    this._previousPoint.y = currentY;
  }
  getBBox() {
    return this._path.getBBox();
  }
  finalizeDrawing() {
    // Calculate the bounding box of the path
    const pathBBox = this._path.getBBox();

    this._svg.setAttribute('width', pathBBox.width + this._strokeWidth * 2);
    this._svg.setAttribute('height', pathBBox.height + this._strokeWidth * 2);

    const d = this._path.getAttribute('d');
    // The current position of the paths are based on the full screen SVG.
    // So use SVGJS to help re-calculate the position of all points to ensure
    // all points fit within view
    const tempSVG = SVG()
      .path(d)
      // code smell: unknown 2 pixels accounting for drifting pixels
      .move(this._strokeWidth, this._strokeWidth + 2.1);

    const adjustedPathData = tempSVG.node.getAttribute('d');
    this._path.setAttribute('d', adjustedPathData);

    document.querySelector('body > svg').remove();
  }
  scale(scale) {
    this._svg.setAttribute('transform', `scale(${scale})`);
    this._svg.setAttribute('transform-origin', `center`);

    const editor = this.element.querySelector('.annotation-editor');
    editor.style.position = 'absolute';
    editor.style.width = `${this._svg.getAttribute('width')}px`;
    editor.style.height = `${this._svg.getAttribute('width')}px`;
    editor.style.transform = `scale(${scale})`;
    editor.style.transformOrigin = 'center';

    const deleteBtn = this.element.querySelector('.delete-btn');
    deleteBtn.style.transform = `scale(${1 / scale})`;
    deleteBtn.style.transformOrigin = 'center';
  }
}
