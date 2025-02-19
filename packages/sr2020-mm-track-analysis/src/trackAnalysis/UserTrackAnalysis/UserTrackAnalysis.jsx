import React, { Component } from 'react';
import './UserTrackAnalysis.css';
import * as R from 'ramda';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import * as moment from 'moment';

import classNames from 'classnames';

import { TimeRange } from './TimeRange';
import { TimeRangeWrapper } from './TimeRangeWrapper';

import { RealTrackStats } from '../RealTrackStats';

// import { UserTrackAnalysisPropTypes } from '../../types';

const speedLevels = [-60, -10, -1, 0, 1, 10, 60];

const timeShifts = [-6000, -60000, -600000, 6000, 60000, 600000];

export class UserTrackAnalysis extends Component {
  // static propTypes = UserTrackAnalysisPropTypes;

  constructor(props) {
    super(props);
    this.state = {
      selectedUser: null,
      maxTime: null,
      timeDelta: null,
      speedLevel: 0,
      showTable: true,
      showMap: true,
    };
    this.onUserSelect = this.onUserSelect.bind(this);
    this.onTimeRangeChange = this.onTimeRangeChange.bind(this);
    this.onSpeedChange = this.onSpeedChange.bind(this);
    this.onShowTable = this.onShowTable.bind(this);
    this.onShowMap = this.onShowMap.bind(this);
    this.set10MinInterval = this.set10MinInterval.bind(this);
    this.selectAllTime = this.selectAllTime.bind(this);
  }


  componentDidMount() {
    const { tracksData, defaultSelectedUser } = this.props;
    const userData = tracksData[defaultSelectedUser];
    this.setState({
      selectedUser: defaultSelectedUser,
      maxTimeBoundary: userData.stats.maxTimeMillis + (userData.stats.maxTimeMillis % 60000),
      minTimeBoundary: userData.stats.minTimeMillis - (userData.stats.minTimeMillis % 60000),
      // maxTime: userData.stats.maxTimeMillis,
      // timeDelta: userData.stats.maxTimeMillis - userData.stats.minTimeMillis,
      maxTime: userData.stats.minTimeMillis + 60000 * 10,
      timeDelta: 60000 * 10,
    });
    console.log('UserTrackAnalysis mounted');
  }

  componentDidUpdate() {
    console.log('UserTrackAnalysis did update');
  }

  componentWillUnmount() {
    clearInterval(this.moveTimeWindowInterval);
    console.log('UserTrackAnalysis will unmount');
  }

  onUserSelect(e) {
    this.setState({
      selectedUser: e.target.value,
    });
  }

  onShowMap(e) {
    this.setState(({ showMap }) => ({
      showMap: !showMap,
    }));
  }

  onShowTable(e) {
    this.setState(({ showTable }) => ({
      showTable: !showTable,
    }));
  }

  onTimeRangeChange(e) {
    this.setState({
      timeDelta: e[1] - e[0],
      maxTime: e[1],
    });
    // console.log(e);
  }

  onSpeedChange(level) {
    return () => {
      this.setState({
        speedLevel: level,
      });
      this.moveTimeWindow(level);
    };
  }


  onManualShift(shiftSize) {
    return () => {
      const {
        maxTime,
      } = this.state;
      this.setMaxTime(maxTime + shiftSize);
    };
  }

  setMaxTime(nextMaxTime) {
    const {
      maxTimeBoundary, minTimeBoundary,
    } = this.state;
    if (nextMaxTime > maxTimeBoundary) {
      nextMaxTime = minTimeBoundary;
    } else if (nextMaxTime < minTimeBoundary) {
      nextMaxTime = maxTimeBoundary;
    }
    this.setState({
      maxTime: nextMaxTime,
    });
  }


  set10MinInterval() {
    this.setState({
      timeDelta: 600000,
    });
  }

  selectAllTime() {
    const {
      maxTimeBoundary, minTimeBoundary,
    } = this.state;
    this.setState({
      maxTime: maxTimeBoundary,
      timeDelta: maxTimeBoundary - minTimeBoundary,
    });
  }

  moveTimeWindow(level) {
    clearInterval(this.moveTimeWindowInterval);
    if (level === 0) {
      return;
    }
    let time1 = performance.now();
    this.moveTimeWindowInterval = setInterval(() => {
      const time2 = performance.now();
      const timeDelta = time2 - time1;
      const {
        speedLevel, maxTime,
      } = this.state;
      const nextMaxTime = maxTime + speedLevel * timeDelta;
      this.setMaxTime(nextMaxTime);
      time1 = time2;
    }, 1000);
  }


  // eslint-disable-next-line max-lines-per-function
  render() {
    const {
      selectedUser, maxTime, timeDelta, maxTimeBoundary, minTimeBoundary, speedLevel, showTable, showMap,
    } = this.state;
    if (!maxTime) {
      return null;
    }
    const {
      drawMap, tracksData, userList, beaconLatlngsIndex, beaconIndex,
    } = this.props;
    let userData = R.pick([selectedUser], tracksData);

    const isInTimeInterval = (time) => (time >= (maxTime - timeDelta)) && time <= maxTime;
    const isMessageInTimeInterval = R.pipe(R.prop('timeMillis'), isInTimeInterval);
    const filterMessageArr = R.filter(isMessageInTimeInterval);
    const filterTrackArr = R.filter((arr) => R.any(isMessageInTimeInterval, arr));

    userData = R.mapObjIndexed((oneUserData) => {
      const data = {
        ...oneUserData,
      };
      data.rawDataArr = filterMessageArr(data.rawDataArr);
      data.tracks = filterTrackArr(data.tracks).map(filterMessageArr);
      if (data.gpsTrack) {
        data.gpsTrack = filterMessageArr(data.gpsTrack);
      }
      // data.tracks = data.tracks.filter(R.pipe(R.prop('timeMillis'), isInTimeInterval));
      return data;
    }, { ...userData });

    const msgNumber = userData[selectedUser].rawDataArr.length;
    const sumBeaconSignals = R.pipe(R.map(R.pipe(R.prop('beacons'), R.length)), R.sum);
    const beaconSignals = sumBeaconSignals(userData[selectedUser].rawDataArr);
    const common = 'tw-font-bold tw-py-2 focus:tw-outline-none focus:tw-shadow-outline';
    const selectedButton = 'tw-bg-blue-500 hover:tw-bg-blue-700 tw-text-white';
    const unselectedButton = 'tw-bg-gray-300 hover:tw-bg-gray-400 tw-text-gray-800';
    return (
      <div className="UserTrackAnalysis">
        <Form>
          <Form.Group className="tw-px-4 tw-py-2">
            <Form.Label className="tw-text-right tw-inline tw-mr-2">
              Пользователь
            </Form.Label>
            <Form.Control
              as="select"
              value={selectedUser}
              onChange={this.onUserSelect}
              style={{ width: '15rem' }}
              className="tw-inline"
            >
              {
                userList.map(({ userId, userName }) => <option value={userId}>{`${userName} (id ${userId}, ${tracksData[userId].rawDataArr.length} точек)`}</option>)
              }
            </Form.Control>
            <Button className="tw-ml-2" variant={showTable ? 'primary' : 'outline-primary'} onClick={this.onShowTable}>Показывать таблицу статистики</Button>
            <Button className="tw-ml-2" variant={showMap ? 'primary' : 'outline-primary'} onClick={this.onShowMap}>Показывать карту</Button>
            <Button className="tw-ml-4" variant="outline-primary" onClick={this.set10MinInterval}>Поставить интервал 10 мин</Button>
            <Button className="tw-ml-2" variant="outline-primary" onClick={this.selectAllTime}>Выбрать все время</Button>
          </Form.Group>
        </Form>
        <div className="tw-m-8 tw-flex tw-items-center">
          <div
            className="tw-mr-8"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              zIndex: 10000,
              background: '#dddddd',
            }}
          >
            <div>
              <label>Скорость времени</label>
              <br />
              {
                speedLevels.map((level, i) => (
                  <>
                    <button
                      key={level}
                      className={classNames(common, 'tw-px-3', {
                        [selectedButton]: level === speedLevel,
                        [unselectedButton]: level !== speedLevel,
                        'tw-rounded-l': i === 0,
                        'tw-rounded-r': i === 4,
                      })}
                      type="button"
                      value={level}
                      onClick={this.onSpeedChange(level)}
                    >
                      {level + (level === 0 ? '' : 'x')}
                    </button>
                    {i === 3 && <br />}
                  </>
                ))
              }
            </div>
            <div
              className="tw-mt-2"
            >
              <label>Ручной сдвиг времени</label>
              <br />
              {
                timeShifts.map((level, i) => (
                  <>
                    <button
                      key={level}
                      className={classNames(common, unselectedButton, 'tw-w-24 tw-px-2 ', {
                      // [selectedButton]: level === speedLevel,
                      // [unselectedButton]: level !== speedLevel,
                        // 'rounded-l': i === 0,
                        // 'rounded-r': i === 3,
                      })}
                      type="button"
                      value={level}
                      onClick={this.onManualShift(level)}
                    >
                      {`${level > 0 ? '+' : ''}${level / 60000} мин`}
                    </button>
                    {i === 2 && <br />}
                  </>
                ))
              }
            </div>
          </div>
          <div className="tw-flex-1">

            <TimeRangeWrapper
              values={[maxTime - timeDelta, maxTime]}
              onChange={this.onTimeRangeChange}
              max={maxTimeBoundary}
              min={minTimeBoundary}
              step={60000}
              tickStep={60000 * 60}
            />
          </div>
          <div className="tw-ml-8">

            {`Текущее время ${moment(maxTime).format('HH:mm:ss_Do')}`}
            <br />
            {`Временной интервал ${(timeDelta / 60000).toFixed(1)}мин`}
            <br />
            {`Сообщений в интервале ${msgNumber}`}
            <br />
            {`Частота сообщений в интервале ${((msgNumber / timeDelta) * 60000).toFixed(1)}с/мин`}
            <br />
            {`Услышано сигналов ${beaconSignals}`}
            <br />
            {`Сигналов в сообщении в ср. ${msgNumber !== 0 ? (beaconSignals / msgNumber).toFixed(1) : ''}`}
          </div>
        </div>
        {
          showTable && (
            <RealTrackStats
              tracksData={userData}
              beaconIndex={beaconIndex}
              beaconLatlngsIndex={beaconLatlngsIndex}
              initialPercentUsage={100}
              initialShowExtendedChart={false}
            />
          )
        }
        {
          showMap && (
            <div style={{ height: '100vh' }}>
              {drawMap({ userData })}
            </div>
          )
        }

      </div>
    );
  }
}
