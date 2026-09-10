<template>
  <div>
    <MadhumithaChalla />
    <Activities />
    <Dashboard :activities="submittedActivities" />
    <ActivityForm @activity-logged="submittedActivities.push($event)" />
    <UserHighlight />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MadhumithaChalla from '../components/MadhumithaChalla.vue'
import Activities from '../components/Activities.vue'
import ActivityForm from '../components/ActivityForm.vue'
import Dashboard from '../components/Dashboard.vue'
import UserHighlight from '../components/UserHighlight.vue'

const submittedActivities = ref([])
</script>
