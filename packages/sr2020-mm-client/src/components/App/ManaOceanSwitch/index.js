import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { ManaOceanSwitch } from './ManaOceanSwitch.jsx';
import { withEnableManaOcean } from '../../../dataHOCs';

const tmp = pipe(withTranslation(), withEnableManaOcean)(ManaOceanSwitch);

export { tmp as ManaOceanSwitch };
