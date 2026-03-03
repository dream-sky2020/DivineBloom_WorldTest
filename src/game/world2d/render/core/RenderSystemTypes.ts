import type { RenderContext } from './RenderTypes';

export type RenderPass = {
    name?: string;
    LAYER?: number;
    draw(renderer: RenderContext): void;
    enabled?(ctx: RenderContext): boolean;
};

export type LayeredRenderPass = RenderPass & {
    LAYER: number;
};

export type RenderPassList = RenderPass[];
