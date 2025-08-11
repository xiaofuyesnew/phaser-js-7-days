// 听觉系统
export default class HearingSystem {
    constructor(owner) {
        this.owner = owner
        this.hearingRange = 150
        this.soundEvents = []
    }
    
    // 添加声音事件
    addSoundEvent(x, y, volume, type = 'generic') {
        const distance = Phaser.Math.Distance.Between(
            this.owner.x, this.owner.y, x, y
        )
        
        if (distance <= this.hearingRange * volume) {
            this.soundEvents.push({
                x, y, volume, type,
                distance,
                timestamp: Date.now()
            })
        }
    }
    
    // 获取最近的声音事件
    getLatestSound() {
        if (this.soundEvents.length === 0) return null
        
        // 清理过期的声音事件
        const now = Date.now()
        this.soundEvents = this.soundEvents.filter(
            event => now - event.timestamp < 3000
        )
        
        if (this.soundEvents.length === 0) return null
        
        // 返回最近的声音
        return this.soundEvents.reduce((latest, current) => 
            current.timestamp > latest.timestamp ? current : latest
        )
    }
    
    // 清理声音事件
    clearSounds() {
        this.soundEvents = []
    }
    
    // 设置听觉范围
    setHearingRange(range) {
        this.hearingRange = range
    }
}