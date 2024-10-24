import { css } from '@rocket.chat/css-in-js';
import { Box } from '@rocket.chat/fuselage';
import React from 'react';

import BurgerBadge from './BurgerBadge';
import BurgerIcon from './BurgerIcon';
import { useTranslation } from '../../contexts/TranslationContext';
import { useEmbeddedLayout } from '../../hooks/useEmbeddedLayout';

function BurgerMenuButton({ open, badge, ...props }) {
	const isLayoutEmbedded = useEmbeddedLayout();
	const t = useTranslation();

	return (
		<Box
			is='button'
			aria-label={open ? t('Close menu') : t('Open menu')}
			type='button'
			position='relative'
			className={css`
				cursor: pointer;
			`}
			{...props}
		>
			<BurgerIcon open={open} />
			{!isLayoutEmbedded && badge && <BurgerBadge>{badge}</BurgerBadge>}
		</Box>
	);
}

export default BurgerMenuButton;
