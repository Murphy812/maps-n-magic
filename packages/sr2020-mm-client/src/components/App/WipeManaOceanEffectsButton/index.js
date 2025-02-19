import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { WipeManaOceanEffectsButton } from './WipeManaOceanEffectsButton.jsx';

const tmp = pipe(withTranslation())(WipeManaOceanEffectsButton);

export { tmp as WipeManaOceanEffectsButton };
