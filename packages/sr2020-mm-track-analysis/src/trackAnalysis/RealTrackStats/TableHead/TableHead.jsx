import React from 'react';
import './TableHead.css';

// import { TableHeadPropTypes } from '../../types';

export function TableHead(props) {
  // const { t } = this.props;

  return (
    <thead className="TableHead">
      <tr>
        <th>Имя пользователя</th>
        <th colSpan="2" className="tw-text-right">Число пустых сообщений</th>
        <th colSpan="2" className="tw-text-right">Число не пустых сообщений</th>
        <th className="tw-text-right">Всего сообщений</th>
        <th colSpan="2" className="tw-text-right">Число сообщений с известными координатами</th>
        <th colSpan="2" className="tw-text-right">Число сообщений с неизвестными координатами (здания?)</th>
        <th className="tw-text-right">Средний интервал между сообщениями, с</th>
        <th className="tw-text-right">Гистограмма интервалов между сообщениями</th>
      </tr>
      <tr>
        <th />
        <th className="tw-text-right">шт</th>
        <th className="tw-text-right">Процент</th>
        <th className="tw-text-right">шт</th>
        <th className="tw-text-right">Процент</th>
        <th className="tw-text-right">шт</th>
        <th className="tw-text-right">шт</th>
        <th className="tw-text-right">Процент</th>
        <th className="tw-text-right">шт</th>
        <th className="tw-text-right">Процент</th>
      </tr>
    </thead>
  );
}

// TableHead.propTypes = TableHeadPropTypes;
