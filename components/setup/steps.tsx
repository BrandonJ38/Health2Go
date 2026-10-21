import type { ReactNode } from 'react';
import {
  ACTIVITY_LEVELS,
  ALLERGIES,
  AVOID_CATEGORIES,
  DAYS_EAT_OUT,
  DECISION_FACTORS,
  EATING_OUT_CHALLENGES,
  EATING_STYLES,
  FOOD_CATEGORIES,
  GOALS,
  RESTAURANTS,
  type Option,
} from '../../lib/profile/options';
import type { Profile } from '../../lib/profile/types';
import { BodyStatsForm } from './BodyStatsForm';
import { ChoiceList } from './ChoiceList';
import { TimelineForm } from './TimelineForm';

export type StepId =
  | 'welcome'
  | 'goal'
  | 'eatingStyle'
  | 'avoid'
  | 'allergies'
  | 'location'
  | 'done'
  | 'body'
  | 'activity'
  | 'timeline'
  | 'daysEatOut'
  | 'challenges'
  | 'decide'
  | 'favorites'
  | 'likes'
  | 'dislikes';

export type StepDef = {
  title: string;
  subtitle?: string;
  optional?: boolean; // shows "Skip"
  canContinue?: (p: Profile) => boolean;
  render?: (p: Profile, update: (c: Partial<Profile>) => void) => ReactNode;
};

// Required quick start, then the optional "Personalize more" flow.
export const QUICK_FLOW: StepId[] = ['welcome', 'goal', 'eatingStyle', 'avoid', 'allergies', 'location', 'done'];
export const MORE_FLOW: StepId[] = ['body', 'activity', 'timeline', 'daysEatOut', 'challenges', 'decide', 'favorites', 'likes', 'dislikes'];

// Single- or multi-select step bound to one profile field.
function choice<K extends keyof Profile>(
  field: K,
  options: readonly Option[],
  opts: { multi?: boolean; variant?: 'cards' | 'chips' | 'list' } = {},
): StepDef['render'] {
  return (p, update) => {
    const current = p[field];
    const selected = Array.isArray(current) ? (current as string[]) : current ? [current as string] : [];
    return (
      <ChoiceList
        options={options}
        selected={selected}
        multi={opts.multi}
        variant={opts.variant}
        onChange={(next) => update({ [field]: opts.multi ? next : (next[0] ?? null) } as Partial<Profile>)}
      />
    );
  };
}

export const STEPS: Record<StepId, StepDef> = {
  // Welcome, location and done have custom layouts in app/setup.tsx.
  welcome: { title: 'Eat for the long run' },
  location: {
    title: 'Find healthy food near you',
    subtitle: 'Your location is used to find nearby restaurants. It is never stored or shared.',
  },
  done: { title: "You're all set" },

  goal: {
    title: "What's your main goal?",
    subtitle: 'This shapes your tips, targets and recommendations.',
    canContinue: (p) => p.goal !== null,
    render: choice('goal', GOALS),
  },
  eatingStyle: {
    title: 'Do you follow an eating style?',
    canContinue: (p) => p.eatingStyle !== null,
    render: choice('eatingStyle', EATING_STYLES),
  },
  avoid: {
    title: 'What do you want to avoid?',
    subtitle: "We'll flag these in restaurants, scanned products and your food log. Untick anything you don't mind.",
    render: choice('avoid', AVOID_CATEGORIES, { multi: true }),
  },
  allergies: {
    title: 'Any allergies or restrictions?',
    subtitle: 'Skip if none.',
    optional: true,
    render: choice('allergies', ALLERGIES, { multi: true, variant: 'chips' }),
  },

  body: {
    title: 'About you',
    subtitle: 'Used to estimate your daily calorie target.',
    optional: true,
    render: () => <BodyStatsForm />,
  },
  activity: {
    title: 'How active are you?',
    optional: true,
    render: choice('activity', ACTIVITY_LEVELS),
  },
  timeline: {
    title: 'When do you want to reach your goal?',
    optional: true,
    render: () => <TimelineForm />,
  },
  daysEatOut: {
    title: 'How many days a week do you eat out?',
    optional: true,
    render: choice('daysEatOut', DAYS_EAT_OUT),
  },
  challenges: {
    title: "What's the hardest part of eating out?",
    subtitle: 'Pick any that apply.',
    optional: true,
    render: choice('eatingOutChallenges', EATING_OUT_CHALLENGES, { multi: true }),
  },
  decide: {
    title: 'How do you usually decide what to eat?',
    subtitle: 'Pick any that apply.',
    optional: true,
    render: choice('decisionFactors', DECISION_FACTORS, { multi: true }),
  },
  favorites: {
    title: 'Pick your go-to restaurants',
    subtitle: "We'll show you the healthiest thing to order at each one.",
    optional: true,
    render: choice('favoriteRestaurants', RESTAURANTS, { multi: true, variant: 'list' }),
  },
  likes: {
    title: 'What foods do you enjoy?',
    optional: true,
    render: choice('likedFoods', FOOD_CATEGORIES, { multi: true, variant: 'chips' }),
  },
  dislikes: {
    title: "Any foods you don't like?",
    subtitle: "We'll leave these out of your recommendations.",
    optional: true,
    render: choice('dislikedFoods', FOOD_CATEGORIES, { multi: true, variant: 'chips' }),
  },
};
