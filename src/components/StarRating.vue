<template>
  <!-- Interactive mode: a real radio group, so it is keyboard operable and
       announced correctly by a screen reader rather than being clickable divs. -->
  <div
    v-if="!readonly"
    class="star-rating"
    role="radiogroup"
    :aria-label="label"
  >
    <button
      v-for="star in MAX_SCORE"
      :key="star"
      type="button"
      role="radio"
      class="star-button"
      :class="{ 'is-filled': isFilled(star, displayScore) }"
      :aria-checked="star === modelValue"
      :aria-label="`${star} out of ${MAX_SCORE} stars`"
      @click="select(star)"
      @mouseenter="hoverScore = star"
      @mouseleave="hoverScore = 0"
      @focus="hoverScore = star"
      @blur="hoverScore = 0"
    >
      {{ starChar(star, displayScore) }}
    </button>
  </div>

  <!-- Read-only mode: purely presentational, with the value also written out in
       text so the meaning does not depend on seeing the stars. -->
  <div v-else class="star-rating is-readonly">
    <span class="star-display" aria-hidden="true">
      <span
        v-for="star in MAX_SCORE"
        :key="star"
        :class="{ 'is-filled': isFilled(star, roundedValue) }"
      >{{ starChar(star, roundedValue) }}</span>
    </span>
    <span class="sr-only">{{ modelValue }} out of {{ MAX_SCORE }} stars</span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { MAX_SCORE } from '../services/ratings.js'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  label: { type: String, default: 'Rating' }
})

const emit = defineEmits(['update:modelValue'])

const FILLED_STAR = '★'
const EMPTY_STAR = '☆'

const hoverScore = ref(0)

// Preview the score the pointer or keyboard focus is currently over, falling
// back to the committed value.
const displayScore = computed(() => hoverScore.value || props.modelValue)

const roundedValue = computed(() => Math.round(props.modelValue))

// Kept in script rather than inline in the template: a "<=" comparison inside a
// {{ }} interpolation is awkward for the template parser to read.
const isFilled = (star, score) => star <= score

const starChar = (star, score) => (isFilled(star, score) ? FILLED_STAR : EMPTY_STAR)

const select = (star) => emit('update:modelValue', star)
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
}

.star-button {
  background: none;
  border: none;
  padding: 0 0.1rem;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: #c9c9c9;
  transition: color 0.15s ease, transform 0.15s ease;
}

.star-button:hover,
.star-button.is-filled {
  color: #f5a623;
}

.star-button:hover {
  transform: scale(1.1);
}

/* Visible focus ring so the control is usable without a mouse. */
.star-button:focus-visible {
  outline: 3px solid #2c5f2d;
  outline-offset: 2px;
  border-radius: 4px;
}

.star-display {
  font-size: 1.15rem;
  letter-spacing: 0.05em;
  color: #c9c9c9;
}

.star-display .is-filled {
  color: #f5a623;
}

/* Available to assistive technology, hidden from sight. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
