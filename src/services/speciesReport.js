// Mock species-report API. Swap the body of requestSpeciesReport() for a real
// fetch() call once the backend endpoint exists — the resolve/reject contract
// (data shape on success, Error with a human-readable message on failure) is
// what Report.vue depends on, so keep that contract when wiring in the real API.

const MOCK_SPECIES = [
  { name: 'Grey-headed Flying Fox', sightings: 42, riskLevel: 'Vulnerable' },
  { name: 'Powerful Owl', sightings: 17, riskLevel: 'Threatened' },
  { name: 'Eastern Rosella', sightings: 96, riskLevel: 'Least Concern' },
  { name: 'Swift Parrot', sightings: 8, riskLevel: 'Critically Endangered' },
  { name: 'Ringtail Possum', sightings: 61, riskLevel: 'Least Concern' },
]

/**
 * @param {{ simulateFailure?: boolean }} options
 * @returns {Promise<{ generatedAt: string, species: Array }>}
 */
export function requestSpeciesReport({ simulateFailure = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simulateFailure) {
        reject(new Error('The report service is temporarily unavailable. Please try again in a few minutes.'))
        return
      }
      resolve({
        generatedAt: new Date().toISOString(),
        species: MOCK_SPECIES,
      })
    }, 900)
  })
}

export function reportToCsv(report) {
  const header = 'Species,Sightings,Risk Level'
  const rows = report.species.map((s) => `${s.name},${s.sightings},${s.riskLevel}`)
  return [header, ...rows].join('\n')
}
