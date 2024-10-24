import { Box } from '@rocket.chat/fuselage';
import { Story } from '@storybook/react';
import React, { ReactNode, ReactElement } from 'react';

import BurgerBadge from './BurgerBadge';
import { centeredDecorator } from '../../../.storybook/decorators';

export default {
	title: 'components/burger/BurgerBadge',
	component: BurgerBadge,
	decorators: [
		(storyFn: () => ReactNode): ReactElement => (
			<Box size={24} borderWidth='x1' borderStyle='dashed' position='relative'>
				{storyFn()}
			</Box>
		),
		centeredDecorator,
	],
};

export const Basic: Story = () => <BurgerBadge>99</BurgerBadge>;
