import SceneExplorer from '@/interface/pages/editor/SceneExplorer.vue';
import EntityProperties from '@/interface/pages/editor/EntityProperties.vue';
import ProjectManager from '@/interface/pages/editor/ProjectManager.vue';
import EntityCreator from '@/interface/pages/editor/EntityCreator.vue';
import { markRaw } from 'vue';

export const PANEL_COMPONENTS = {
    'scene-explorer': markRaw(SceneExplorer),
    'entity-properties': markRaw(EntityProperties),
    'project-manager': markRaw(ProjectManager),
    'entity-creator': markRaw(EntityCreator)
};

export const PANEL_TITLES = {
    'scene-explorer': '场景浏览器',
    'entity-properties': '属性编辑',
    'project-manager': '项目管理',
    'entity-creator': '创建实体'
};

export const getPanelTitle = (id) => PANEL_TITLES[id] || id;
export const getPanelComponent = (id) => PANEL_COMPONENTS[id];
