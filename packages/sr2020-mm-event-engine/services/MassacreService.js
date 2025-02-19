import * as R from 'ramda';

import { AbstractService } from '../core/AbstractService';

export class MassacreService extends AbstractService {
  metadata = {
    actions: ['onCharHealthUpdateReceived'],
    requests: [],
    emitEvents: ['massacreTriggered'],
    listenEvents: ['characterHealthStateChanged'],
  };

  constructor(...args) {
    super(...args);
    this.characterHealthStats = {};
    this.onCharHealthChanged = this.onCharHealthChanged.bind(this);
  }

  init(...args) {
    super.init(...args);
    this.on('characterHealthStateChanged', this.onCharHealthChanged);
  }

  dispose() {
    this.off('characterHealthStateChanged', this.onCharHealthChanged);
  }

  onCharHealthChanged(data) {
    // this.logger.info('massacre service', data);
    const { characterId, characterHealthState } = data;
    const { locationId, healthState, timestamp } = characterHealthState;
    if (healthState !== 'wounded') {
      return;
    }
    if (!locationId) {
      this.logger.info(`Character is wounded in unknown location, characterId: ${characterId}`);
      return;
    }
    this.logger.info('massacre service', characterId, locationId, healthState, timestamp);
    let locationList = this.characterHealthStats[locationId];
    if (!locationList) {
      locationList = [];
    }

    const massacreTimeWindow = 60000 * 5; // 5 min
    const windowStart = timestamp - massacreTimeWindow;
    locationList = locationList.filter((el) => el > windowStart);
    locationList.push(timestamp);

    if (locationList.length >= 5) {
      locationList = locationList.slice(5);
      this.emit('massacreTriggered', {
        type: 'massacreTriggered',
        locationId,
        timestamp,
      });
      this.logger.info(`massacre detected, locationId ${locationId}`);
    }

    this.characterHealthStats[locationId] = locationList;
    // this.logger.info('characterHealthStats', JSON.stringify(this.characterHealthStats, null, '  '));
    this.logger.info('characterHealthStats', this.characterHealthStats);

    // massacre service {
    //   type: 'characterHealthStateChanged',
    //   characterId: 10201,
    //   characterHealthState: {
    //     locationId: 3061,
    //     locationLabel: 'РКИ',
    //     healthState: 'healthy',
    //     timestamp: 1602036601925,
    //     lifeStyle: 'Bronze',
    //     personName: 'Мэрфи в группе Мастера и приложение'
    //   },
    // }
  }
}
