<script setup>
import GameUI from '@/components/pages/GameUI.vue';
</script>

<template>
  <GameUI />
</template>

<style>
/* Global Reset / Base Styles */
body {
  margin: 0;
  padding: 0;
  background-color: #0f172a;
  color: white;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  overflow: hidden; /* Prevent body scroll, handled by GameUI */
}

/* Custom Scrollbar for Webkit */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #1e293b; 
}
::-webkit-scrollbar-thumb {
  background: #475569; 
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #64748b; 
}
</style>
