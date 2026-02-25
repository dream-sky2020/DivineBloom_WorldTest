export interface MapBounds {
    width: number;
    height: number;
}

export interface SystemContextBase {
    engine?: any;
    input?: any;
    renderer?: any;
    gameManager?: any;
    sceneManager?: any;
    worldStore?: any;
    mapData?: any;
    mapBounds?: MapBounds | null;
}
