import { getCardShadow } from './context';

/** BaseCard 读取的外观配置 */
export const preferences = {
  theme: {
    get cardShadow() {
      return getCardShadow().value;
    },
  },
};
