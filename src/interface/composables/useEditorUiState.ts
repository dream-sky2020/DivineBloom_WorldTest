import { computed, nextTick, ref, watch, type Ref } from 'vue';
import { editor, EditorInteractionController, type MenuItem } from '@/game/editor';

export type ContextMenuState = {
    show: boolean;
    x: number;
    y: number;
    items: MenuItem[];
};

type UseEditorUiStateOptions = {
    currentSystem: Ref<string>;
    onResizeCanvas: () => void;
    onToggleEditMode?: () => void;
};

export function useEditorUiState(options: UseEditorUiStateOptions) {
    const sidebarLayout = ref({ left: 0, right: 0 });
    const showSidebars = ref(false);
    const immersiveMode = ref(true);
    const resizingSidebar = ref<string | null>(null);

    const contextMenu = ref<ContextMenuState>({
        show: false,
        x: 0,
        y: 0,
        items: []
    });

    const isEditMode = computed(() => editor.editMode);

    const closeContextMenu = () => {
        contextMenu.value.show = false;
    };

    const openContextMenu = (
        e: { clientX: number; clientY: number; preventDefault: () => void },
        items: MenuItem[]
    ) => {
        e.preventDefault();
        contextMenu.value = {
            show: true,
            x: e.clientX,
            y: e.clientY,
            items
        };

        const handleOutsideClick = () => {
            closeContextMenu();
            document.removeEventListener('click', handleOutsideClick);
        };
        setTimeout(() => document.addEventListener('click', handleOutsideClick), 0);
    };

    const editorCtrl = new EditorInteractionController({
        openContextMenu: (e: any, items: MenuItem[]) => openContextMenu(e, items),
        closeContextMenu: () => closeContextMenu()
    });

    const shouldShowSidebars = computed(() => {
        if (immersiveMode.value) return false;
        return showSidebars.value;
    });

    const canvasContainerStyle = computed(() => {
        if (immersiveMode.value) {
            return { left: '0px', right: '0px' };
        }
        const isOverlay = editor.sidebarMode === 'overlay';
        return {
            left: isOverlay ? '0px' : `${sidebarLayout.value.left}px`,
            right: isOverlay ? '0px' : `${sidebarLayout.value.right}px`
        };
    });

    const showGrid = computed(() => {
        if (immersiveMode.value) return false;
        if (isEditMode.value) return true;
        return true;
    });

    const onLayoutUpdate = (layout: { left: number; right: number }) => {
        sidebarLayout.value = layout;
    };

    const toggleEditMode = () => {
        if (options.onToggleEditMode) {
            options.onToggleEditMode();
            return;
        }
        editor.toggleEditMode();
    };

    const toggleSidebars = () => {
        showSidebars.value = !showSidebars.value;
        nextTick(() => options.onResizeCanvas());
    };

    const handleContextMenu = (e: MouseEvent) => {
        if (isEditMode.value && options.currentSystem.value === 'world-map') {
            e.preventDefault();
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'F1') {
            e.preventDefault();
            immersiveMode.value = !immersiveMode.value;
            return;
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'e') {
            e.preventDefault();
            toggleEditMode();
        }
    };

    const mountKeyboardShortcuts = () => {
        window.addEventListener('keydown', handleKeyDown);
    };

    const unmountKeyboardShortcuts = () => {
        window.removeEventListener('keydown', handleKeyDown);
    };

    const stopWatchEditMode = watch(
        () => editor.editMode,
        (newVal) => {
            if (newVal) {
                showSidebars.value = true;
            }
            setTimeout(() => options.onResizeCanvas(), 0);
        }
    );

    return {
        editorCtrl,
        sidebarLayout,
        showSidebars,
        immersiveMode,
        resizingSidebar,
        isEditMode,
        shouldShowSidebars,
        canvasContainerStyle,
        showGrid,
        contextMenu,
        closeContextMenu,
        openContextMenu,
        onLayoutUpdate,
        toggleEditMode,
        toggleSidebars,
        handleContextMenu,
        mountKeyboardShortcuts,
        unmountKeyboardShortcuts,
        stopWatchEditMode
    };
}
