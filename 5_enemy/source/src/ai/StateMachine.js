// 敌人状态机
export default class EnemyStateMachine {
    constructor(enemy) {
        this.enemy = enemy
        this.currentState = null
        this.states = new Map()
        this.globalState = null
        this.previousState = null
    }
    
    // 添加状态
    addState(name, state) {
        this.states.set(name, state)
        state.owner = this.enemy
        state.stateMachine = this
    }
    
    // 切换状态
    changeState(newStateName) {
        if (!this.states.has(newStateName)) {
            console.warn(`State ${newStateName} not found`)
            return
        }
        
        // 退出当前状态
        if (this.currentState) {
            this.currentState.exit()
            this.previousState = this.currentState
        }
        
        // 进入新状态
        this.currentState = this.states.get(newStateName)
        this.currentState.enter()
    }
    
    // 更新状态机
    update(deltaTime) {
        // 更新全局状态
        if (this.globalState) {
            this.globalState.update(deltaTime)
        }
        
        // 更新当前状态
        if (this.currentState) {
            this.currentState.update(deltaTime)
        }
    }
    
    // 处理消息
    handleMessage(message) {
        if (this.currentState && this.currentState.handleMessage) {
            return this.currentState.handleMessage(message)
        }
        return false
    }
    
    // 回到上一个状态
    revertToPreviousState() {
        if (this.previousState) {
            this.changeState(this.previousState.name)
        }
    }
    
    // 检查当前状态
    isInState(stateName) {
        return this.currentState && this.currentState.name === stateName
    }
    
    // 获取当前状态名称
    getCurrentStateName() {
        return this.currentState ? this.currentState.name : 'none'
    }
}