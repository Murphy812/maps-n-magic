import { Migrator } from './Migrator';

import { UserService } from '../../services/UserService';
import { BotService } from '../../services/BotService/BotService';
import { TickerService } from '../../services/TickerService';
import { SpiritService } from '../../services/SpiritService';
import { SoundService2 } from '../../services/SoundService2';
import { SoundStageService } from '../../services/SoundStageService';
import { BeaconService } from '../../services/BeaconService';
import { LocationService } from '../../services/LocationService';
import { LocationRecordService } from '../../services/LocationRecordService';
import { SoundMappingService } from '../../services/SoundMappingService';
import { UserWatcher } from '../../services/UserWatcher';
import { BaseVersion } from '../../services/BaseVersion';
import { BeaconRecordService } from '../../services/BeaconRecordService';
import { NotificationService } from '../../services/NotificationService';
import { BackgroundImageService } from '../../services/BackgroundImageService';
import { CharacterHealthStateService } from '../../services/CharacterHealthStateService';
import { UserRecordService } from '../../services/UserRecordService';
// import { ManaOceanSettingsService } from '../../services/ManaOceanSettingsService';
import { SettingsService } from '../../services/SettingsService';
import { ManaOceanEnableService } from '../../services/ManaOceanEnableService';
import { ClientEventStubService } from '../../services/ClientEventStubService';
import { CharacterWatchService } from '../../services/CharacterWatchService';

import { fillGameModelWithBots } from './GameModelFiller';
import { CrudDataManager } from '../../dataManagers/CrudDataManager';
import { LocationDataManager } from '../../dataManagers/LocationDataManager';
import { ReadDataManager } from '../../dataManagers/ReadDataManager';
// import { SettingsDataManager } from '../../dataManagers/SettingsDataManagers';
import { SingleReadStrategy } from '../../dataManagers/SingleReadStrategy';
import { PollingReadStrategy } from '../../dataManagers/PollingReadStrategy';
import { DataBinding } from '../../dataManagers/DataBinding';
import { WsDataBinding } from '../../dataManagers/WsDataBinding';

import {
  RemoteLocationRecordProvider as LocationRecordProvider,
  RemoteBeaconRecordProvider as BeaconRecordProvider,
  RemoteUsersRecordProvider as UserRecordProvider,
  ManaOceanSettingsProvider,
} from '../../api/position';

import { WSConnector } from '../../api/wsConnection';

import { EventEngine } from '../../core/EventEngine';

const services = [
  UserService,
  BotService,
  TickerService,
  SpiritService,
  SoundService2,
  SoundStageService,
  BeaconService,
  LocationService,
  LocationRecordService,
  SoundMappingService,
  UserWatcher,
  BaseVersion,
  BeaconRecordService,
  NotificationService,
  BackgroundImageService,
  CharacterHealthStateService,
  UserRecordService,
  // ManaOceanSettingsService,
  SettingsService,
  ManaOceanEnableService,
  ClientEventStubService,
  CharacterWatchService,
];

export function makeGameModel(database) {
  const gameServer = new EventEngine(services, console, Migrator);
  gameServer.setData(database);
  const gameModel = gameServer.getGameModel();
  fillGameModelWithBots(gameModel);

  const wsConnection = new WSConnector(gameModel);

  // gameServer.addDataBinding(new DataBinding({
  //   gameModel,
  //   entityName: 'beaconRecord',
  //   DataProvider: BeaconRecordProvider,
  //   DataManager: CrudDataManager,
  //   ReadStrategy: PollingReadStrategy,
  //   ReadStrategyArgs: [15000],
  // }));
  // gameServer.addDataBinding(new DataBinding({
  //   gameModel,
  //   entityName: 'locationRecord',
  //   DataProvider: LocationRecordProvider,
  //   DataManager: LocationDataManager,
  //   ReadStrategy: PollingReadStrategy,
  //   ReadStrategyArgs: [15000],
  // }));
  gameServer.addDataBinding(new DataBinding({
    gameModel,
    entityName: 'userRecord',
    DataProvider: UserRecordProvider,
    DataManager: ReadDataManager,
    ReadStrategy: PollingReadStrategy,
    ReadStrategyArgs: [15000, 'reloadUserRecords'],
  }));
  gameServer.addDataBinding(new WsDataBinding({
    gameModel, wsConnection,
  }));
  // gameServer.addDataBinding(new DataBinding({
  //   gameModel,
  //   entityName: 'manaOceanSettings',
  //   DataProvider: ManaOceanSettingsProvider,
  //   DataManager: SettingsDataManager,
  //   ReadStrategy: PollingReadStrategy,
  //   ReadStrategyArgs: [15000],
  // }));
  return { gameModel, gameServer };
}
