import type { RenderContext, RenderPass, RenderPassList } from '../core';

export class RenderPipeline {
    private passes: RenderPassList = [];

    constructor(initialPasses: RenderPassList = []) {
        this.setPasses(initialPasses);
    }

    setPasses(passes: RenderPassList) {
        this.passes = Array.isArray(passes) ? [...passes] : [];
        this.sort();
    }

    addPass(pass: RenderPass) {
        if (!pass) return;
        this.passes.push(pass);
        this.sort();
    }

    removePassByName(name: string) {
        this.passes = this.passes.filter((pass) => pass?.name !== name);
    }

    sort() {
        this.passes.sort((a, b) => (a?.LAYER || 0) - (b?.LAYER || 0));
    }

    render(renderer: RenderContext) {
        for (const pass of this.passes) {
            if (!pass || typeof pass.draw !== 'function') continue;
            if (typeof pass.enabled === 'function' && !pass.enabled(renderer)) {
                continue;
            }
            pass.draw(renderer);
        }
    }

    getPasses(): RenderPassList {
        return this.passes;
    }
}
