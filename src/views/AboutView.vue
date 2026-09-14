<template>
  <main class="about-page">
    <header class="page-head">
      <h1>About ActiveClimate Melbourne</h1>
      <p class="page-lead">
        We connect Melburnians to free, local sport and active-travel groups, and turn the everyday
        trips they log into a measured reduction in transport emissions.
      </p>
    </header>

    <section class="panel">
      <h2>Why transport</h2>
      <p>
        Transport is one of the larger pieces of Australia's emissions picture. The Climate Council
        reports that the sector emitted 102 million tonnes of CO2 in 2018, around 18 per cent of
        Australia's annual greenhouse gas pollution, and that cars alone are responsible for roughly
        half of that.<SourceRef :source="SOURCES.climateCouncilTransport" />
      </p>
      <p>
        That is the part of the problem an ordinary person can actually act on. A car trip not taken
        is emissions not produced, and for the average new light vehicle sold in Australia that is
        {{ CAR_EMISSIONS_KG_PER_KM }} kg of CO2 for every kilometre.<SourceRef :source="SOURCES.greenVehicleGuide" />
        Every figure on this site is built from that number rather than an estimate of our own.
      </p>
    </section>

    <section class="panel">
      <h2>What we do</h2>
      <div class="pillar-grid">
        <article v-for="pillar in PILLARS" :key="pillar.title" class="pillar">
          <h3>{{ pillar.title }}</h3>
          <p>{{ pillar.body }}</p>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>How we work</h2>
      <p>
        Our model borrows from organisations that have been doing this in Australia for decades.
        Groups are led by local volunteers and are free to join, in the way
        <a :href="SOURCES.parkrun.url" target="_blank" rel="noopener noreferrer">parkrun</a> runs
        more than 550 free weekly events across the country using volunteer teams.<SourceRef :source="SOURCES.parkrun" />
        We pair that with the advocacy and behaviour-change approach used by
        <a :href="SOURCES.bicycleNetwork.url" target="_blank" rel="noopener noreferrer">Bicycle
        Network</a>, Australia's biggest bike riding organisation, which supports nearly 50,000
        members nationwide.<SourceRef :source="SOURCES.bicycleNetwork" />
      </p>
      <p>
        Like <a :href="SOURCES.environmentVictoria.url" target="_blank" rel="noopener noreferrer">Environment
        Victoria</a> — established in 1969 and now a community of 40 grassroots member groups and
        more than 200,000 supporters — we are structured around member groups rather than a central
        office, and we are funded by donations rather than government.<SourceRef :source="SOURCES.environmentVictoria" />
      </p>
    </section>

    <section class="panel">
      <h2>Who we are for</h2>
      <p>
        We work with communities in Melbourne's north and west who are least likely to be reached by
        mainstream sport: people without a bike, people whose first language is not English, shift
        workers who cannot make a 7am start, and people who have never seen themselves as sporty.
        Loan bikes, bilingual ride leaders and varied session times exist for that reason.
      </p>
      <ul class="commitments">
        <li v-for="item in COMMITMENTS" :key="item">{{ item }}</li>
      </ul>
    </section>

    <SourceList heading="References used on this page" :sources="pageSources" />

    <p class="disclaimer">
      ActiveClimate Melbourne is a fictional organisation created for a university assignment
      (FIT5032, Monash University). The organisations and statistics cited above are real and
      linked to their original sources.
    </p>
  </main>
</template>

<script setup>
import SourceRef from '../components/SourceRef.vue'
import SourceList from '../components/SourceList.vue'
import { SOURCES, CAR_EMISSIONS_KG_PER_KM } from '../data/sources.js'

const PILLARS = [
  {
    title: 'Free local groups',
    body: 'Cycling, running, hiking and water-sports groups across Melbourne, led by volunteers. No membership fee, no fitness prerequisite and no time limit.'
  },
  {
    title: 'Emissions you can see',
    body: 'Every trip you log is converted into the CO2 it saved against the same journey by car, using the Australian Government figure rather than a number we invented.'
  },
  {
    title: 'Advocacy from evidence',
    body: 'The aggregate picture of where people ride, walk and run becomes the case we put to councils for safer routes and better end-of-trip facilities.'
  }
]

const COMMITMENTS = [
  'Every group free to join, with loan bikes available at no cost',
  'Ride and walk leaders trained in first aid and inclusive group leadership',
  'Sessions scheduled outside standard working hours as well as within them',
  'Routes chosen for separated infrastructure wherever it exists'
]

const pageSources = [
  SOURCES.climateCouncilTransport,
  SOURCES.greenVehicleGuide,
  SOURCES.parkrun,
  SOURCES.bicycleNetwork,
  SOURCES.environmentVictoria
]
</script>

<style scoped>
.about-page {
  max-width: 860px;
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
  font-size: 0.98rem;
  line-height: 1.65;
  max-width: 640px;
  margin: 0 auto;
}

.panel {
  background: var(--surface);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px var(--shadow-soft);
}

.panel h2 {
  color: var(--brand);
  font-size: 1.2rem;
  margin: 0 0 0.85rem;
}

.panel p {
  color: var(--text-body);
  font-size: 0.92rem;
  line-height: 1.7;
  margin: 0 0 0.85rem;
}

.panel p:last-of-type {
  margin-bottom: 0;
}

.panel a {
  color: var(--brand);
}

.pillar-grid {
  display: grid;
  gap: 1.15rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.pillar h3 {
  color: var(--text-strong);
  font-size: 1rem;
  margin: 0 0 0.4rem;
}

.pillar p {
  margin: 0;
  font-size: 0.88rem;
}

.commitments {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--text-body);
  font-size: 0.9rem;
  line-height: 1.75;
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

  .panel {
    padding: 1.15rem;
  }
}
</style>
