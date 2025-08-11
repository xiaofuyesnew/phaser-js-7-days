// 状态基类
export default class State {
    constructor(name) {
        this.name = name
        this.owner = null
        this.stateMachine = null
    }
    
    // 进入状态时调用
    enter() {
        // 子类实现
    }
    
    // 每帧更新时调用
    update(deltaTime) {
        // 子类实现
    }
    
    // 退出状态时调用
    exit() {
        // 子类实现
    }
    
    // 处理消息
    handleMessage(message) {
        // 子类实现
        return false
    }
}