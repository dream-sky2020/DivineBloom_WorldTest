import { changeState } from '@world2d/ECSCalculateTool/AIUtils'

export const StunnedState = {
    update(entity, dt) {
        const { aiState } = entity

        if (aiState.justEntered) {
          aiState.moveDir.x = 0
          aiState.moveDir.y = 0
          aiState.colorHex = '#9ca3af' // Grayish
          aiState.starAngle = 0
          aiState.justEntered = false
        }
      
        aiState.timer -= dt
        aiState.starAngle += dt * 4
      
        if (aiState.timer <= 0) {
          changeState(entity, 'wander')
        }
    }
}
