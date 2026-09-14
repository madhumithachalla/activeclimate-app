// External facts and figures used in the site copy, kept in one place with
// their citation so every number on the page can be traced to its source.
//
// ActiveClimate Melbourne is a fictional organisation created for this
// assignment. The statistics below are not fictional - they come from the
// Australian Government and from established Australian organisations, and the
// site cites them rather than inventing its own numbers.

export const SOURCES = {
  greenVehicleGuide: {
    id: 'gvg',
    publisher: 'Green Vehicle Guide, Australian Government Department of Infrastructure, Transport, Regional Development, Communications, Sport and the Arts',
    title: 'Vehicle emissions',
    url: 'https://www.greenvehicleguide.gov.au/pages/Information/VehicleEmissions',
    note: 'Average new light vehicle sold in Australia produced 181 g CO2 per km (2019).'
  },
  climateCouncilTransport: {
    id: 'cc-transport',
    publisher: 'Climate Council',
    title: 'What’s the deal with transport emissions?',
    url: 'https://www.climatecouncil.org.au/transport-emissions-and-climate-solutions',
    note: 'Transport produced 102 MtCO2 in 2018, around 18% of Australia’s annual greenhouse gas pollution, with cars responsible for roughly half of transport pollution.'
  },
  bicycleNetwork: {
    id: 'bicycle-network',
    publisher: 'Bicycle Network',
    title: 'About us',
    url: 'https://bicyclenetwork.com.au/about-us/',
    note: 'Australia’s biggest bike riding organisation, supported by nearly 50,000 members nationwide.'
  },
  environmentVictoria: {
    id: 'environment-victoria',
    publisher: 'Environment Victoria',
    title: 'Who we are',
    url: 'https://environmentvictoria.org.au/who-we-are/',
    note: 'Established 1969; a community of 40 grassroots member groups and more than 200,000 individual supporters; a charity independent of government and funded by donations.'
  },
  parkrun: {
    id: 'parkrun',
    publisher: 'parkrun Australia',
    title: 'parkrun Australia',
    url: 'https://resources.parkrun.com/australia',
    note: 'Free weekly 5km community events run by local volunteers, with more than 550 events across Australia each Saturday morning.'
  }
}

export const SOURCE_LIST = Object.values(SOURCES)

// Average CO2 emitted per kilometre by a new light vehicle sold in Australia,
// in kilograms. 181 g/km per the Green Vehicle Guide figure for 2019.
//
// This replaced a set of made-up per-activity rates. The carbon a trip saves
// depends on the car journey it displaces, not on whether you walked or rode,
// so one figure is both more honest and easier to defend.
export const CAR_EMISSIONS_KG_PER_KM = 0.181
