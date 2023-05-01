import { v4 as uuidv4 } from 'uuid';
import OpenSeadragon, {   Point    } from 'openseadragon';
 
export default class DrawingTool {
  overlays;
  tool = '';
  dragging = false;
  pinching = false;  
  constructor(viewer) { 
    this.viewer = viewer;
    this.overlays = {};

    this.viewer.addHandler('canvas-drag', (event) => {
      // sometimes the finger press triggers the drag but the speed is 0
      this.dragging = event.speed > 0;
    });
  }

  setCurrentTool(tool) {
    this.tool = tool;
  }

  addDrawing(drawing, location, placement) {
    this.viewer.addOverlay({
      element: drawing.element,
      location: location,
      placement: placement,
    });

    this.overlays[drawing.id] = drawing;
  }

  drawingClicked(e, drawing) {
    Object.values(this.overlays).forEach((o) => {
      o.unselect();
    });
    drawing.select();
  }

  overlayClicked(e, element) {
    const allSelectedAnnotations = document.querySelectorAll(
      '.annotation.selected'
    );

    allSelectedAnnotations.forEach((a) => {
      a.setAttribute('class', a.getAttribute('class').replace('selected', ''));
    });

    console.log('Element clicked! ', e);
    element.setAttribute(
      'class',
      `${element.getAttribute('class') ?? ''} selected`
    );
  }

  applyDefaultMouseTracking(drawing, placement) {
    const mouseTracker = new OpenSeadragon.MouseTracker({
      element: drawing.element,
      clickHandler: (event) => this.drawingClicked(event, drawing),
      dragHandler: (event) => {
        // most likely clicked instead of drag. but this still fires
        // anyway. ignore
        if (event.speed === 0) {
          return;
        }

        if (!drawing.selected) {
          return;
        }
        console.log('overlay dragged', event);
        const position = this.viewer.viewport.windowToViewportCoordinates(
          new Point(event.originalEvent.x, event.originalEvent.y)
        );

        console.log('overlay dragged after', position.x, position.y);
        this.viewer.updateOverlay(drawing.element, position, placement);
      },
    });

    return mouseTracker;
  }

  deleteDrawing(drawing) {
    this.viewer.removeOverlay(drawing.element);
    delete this.overlays[drawing.id];
  }
}

export class Drawing {
  element;
  _editorDeleteBtn;
  id;
  selected = false;
  constructor() {
    this.id = uuidv4();
    const elt = document.createElement('div');
    elt.setAttribute('class', 'annotation');
    elt.setAttribute('id', this.id);

    const editorEle = document.createElement('div');
    editorEle.setAttribute('class', 'annotation-editor');

    this._editorDeleteBtn = document.createElement('button');
    this._editorDeleteBtn.setAttribute('class', 'delete-btn');

    editorEle.appendChild(this._editorDeleteBtn);
    elt.appendChild(editorEle);

    this.element = elt;
  }
  onDeletePress(handler) {
    new OpenSeadragon.MouseTracker({
      element: this._editorDeleteBtn,
      clickHandler: handler,
    });
  }

  unselect() {
    this.element.setAttribute(
      'class',
      this.element.getAttribute('class').replace(' selected', '')
    );
    this.selected = false;
  }
  select() {
    this.element.setAttribute(
      'class',
      `${this.element.getAttribute('class') ?? ''} selected`
    );
    this.selected = true;
  }
}
