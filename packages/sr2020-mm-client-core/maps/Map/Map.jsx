// eslint-disable-next-line max-classes-per-file
import React, { Component } from 'react';
import * as R from 'ramda';

// import '../../../utils/gpxConverter';

import L from 'leaflet/dist/leaflet-src';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { EventEmitter } from 'events';

// import { Map2PropTypes } from '../../../types';

import { applyLeafletGeomanTranslation, getZoomTranslation } from 'sr2020-mm-translations/leaflet';

// eslint-disable-next-line import/extensions
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.js';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';

import './Map.css';

// console.log(L);
L.Icon.Default.imagePath = './images/leafletImages/';

export class Map extends Component {
  // static propTypes = Map2PropTypes;

  constructor(props) {
    super(props);
    this.state = {
      map: null,
    };
    this.openPopup = this.openPopup.bind(this);
    this.closePopup = this.closePopup.bind(this);
    this.setLayersMeta = this.setLayersMeta.bind(this);
    this.removeLayersMeta = this.removeLayersMeta.bind(this);
    this.addToMap = this.addToMap.bind(this);
  }

  // eslint-disable-next-line max-lines-per-function
  componentDidMount() {
    const {
      geomanConfig, defaultCenter, defaultZoom,
    } = this.props;

    this.layerCommunicator = new EventEmitter();

    this.map = L.map(this.mapEl, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false,
    });

    L.control.zoom({
      ...getZoomTranslation(),
      position: 'topleft',
    }).addTo(this.map);

    this.layerControl = L.control.layers();
    this.layerControl.addTo(this.map);

    if (geomanConfig) {
      this.map.pm.addControls(geomanConfig);
      applyLeafletGeomanTranslation(this.map);
      // applyZoomTranslation(this.map);

      this.map.on('pm:create', this.onCreateLayer);
      this.map.on('pm:remove', this.onRemoveLayer);
    }

    this.setState({
      map: this.map,
    });

    this.communicatorSubscribe('on');

    // Interesting object which can be used to draw position with arrow
    // L.Control.Locate.prototype.options.compassClass

    // this.map.pm.toggleGlobalDragMode();
  }

  componentDidUpdate(prevProps) {
    const {
      translator, defaultCenter,
    } = this.props;
    if (prevProps.translator !== translator) {
      this.map.panTo(translator.getVirtualCenter() || defaultCenter);
      console.log('position changed');
    }
    // console.log('Map did update');
  }

  componentWillUnmount() {
    this.communicatorSubscribe('off');
  }

  onCreateLayer = (event) => {
    this.layerCommunicator.emit('onCreateLayer', event);
  }

  onRemoveLayer = (event) => {
    this.layerCommunicator.emit('onRemoveLayer', event);
  }

  setLayersMeta({ layersMeta, enableByDefault }) {
    const { t } = this.props;
    if (enableByDefault) {
      Object.values(layersMeta).forEach((group) => group.addTo(this.map));
    }
    Object.entries(layersMeta).forEach(([nameKey, group]) => {
      this.layerControl.addOverlay(group, t(nameKey));
    });
  }

  removeLayersMeta({ layersMeta }) {
    // const { t } = this.props;
    // if (enableByDefault) {
    Object.values(layersMeta).forEach((group) => group.remove());
    // }
    Object.entries(layersMeta).forEach(([nameKey, group]) => {
      this.layerControl.removeLayer(group);
    });
  }

  communicatorSubscribe(action) {
    this.layerCommunicator[action]('openPopup', this.openPopup);
    this.layerCommunicator[action]('closePopup', this.closePopup);
    this.layerCommunicator[action]('setLayersMeta', this.setLayersMeta);
    this.layerCommunicator[action]('removeLayersMeta', this.removeLayersMeta);
    this.layerCommunicator[action]('addToMap', this.addToMap);
  }

  openPopup({ popup }) {
    popup.openOn(this.map);
  }

  addToMap({ control }) {
    control.addTo(this.map);
  }

  closePopup() {
    this.map.closePopup();
  }

  render() {
    const { map } = this.state;

    const {
      children, commonPropsExtension = {}, translator,
    } = this.props;

    const mapProps = {
      layerCommunicator: this.layerCommunicator,
      translator,
      ...commonPropsExtension,
    };

    return (
      <>
        <div
          className="Map tw-h-full"
          ref={(map2) => (this.mapEl = map2)}
        />
        {map && React.Children.map(children, (child) => React.cloneElement(child, {
          ...mapProps,
        }))}
      </>
    );
  }
}
