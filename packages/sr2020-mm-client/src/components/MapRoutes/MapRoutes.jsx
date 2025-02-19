import React from 'react';
import './MapRoutes.css';

import {
  Route,
} from 'react-router-dom';

import { CommonMap } from '../../maps/CommonMap';
import { BackgroundEditorMap } from '../../maps/BackgroundEditorMap';
import { LocationEditorMap } from '../../maps/LocationEditorMap';
import { BeaconEditorMap } from '../../maps/BeaconEditorMap';
import { RescueServiceMap } from '../../maps/RescueServiceMap';
import { ManaOceanMap } from '../../maps/ManaOceanMap';
import { AudioEngineDemo } from '../../maps/AudioEngineDemo';
import { CharacterWatcher } from '../CharacterWatcher';

import { MapsNav } from '../MapsNav';

// eslint-disable-next-line max-lines-per-function
export function MapRoutes(props) {
  const {
    gameModel, mapDefaults,
  } = props;
  const {
    backgroundEditorGeomanConfig, oldLocationAndMarkerGeomanConfig, locationsEditor2GeomanConfig, beaconEditor2GeomanConfig,
  } = mapDefaults;

  return [
    <Route path="/mapsNav" key="mapsNav">
      <MapsNav />
    </Route>,
    <Route path="/map2" key="map2">
      <CommonMap
        gameModel={gameModel}
        geomanConfig={oldLocationAndMarkerGeomanConfig}
      />
    </Route>,
    <Route path="/locationsEditor2" key="locationsEditor2">
      <LocationEditorMap
        gameModel={gameModel}
        geomanConfig={locationsEditor2GeomanConfig}
      />
    </Route>,
    <Route path="/beaconEditor2" key="beaconEditor2">
      <BeaconEditorMap
        gameModel={gameModel}
        geomanConfig={beaconEditor2GeomanConfig}
      />
    </Route>,
    <Route path="/backgroundEditorMap" key="backgroundEditorMap">
      <BackgroundEditorMap
        gameModel={gameModel}
        geomanConfig={backgroundEditorGeomanConfig}
      />
    </Route>,
    <Route path="/rescueService" key="rescueService">
      <RescueServiceMap
        gameModel={gameModel}
      />
    </Route>,
    <Route path="/manaOcean" key="manaOcean">
      <ManaOceanMap
        gameModel={gameModel}
      />
    </Route>,
    <Route path="/audioEngineDemo" key="audioEngineDemo">
      <CharacterWatcher gameModel={gameModel}>
        <AudioEngineDemo
          gameModel={gameModel}
        />
      </CharacterWatcher>
    </Route>,
  ];
}
