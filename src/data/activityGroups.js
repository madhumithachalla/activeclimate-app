// BR (B.2): Dynamic data - the activity groups the whole app renders from.
// Pulled out of the Activities component so that the activity cards, the
// rating aggregates and the admin overview all key off the same stable ids.

export const ACTIVITY_GROUPS = [
  {
    id: 1,
    slug: 'cycling',
    name: 'Cycling',
    icon: 'BIKE',
    emoji: '\u{1F6B4}',
    description: 'Join local cycling groups. Build community while reducing transport emissions.',
    difficulty: 'Beginner - Advanced',
    meetingPoint: 'Federation Square, Melbourne',
    weeklySessions: 4
  },
  {
    id: 2,
    slug: 'running',
    name: 'Running',
    icon: 'RUN',
    emoji: '\u{1F3C3}',
    description: 'Connect with runners. Track CO2 saved vs. driving. Compete on the leaderboard.',
    difficulty: 'Beginner - Advanced',
    meetingPoint: 'Princes Park, Carlton North',
    weeklySessions: 5
  },
  {
    id: 3,
    slug: 'hiking',
    name: 'Hiking',
    icon: 'HIKE',
    emoji: '\u{1F3D4}',
    description: 'Explore Melbourne trails. Group hikes every weekend. Climate-positive adventure.',
    difficulty: 'Beginner - Intermediate',
    meetingPoint: 'Dandenong Ranges, Upper Ferntree Gully',
    weeklySessions: 2
  },
  {
    id: 4,
    slug: 'water-sports',
    name: 'Water Sports',
    icon: 'SWIM',
    emoji: '\u{1F3CA}',
    description: 'Swimming, paddling and water activities. Community-based aquatic adventures.',
    difficulty: 'Intermediate - Advanced',
    meetingPoint: 'Port Phillip Bay, St Kilda',
    weeklySessions: 3
  }
]

export const findActivityById = (id) => {
  return ACTIVITY_GROUPS.find((group) => group.id === id) || null
}

export const findActivityBySlug = (slug) => {
  return ACTIVITY_GROUPS.find((group) => group.slug === slug) || null
}
