<template>
  <div class="page-scroller">
    <div class="viewport-section" :class="{ 'is-resizing': !!resizingSidebar }">
      <EditorSidebars
        :show="shouldShowSidebars"
        :editor-ctrl="editorCtrl"
        @update:layout="onLayoutUpdate"
        @update:resizing="resizingSidebar = $event"
        @resize-canvas="resizeCanvas"
      />

      <GameCanvasViewport
        :immersive-mode="immersiveMode"
        :container-style="canvasContainerStyle"
        :canvas-style="canvasStyle"
        :show-grid="showGrid"
        :set-canvas-ref="setCanvasRef"
        @contextmenu="handleContextMenu"
      >
        <template #system-layer>
          <GameOverlayPanel
            :debug-info="debugInfo"
            :dialogue-store="dialogueStore"
            :world-map-ctrl="worldMapCtrl"
          />
        </template>
      </GameCanvasViewport>

      <div class="layout-spacer"></div>
    </div>

    <GameContextMenu
      :immersive-mode="immersiveMode"
      :context-menu="contextMenu"
      @close="closeContextMenu"
    />

    <DevDashboard
      v-if="!immersiveMode"
      :show-sidebars="showSidebars"
      @toggle-sidebars="toggleSidebars"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref } from 'vue';
import { world2d } from '@world2d';
import { editor } from '@/game/editor';
import { WorldMapController } from '@/game/interface/WorldMapController';
import { CanvasManager } from '@/game/interface/CanvasManager';
import DevDashboard from './DevDashboard.vue';
import EditorSidebars from './EditorSidebars.vue';
import GameCanvasViewport from './components/game-ui/GameCanvasViewport.vue';
import GameOverlayPanel from './components/game-ui/GameOverlayPanel.vue';
import GameContextMenu from './components/game-ui/GameContextMenu.vue';
import { useEditorUiState } from './composables/useEditorUiState';
import { useCanvasViewport } from './composables/useCanvasViewport';
import { useWorld2DBootstrap } from './composables/useWorld2DBootstrap';

const currentSystem = ref(world2d.state.system);
const gameCanvas = ref<HTMLCanvasElement | null>(null);
const canvasMgr = new CanvasManager('game-canvas');
const worldMapCtrl = new WorldMapController();
const debugInfo = worldMapCtrl.debugInfo;
const dialogueStore = worldMapCtrl.dialogueStore;

let resizeCanvasBridge = () => {};
const {
  editorCtrl,
  showSidebars,
  immersiveMode,
  resizingSidebar,
  shouldShowSidebars,
  canvasContainerStyle,
  showGrid,
  contextMenu,
  closeContextMenu,
  openContextMenu,
  onLayoutUpdate,
  toggleSidebars,
  handleContextMenu,
  mountKeyboardShortcuts,
  unmountKeyboardShortcuts,
  stopWatchEditMode
} = useEditorUiState({
  currentSystem,
  onResizeCanvas: () => resizeCanvasBridge(),
  onToggleEditMode: () => editor.toggleEditMode()
});

const { resizeCanvas, mountViewport, unmountViewport } = useCanvasViewport({
  canvasMgr,
  immersiveMode,
  currentSystem
});
resizeCanvasBridge = resizeCanvas;

const { mountWorld2D, unmountWorld2D } = useWorld2DBootstrap({
  gameCanvas,
  currentSystem,
  dialogueStore,
  worldMapCtrl,
  editorCtrl
});

provide('editorContextMenu', { openContextMenu, closeContextMenu });

const canvasStyle = computed(() => {
  return {
    opacity: 1,
    visibility: 'visible' as const
  };
});

const setCanvasRef = (el: Element | null) => {
  gameCanvas.value = el as HTMLCanvasElement | null;
};

onMounted(async () => {
  mountViewport();
  mountKeyboardShortcuts();
  await mountWorld2D();
});

onUnmounted(() => {
  stopWatchEditMode();
  unmountKeyboardShortcuts();
  unmountViewport();
  unmountWorld2D();
});
</script>

<style scoped src="@styles/pages/GameUI.css"></style>
<style src="@styles/ui/ContextMenu.css"></style>
