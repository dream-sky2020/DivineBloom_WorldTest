export const DebugPalette = {
    vision: {
        chaseFillColor: 'rgb(239, 68, 68)',
        chaseFillAlpha: 0.25,
        chaseStrokeColor: 'rgba(239, 68, 68, 0.95)',
        fleeFillColor: 'rgb(25, 25, 112)',
        fleeFillAlpha: 0.25,
        fleeStrokeColor: 'rgba(25, 25, 112, 0.95)',
        defaultFillColor: 'rgb(234, 179, 8)',
        defaultFillAlpha: 0.15,
        defaultStrokeColor: 'rgba(234, 179, 8, 0.9)',
        strokeWidth: 2
    },
    aiPatrol: {
        rangeStroke: 'rgba(34, 197, 94, 0.4)',
        homeFill: 'rgba(34, 197, 94, 0.8)',
        linkStroke: 'rgba(34, 197, 94, 0.2)',
        moveDirStroke: 'rgba(255, 255, 255, 0.6)',
        portalStroke: 'rgba(147, 51, 234, 0.5)',
        rangeDash: [5, 5] as number[],
        linkDash: [2, 2] as number[],
        portalDash: [4, 4] as number[]
    },
    detectArea: {
        triggeredStroke: 'rgba(239, 68, 68, 0.8)',
        triggeredFill: 'rgba(239, 68, 68, 0.2)',
        defaultStroke: 'rgba(34, 211, 238, 0.6)',
        defaultFill: 'rgba(34, 211, 238, 0.1)',
        lineWidth: 1
    },
    physics: {
        staticStroke: 'rgba(255, 0, 0, 0.8)',
        staticFill: 'rgba(255, 0, 0, 0.2)',
        dynamicStroke: 'rgba(0, 255, 255, 0.8)',
        dynamicFill: 'rgba(0, 255, 255, 0.2)',
        lineWidth: 1
    },
    portal: {
        triggered: '#ff1f45',
        idle: '#00e5ff',
        triggeredFill: 'rgba(255, 31, 69, 0.35)',
        idleFill: 'rgba(0, 229, 255, 0.26)',
        destinationColor: '#ffd400',
        destinationFill: 'rgba(255, 212, 0, 0.32)',
        destinationTextOutline: '#111111',
        destinationStrokeWidth: 3,
        lineToDestination: '#22c55e',
        lineToCoord: '#ff8a00',
        lineDash: [8, 4] as number[],
        crossSize: 10
    },
    spawn: {
        enabledStroke: 'rgba(34, 197, 94, 0.9)',
        enabledFill: 'rgba(34, 197, 94, 0.18)',
        disabledStroke: 'rgba(107, 114, 128, 0.9)',
        disabledFill: 'rgba(107, 114, 128, 0.16)',
        labelEnabled: '#22c55e',
        labelDisabled: '#6b7280',
        mainDash: [6, 4] as number[],
        refDash: [3, 3] as number[]
    },
    weapon: {
        direction: 'rgba(59, 130, 246, 0.8)',
        lineWidth: 2
    }
} as const;
