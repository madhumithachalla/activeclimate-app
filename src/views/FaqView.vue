<template>
  <main class="faq-page">
    <header class="page-head">
      <h1>Frequently asked questions</h1>
      <p class="page-lead">
        Everything people ask before their first session. If your question is not here, ask a group
        leader at the meeting point.
      </p>
    </header>

    <!-- Native details/summary: keyboard operable and announced correctly with
         no JavaScript, which is hard to match with a custom accordion. -->
    <section v-for="group in FAQ_GROUPS" :key="group.category" class="faq-section">
      <h2>{{ group.category }}</h2>
      <details v-for="item in group.items" :key="item.q" class="faq-item">
        <summary>{{ item.q }}</summary>
        <div class="faq-answer">
          <p v-for="(para, index) in item.a" :key="index">
            {{ para }}<SourceRef v-if="item.source && index === item.a.length - 1" :source="item.source" />
          </p>
        </div>
      </details>
    </section>

    <SourceList heading="References used on this page" :sources="pageSources" />

    <p class="disclaimer">
      ActiveClimate Melbourne is a fictional organisation created for a university assignment
      (FIT5032, Monash University). Session details are illustrative; the organisations and
      statistics cited are real and linked to their original sources.
    </p>
  </main>
</template>

<script setup>
import SourceRef from '../components/SourceRef.vue'
import SourceList from '../components/SourceList.vue'
import { SOURCES, CAR_EMISSIONS_KG_PER_KM } from '../data/sources.js'

const FAQ_GROUPS = [
  {
    category: 'Joining a group',
    items: [
      {
        q: 'Do I need to be fit to join?',
        a: [
          'No. Every group has a no-drop policy, which means the group moves at the pace of its slowest member and nobody is left behind.',
          'We took this directly from how parkrun runs its free weekly 5km events across Australia: no time limit, and a volunteer tail walker always finishes last so no participant ever does.'
        ],
        source: SOURCES.parkrun
      },
      {
        q: 'How much does it cost?',
        a: [
          'Nothing. Groups are free to join and always will be. We are funded by donations rather than membership fees or government, the same model Environment Victoria has used since 1969.'
        ],
        source: SOURCES.environmentVictoria
      },
      {
        q: 'I do not own a bike. Can I still ride?',
        a: [
          'Yes. Each cycling group keeps loan bikes and helmets at the meeting point, free to borrow for the session. Tell the ride leader your height when you register and one will be set aside.'
        ]
      },
      {
        q: 'Do I need to register before turning up?',
        a: [
          'Create an account so your trips are logged against your name, then just turn up. Registration takes about a minute and the ride leader will check you in at the meeting point.'
        ]
      }
    ]
  },
  {
    category: 'How the CO2 figures work',
    items: [
      {
        q: 'How do you calculate the CO2 I save?',
        a: [
          `We multiply the distance you log by ${CAR_EMISSIONS_KG_PER_KM} kg of CO2 per kilometre.`,
          'That is the Australian Government Green Vehicle Guide figure for the average new light vehicle sold in Australia: 181 grams of CO2 per kilometre in 2019.'
        ],
        source: SOURCES.greenVehicleGuide
      },
      {
        q: 'Why is the rate the same for cycling, running and hiking?',
        a: [
          'Because what a trip saves is the car journey it replaces, not the way you travelled instead. Walking, riding and running all produce effectively no tailpipe emissions, so the saving is the same per kilometre.',
          'An earlier version of this site used different rates per activity. That was wrong, and it has been corrected.'
        ]
      },
      {
        q: 'Does this mean my logged trips definitely avoided a car journey?',
        a: [
          'Not necessarily, and we would rather say so than overstate it. The figure shows what the same distance would have emitted by car. If you would have walked anyway, or you drove to the trailhead first, the real saving is smaller.',
          'We report it as a comparison, not as a carbon offset, and we do not sell or trade it.'
        ]
      },
      {
        q: 'Why does transport matter this much?',
        a: [
          'The Climate Council reports that transport emitted 102 million tonnes of CO2 in 2018, around 18 per cent of Australia’s annual greenhouse gas pollution, and that cars are responsible for roughly half of that.'
        ],
        source: SOURCES.climateCouncilTransport
      }
    ]
  },
  {
    category: 'Accounts, ratings and your data',
    items: [
      {
        q: 'Who can see the activities I log?',
        a: [
          'Only you. Your logged trips appear on your own dashboard and nowhere else. Coordinators see totals across the community, not individual members’ trips.'
        ]
      },
      {
        q: 'How do the group ratings work?',
        a: [
          'Members rate a group out of five, and the card shows the average across everyone who has rated it. You get one rating per group, so rating a second time updates your score rather than adding another.',
          'Ratings are visible to everyone, including people who have not signed in, so you can judge a group before joining it.'
        ]
      },
      {
        q: 'Can I change or remove a review I left?',
        a: [
          'Yes. Open the group again and submit a new rating; it replaces your previous one. Coordinators can also remove a review that breaches the code of conduct.'
        ]
      },
      {
        q: 'Where is my account data stored?',
        a: [
          'In this version, entirely in your own browser. Nothing is sent to a server, and your password is never stored as text — only a salted hash of it is kept.',
          'Clearing your browser data will remove your account and your logged trips.'
        ]
      }
    ]
  },
  {
    category: 'Volunteering and support',
    items: [
      {
        q: 'Can I lead a group?',
        a: [
          'Yes, and most of our leaders started as participants. Volunteer-led is the model that makes free community sport work at scale: parkrun delivers more than 550 events every Saturday morning across Australia entirely through local volunteers.'
        ],
        source: SOURCES.parkrun
      },
      {
        q: 'Do you advocate for better cycling and walking infrastructure?',
        a: [
          'Yes. The aggregate picture of where members ride and walk becomes evidence we take to councils for separated lanes, crossings and end-of-trip facilities.',
          'This follows the approach of Bicycle Network, Australia’s biggest bike riding organisation with nearly 50,000 members nationwide, which combines advocacy with behaviour-change programs.'
        ],
        source: SOURCES.bicycleNetwork
      }
    ]
  }
]

const pageSources = [
  SOURCES.parkrun,
  SOURCES.environmentVictoria,
  SOURCES.greenVehicleGuide,
  SOURCES.climateCouncilTransport,
  SOURCES.bicycleNetwork
]
</script>

<style scoped>
.faq-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2.5rem 1rem 3rem;
}

.page-head {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  color: var(--brand);
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.page-lead {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 560px;
  margin: 0 auto;
}

.faq-section {
  margin-bottom: 2rem;
}

.faq-section h2 {
  color: var(--brand);
  font-size: 1.1rem;
  margin: 0 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border);
}

.faq-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 0.6rem;
  overflow: hidden;
}

.faq-item summary {
  padding: 0.85rem 1rem;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-strong);
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::after {
  content: '+';
  color: var(--brand);
  font-size: 1.15rem;
  font-weight: 700;
  flex-shrink: 0;
}

.faq-item[open] summary::after {
  content: '\2212';
}

.faq-item summary:hover {
  background: var(--surface-alt);
}

.faq-item summary:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: -3px;
}

.faq-answer {
  padding: 0 1rem 1rem;
}

.faq-answer p {
  margin: 0 0 0.65rem;
  font-size: 0.89rem;
  line-height: 1.7;
  color: var(--text-body);
}

.faq-answer p:last-child {
  margin-bottom: 0;
}

.disclaimer {
  margin: 1.5rem 0 0;
  padding: 0.85rem 1rem;
  background: var(--surface-alt);
  border-left: 3px solid var(--border-dashed);
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--text-subtle);
  line-height: 1.6;
}

@media (max-width: 640px) {
  h1 {
    font-size: 1.6rem;
  }
}
</style>
