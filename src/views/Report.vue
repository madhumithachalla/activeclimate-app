<template>
  <div class="report-page">
    <h2>Species Report</h2>
    <p class="report-intro">Generate a report of local species activity, then download it.</p>

    <div class="report-controls">
      <button @click="generateReport" :disabled="loading">
        {{ loading ? 'Generating…' : 'Generate Report' }}
      </button>

      <label class="simulate-toggle">
        <input type="checkbox" v-model="simulateFailure" />
        Simulate API failure (for testing E07-US03-AC01)
      </label>
    </div>

    <p v-if="errorMessage" class="report-error" role="alert">
      {{ errorMessage }}
    </p>

    <div v-if="report" class="report-result">
      <div class="report-meta">
        <span>Generated {{ formattedTime(report.generatedAt) }}</span>
        <span v-if="elapsedMs !== null" :class="{ 'ready-fast': elapsedMs <= READY_TARGET_MS }">
          Ready in {{ (elapsedMs / 1000).toFixed(1) }}s
          (target: {{ READY_TARGET_MS / 1000 }}s)
        </span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Species</th>
            <th>Sightings</th>
            <th>Risk Level</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in report.species" :key="row.name">
            <td>{{ row.name }}</td>
            <td>{{ row.sightings }}</td>
            <td>{{ row.riskLevel }}</td>
          </tr>
        </tbody>
      </table>

      <button class="download-btn" @click="downloadReport">Download CSV</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { requestSpeciesReport, reportToCsv } from '../services/speciesReport'

const READY_TARGET_MS = 5000

const report = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const simulateFailure = ref(false)
const elapsedMs = ref(null)

async function generateReport() {
  loading.value = true
  errorMessage.value = ''
  report.value = null
  elapsedMs.value = null
  const startedAt = performance.now()

  try {
    const result = await requestSpeciesReport({ simulateFailure: simulateFailure.value })
    report.value = result
    elapsedMs.value = performance.now() - startedAt
  } catch (err) {
    errorMessage.value = err.message || 'Something went wrong generating the report. Please try again.'
  } finally {
    loading.value = false
  }
}

function downloadReport() {
  if (!report.value) return
  const csv = reportToCsv(report.value)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `species-report-${report.value.generatedAt.slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function formattedTime(iso) {
  return new Date(iso).toLocaleString()
}
</script>

<style scoped>
.report-page {
  max-width: 700px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.report-page h2 {
  color: #2c5f2d;
}

.report-intro {
  color: #444;
}

.report-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

button {
  padding: 0.6rem 1.2rem;
  background: #2c5f2d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: default;
}

.simulate-toggle {
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.report-error {
  color: #c0392b;
  background: #fdecea;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.report-result {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.report-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
}

.ready-fast {
  color: #2c5f2d;
  font-weight: bold;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

th {
  color: #2c5f2d;
}

.download-btn {
  margin-top: 1.5rem;
}
</style>
