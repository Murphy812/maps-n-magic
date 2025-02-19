import * as R from 'ramda';
import React from 'react';
import './CharacterWatcher.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { CharacterDataList } from '../CharacterDataList';

const WATCH_CHARACTER_HISTORY_KEY = 'watchCharacterHistory';

// eslint-disable-next-line max-lines-per-function
export function CharacterWatcher(props) {
  const {
    characterId, userRecords, gameModel, children, characterLocationId,
  } = props;

  const userIds = R.pluck('id', userRecords);

  const watchCharacterHistoryStr = localStorage.getItem(WATCH_CHARACTER_HISTORY_KEY);

  let watchCharacterHistory = [];
  if (watchCharacterHistoryStr) {
    watchCharacterHistory = JSON.parse(watchCharacterHistoryStr);
  }

  function onWatchCancel() {
    gameModel.execute({
      type: 'setCharacterId',
      characterId: null,
    });
  }

  function onReselectCharacter(e) {
    // eslint-disable-next-line no-shadow
    const { characterId } = e.target.dataset;
    gameModel.execute({
      type: 'setCharacterId',
      characterId: Number(characterId),
    });
  }

  function onSubmit(e) {
    const form = e.currentTarget;
    e.stopPropagation();
    e.preventDefault();
    const characterId2 = Number(form.characterId.value.trim());
    if (!userIds.includes(characterId2)) {
      console.warn('character is absent');
      return;
    }

    gameModel.execute({
      type: 'setCharacterId',
      characterId: characterId2,
    });
    if (!watchCharacterHistory.includes(characterId2)) {
      watchCharacterHistory.push(characterId2);
    }

    if (watchCharacterHistory.length > 10) {
      watchCharacterHistory.shift();
    }

    localStorage.setItem(WATCH_CHARACTER_HISTORY_KEY, JSON.stringify(watchCharacterHistory));
  }

  return (
    <>

      {
        !characterId
        && (
          <>
            <Form
              className="tw-mx-auto tw-mb-8"
              style={{ width: '20rem' }}
              onSubmit={onSubmit}
            >
              <Form.Group controlId="characterId">
                <Form.Label>Введите Id персонажа</Form.Label>
                <Form.Control list="characterIdList" />
              </Form.Group>
              <div className="tw-text-right">
                <Button variant="primary" type="submit">
                  Отслеживать локацию и звук
                </Button>
              </div>
            </Form>
            <CharacterDataList users={userRecords} />
            {
              watchCharacterHistory.length > 0
            && (
              <Form.Group
                className="tw-mx-auto"
                style={{ width: '20rem' }}
              >
                <Form.Label>Ранее выбранные персонажи</Form.Label>
                <div>
                  {
                    watchCharacterHistory.map((el) => (
                      <Button
                        key={el}
                        variant="primary"
                        className="tw-mr-4 tw-mb-4"
                        data-character-id={el}
                        onClick={onReselectCharacter}
                      >
                        {el}
                      </Button>
                    ))
                  }
                </div>
              </Form.Group>
            )
            }

          </>
        )
      }

      {
        characterId
      && (
        <>
          {children}
          <div className="tw-fixed tw-bottom-0 tw-left-0" style={{ zIndex: 10000 }}>
            {`Персонаж ${characterId}`}
            <br />
            {`Локация ${characterLocationId || 'N/A'}`}
            <br />
            <Button variant="primary" onClick={onWatchCancel}>
              Остановить отслеживание
            </Button>
          </div>
        </>
      )
      }
    </>
  );
}
