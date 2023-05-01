import OpenSeadragon from 'openseadragon';

var svgNS = 'http://www.w3.org/2000/svg';
class Overlay {
  _viewer: OpenSeadragon.Viewer;
  _containerWidth = 0;
  _containerHeight = 0;
  _svg: Element;
  _node: Element;
  _canvas: Element;
  constructor(viewer: OpenSeadragon.Viewer) {
    this._viewer = viewer;
    this._canvas=viewer.container;
    this._svg = document.createElementNS(svgNS, 'svg');
    this._svg.style.position = 'absolute';
    this._svg.style.left = 0;
    this._svg.style.top = 0;
    this._svg.style.width = '100%';
    this._svg.style.height = '100%';
    this._viewer.canvas.appendChild(this._svg);
    this._node = document.createElementNS(svgNS, 'g');
    this._svg.appendChild(this._node);
    const that = this;

    this._viewer.addHandler('animation', function () {
      that.resize();
    });
    this._viewer.addHandler('open', function () {
      that.resize();
    });

    this._viewer.addHandler('rotate', function (evt) {
      that.resize();
    });

    this._viewer.addHandler('resize', function () {
      that.resize();
    });
  }
  getNode() {
    return this._node;
  }
  getCanvas() {
    return this._canvas;
  }
  resize() {
    if (this._containerWidth !== this._viewer.container.clientWidth) {
      this._containerWidth = this._viewer.container.clientWidth;
      this._svg.setAttribute('width', this._containerWidth.toString());
    }

    if (this._containerHeight !== this._viewer.container.clientHeight) {
      this._containerHeight = this._viewer.container.clientHeight;
      this._svg.setAttribute('height', this._containerHeight.toString());
    }

    var p = this._viewer.viewport.pixelFromPoint(
      new OpenSeadragon.Point(0, 0),
      true
    );
    var zoom = this._viewer.viewport.getZoom(true);
    var rotation = this._viewer.viewport.getRotation();
    // TODO: Expose an accessor for _containerInnerSize in the OSD API so we don't have to use the private variable.
    var scale = this._viewer.viewport.getContainerSize().x * zoom;
    this._node.setAttribute(
      'transform',
      'translate(' +
        p.x +
        ',' +
        p.y +
        ') scale(' +
        scale +
        ') rotate(' +
        rotation +
        ')'
    );
  }
  onClick(node, handler) {
    // TODO: Fast click for mobile browsers

    new OpenSeadragon.MouseTracker({
      element: node,
      clickHandler: handler,
    }).setTracking(true);
  }
}

export default Overlay;
