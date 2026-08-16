<template>
  <div id="app">
    <header class="app-header">
      <h1>🌍 ActiveClimate Melbourne</h1>
      <p>Sport & Travel for Climate Action</p>
    </header>
    <MadhumulithaChalia />
    <Activities />
    <UserHighlight />
  </div>
</template>

<script setup>
import MadhumulithaChalia from './components/MadhumulithaChalia.vue'
import Activities from './components/Activities.vue'
import UserHighlight from './components/UserHighlight.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background: #f9f9f9;
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #2c5f2d 0%, #45a049 100%);
  color: white;
  text-align: center;
  padding: 2rem 1rem;
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
}

.app-header p {
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  opacity: 0.95;
}
</style>