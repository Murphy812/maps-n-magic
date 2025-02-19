import * as R from 'ramda';

import { AbstractService } from '../core/AbstractService';

export class SoundStageService extends AbstractService {
  metadata = {
    actions: [
      'setBackgroundSound',
      'rotationSoundsChange',
      'clearSoundStage',
      'setRotationTimeout',
      'setRotationSoundTimeout',
      'setRotationVolume',
      'setBackgroundVolume',
    ],
    requests: ['soundStage'],
    emitEvents: [
      'backgroundSoundUpdate',
      'rotationSoundsUpdate',
      'rotationTimeoutUpdate',
      'rotationSoundTimeoutUpdate',
      'backgroundVolumeUpdate',
      'rotationVolumeUpdate',
    ],
  };

  constructor() {
    super();
    this.backgroundSound = null;
    this.rotationSounds = [];
    this.rotationTimeout = 2000;
    this.rotationSoundTimeout = 5000;
    this.backgroundVolume = 50;
    this.rotationVolume = 50;
  }

  setData({ soundStageSettings = {} } = {}) {
    this.rotationTimeout = soundStageSettings.rotationTimeout || this.rotationTimeout;
    this.rotationSoundTimeout = soundStageSettings.rotationSoundTimeout || this.rotationSoundTimeout;
    this.backgroundVolume = soundStageSettings.backgroundVolume || this.backgroundVolume;
    this.rotationVolume = soundStageSettings.rotationVolume || this.rotationVolume;
  }

  getData() {
    return {
      soundStageSettings: {
        rotationTimeout: this.rotationTimeout,
        rotationSoundTimeout: this.rotationSoundTimeout,
        backgroundVolume: this.backgroundVolume,
        rotationVolume: this.rotationVolume,
      },
    };
  }

  // dispose() {
  //   // this._stop();
  // }

  setBackgroundSound({ name }) {
    this.backgroundSound = name;
    this.emit('backgroundSoundUpdate', {
      backgroundSound: this.backgroundSound,
    });
  }

  setRotationTimeout({ rotationTimeout }) {
    if (!R.is(Number, rotationTimeout)) {
      return;
    }
    if (rotationTimeout < 0) {
      rotationTimeout = 0;
    }
    if (rotationTimeout > 30000) {
      rotationTimeout = 30000;
    }
    this.rotationTimeout = rotationTimeout;
    this.emit('rotationTimeoutUpdate', {
      rotationTimeout,
    });
  }

  setRotationSoundTimeout({ rotationSoundTimeout }) {
    if (!R.is(Number, rotationSoundTimeout)) {
      return;
    }
    if (rotationSoundTimeout < 0) {
      rotationSoundTimeout = 0;
    }
    if (rotationSoundTimeout > 30000) {
      rotationSoundTimeout = 30000;
    }
    this.rotationSoundTimeout = rotationSoundTimeout;
    this.emit('rotationSoundTimeoutUpdate', {
      rotationSoundTimeout,
    });
  }

  setBackgroundVolume({ backgroundVolume }) {
    if (!R.is(Number, backgroundVolume)) {
      return;
    }
    if (backgroundVolume < 0) {
      backgroundVolume = 0;
    }
    if (backgroundVolume > 100) {
      backgroundVolume = 100;
    }
    this.backgroundVolume = backgroundVolume;
    this.emit('backgroundVolumeUpdate', {
      backgroundVolume,
    });
  }

  setRotationVolume({ rotationVolume }) {
    if (!R.is(Number, rotationVolume)) {
      return;
    }
    if (rotationVolume < 0) {
      rotationVolume = 0;
    }
    if (rotationVolume > 100) {
      rotationVolume = 100;
    }
    this.rotationVolume = rotationVolume;
    this.emit('rotationVolumeUpdate', {
      rotationVolume,
    });
  }

  clearSoundStage() {
    const hasBackgroundSound = !!this.backgroundSound;
    if (hasBackgroundSound) {
      this.backgroundSound = null;
      this.emit('backgroundSoundUpdate', {
        backgroundSound: this.backgroundSound,
      });
    }
    const hasRotationSounds = this.rotationSounds.length !== 0;
    if (hasRotationSounds) {
      this.rotationSounds = [];
      this.emit('rotationSoundsUpdate', {
        rotationSounds: this.rotationSounds,
      });
    }
  }

  rotationSoundsChange({ added = [], removed = [] }) {
    const sounds = R.difference(this.rotationSounds, removed).concat(added);
    if (R.symmetricDifference(this.rotationSounds, sounds).length !== 0) {
      this.rotationSounds = sounds;
      this.emit('rotationSoundsUpdate', {
        rotationSounds: this.rotationSounds,
      });
    }
  }

  getSoundStage() {
    return {
      backgroundSound: this.backgroundSound,
      rotationSounds: [...this.rotationSounds],
      rotationTimeout: this.rotationTimeout,
      rotationSoundTimeout: this.rotationSoundTimeout,
      backgroundVolume: this.backgroundVolume,
      rotationVolume: this.rotationVolume,
    };
  }
}
