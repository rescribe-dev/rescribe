import { PricingMessages } from './pricingMessages';

const englishMessages: PricingMessages = {
  month: 'month',
  year: 'year',
  monthly: 'Monthly',
  yearly: 'Yearly (Best Value)',
  subscribe: 'subscribe now',
  products: {
    free: {
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
    team: {
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
    enterprise: {
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
