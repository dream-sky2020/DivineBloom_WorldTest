import { z } from 'zod';

/**
 * 场景入口点
 */
export interface SceneEntryPoint {
  x: number;
  y: number;
}

/**
 * 场景配置 (基础元信息)
 */
export interface SceneConfig {
  id: string;
  name: string;
  entryPoints: Record<string, SceneEntryPoint>;
  [key: string]: any;
}

/**
 * 场景包头
 */
export interface SceneHeader {
  version: string;
  config: SceneConfig;
}

/**
 * 场景实体数据 (Bundle)
 */
export interface SceneBundle {
  header: SceneHeader;
  entities: Array<Record<string, any>>;
}

/**
 * 系统编排：和 WorldScene 的阶段保持一致
 */
export interface SceneSystemGraph {
  core?: string[];
  logic?: {
    sense?: string[];
    intent?: string[];
    decision?: string[];
    control?: string[];
    physics?: string[];
    lifecycle?: string[];
    execution?: string[];
  };
  render?: string[];
  editor?: {
    sense?: string[];
    interaction?: string[];
    render?: string[];
  };
}

/**
 * 场景定义接口
 * - 支持动态选择系统
 * - 支持场景数据的序列化/反序列化
 */
export interface IScene<TSchema extends z.ZodType = z.ZodTypeAny> {
  id: string;
  name: string;
  version: string;
  schema?: TSchema;

  systems: SceneSystemGraph;
  bundle: SceneBundle;

  /**
   * 可选钩子：在场景加载前/后执行
   */
  onBeforeLoad?: (bundle: SceneBundle) => void;
  onAfterLoad?: (bundle: SceneBundle) => void;

  /**
   * 可选钩子：序列化前/后
   */
  onBeforeSerialize?: (bundle: SceneBundle) => void;
  onAfterSerialize?: (bundle: SceneBundle) => void;
}
