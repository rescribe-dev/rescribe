import { PricingMessages } from './pricingMessages';
import {
  defaultProductName,
  teamProductName,
  enterpriseProductName,
} from 'shared/variables';

const englishMessages: PricingMessages = {
  monthly: 'Monthly',
  yearly: 'Yearly (Best Value)',
  subscribe: 'subscribe now',
  products: {
    [defaultProductName]: {
      buttonColor: 'var(--light-orange)',
      name: 'free',
      caption: 'Use reScribe for free forever',
      features: [
        'neural search engine indexing',
        '{{numPublicRepositories}} public repositories',
        'up to {{numPrivateRepositories}} private repositories',
        'up to {{storage}} of storage',
      ],
    },
    [teamProductName]: {
      buttonColor: 'var(--secondary-green)',
      name: 'team',
      caption: 'Best for small teams, with private repositories',
      features: [
        'all features from free',
        '{{numPublicRepositories}} public repositories',
        '{{numPrivateRepositories}} private repositories',
        'up to {{storage}} of storage',
      ],
    },
    [enterpriseProductName]: {
      buttonColor: 'var(--secondary-blue)',
      name: 'enterprise',
      caption: 'For larger companies',
      features: [
        'all features from team',
        '{{numPublicRepositories}} public repositories',
        '{{numPrivateRepositories}} private repositories',
        '{{storage}} storage on-premises',
      ],
    },
  },
};

export default englishMessages;
