
import { EgoGravityRule } from './EgoGravityRule';
import { EgoBalanceRule } from './EgoBalanceRule';
import { WebActivationRule } from './WebActivationRule';
import { FloaterGravityRule } from './FloaterGravityRule';
import { DynamicStaticToggleRule } from './DynamicStaticToggleRule';

export {
    EgoGravityRule,
    EgoBalanceRule,
    WebActivationRule,
    FloaterGravityRule,
    DynamicStaticToggleRule
};

export const EnergyRules = {
    'EgoGravity': EgoGravityRule,
    'EgoBalance': EgoBalanceRule,
    'WebActivation': WebActivationRule,
    'FloaterGravity': FloaterGravityRule,
    'DynamicStaticToggle': DynamicStaticToggleRule
};
