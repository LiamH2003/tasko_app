import { createBox, createText } from '@shopify/restyle';
import type { AppTheme } from '@/constants/restyleTheme';

export const Box = createBox<AppTheme>();
export const Text = createText<AppTheme>();
