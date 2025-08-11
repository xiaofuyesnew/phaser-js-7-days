# 音频制作模板和规范

## 音频制作规范

### 基础技术规范

#### 1. 音效规范
```
- 采样率: 22050 Hz (音效) / 44100 Hz (音乐)
- 位深度: 16-bit (音效) / 24-bit (音乐制作)
- 声道: 单声道 (音效) / 立体声 (音乐)
- 格式: OGG Vorbis (推荐) / MP3 / WAV
- 文件大小: 音效 < 100KB, 音乐 < 5MB
```

#### 2. 音量规范
```
- 音效峰值: -6dB 到 -3dB
- 音乐峰值: -12dB 到 -6dB
- 环境音: -18dB 到 -12dB
- 语音: -12dB 到 -6dB
```

#### 3. 文件命名规范
```
格式: [类型]_[名称]_[变体].ogg

音效示例:
- sfx_jump_01.ogg (跳跃音效变体1)
- sfx_coin_collect.ogg (收集金币音效)
- sfx_enemy_death.ogg (敌人死亡音效)

音乐示例:
- bgm_menu_loop.ogg (菜单背景音乐)
- bgm_level1_intro.ogg (关卡1开场音乐)
- bgm_boss_battle.ogg (Boss战音乐)
```

### 游戏音效分类

#### 1. 用户界面音效
```
- 按钮点击: 短促清脆的声音
- 菜单切换: 柔和的过渡音
- 确认操作: 积极正面的提示音
- 错误提示: 明显但不刺耳的警告音
```

#### 2. 游戏动作音效
```
- 角色移动: 脚步声、跳跃声
- 攻击动作: 挥舞声、撞击声
- 收集物品: 清脆的收集音
- 环境交互: 开门声、机关声
```

#### 3. 环境音效
```
- 背景环境: 风声、水声、鸟鸣
- 氛围营造: 神秘、紧张、欢快
- 空间感: 回声、混响效果
```

## 音效制作模板

### Audacity 项目模板设置

#### 1. 基础项目设置
```
项目采样率: 44100 Hz
默认采样格式: 32位浮点
立体声/单声道: 根据需要选择

推荐轨道布局:
- 轨道1: 主音效
- 轨道2: 背景/环境音
- 轨道3: 特效处理
- 轨道4: 混音参考
```

#### 2. 常用效果链
```
音效处理链:
1. 降噪 (如需要)
2. 压缩器 (平衡动态)
3. 均衡器 (频率调整)
4. 限制器 (防止过载)

音乐处理链:
1. 均衡器 (整体音色)
2. 压缩器 (动态控制)
3. 混响 (空间感)
4. 限制器 (最终输出)
```

### 音效制作步骤模板

#### 1. 跳跃音效制作
```
步骤:
1. 生成 → 音调 (频率: 400Hz, 时长: 0.1秒)
2. 效果 → 淡入淡出 → 淡出 (0.05秒)
3. 效果 → 变调 (向上弯曲)
4. 效果 → 压缩器 (比率: 3:1)
5. 导出为OGG格式

参数调整:
- 起始频率: 300-500Hz
- 结束频率: 200-400Hz
- 时长: 0.08-0.15秒
```

#### 2. 收集音效制作
```
步骤:
1. 生成 → 音调 (频率: 800Hz, 时长: 0.2秒)
2. 效果 → 变调 (向上然后向下)
3. 效果 → 混响 (房间大小: 小)
4. 效果 → 淡入淡出 → 淡出 (0.1秒)
5. 效果 → 放大 (峰值: -6dB)

音色调整:
- 明亮清脆的音色
- 适度的混响
- 快速的衰减
```

#### 3. 攻击音效制作
```
步骤:
1. 生成 → 噪音 (白噪音, 0.05秒)
2. 效果 → 高通滤波器 (频率: 2000Hz)
3. 效果 → 包络 (快速攻击, 快速衰减)
4. 叠加低频冲击音 (生成音调: 80Hz, 0.02秒)
5. 混合两个音轨

调整要点:
- 高频部分提供锐利感
- 低频部分提供冲击感
- 整体时长控制在0.1秒内
```

## 背景音乐制作模板

### LMMS 项目模板

#### 1. 基础设置
```
项目设置:
- BPM: 120 (中等节奏)
- 拍号: 4/4
- 主音量: -6dB

轨道配置:
- 鼓组轨道 (Kick, Snare, Hi-hat)
- 低音轨道 (Bass)
- 和弦轨道 (Pad/Piano)
- 主旋律轨道 (Lead)
- 特效轨道 (FX)
```

#### 2. 游戏音乐结构模板
```
菜单音乐结构:
- 前奏: 4小节
- 主题A: 8小节
- 主题B: 8小节
- 过渡: 4小节
- 循环点: 回到主题A

关卡音乐结构:
- 开场: 8小节 (非循环)
- 主循环: 16-32小节
- 紧张段: 8-16小节 (可选)
- 结束: 4-8小节 (非循环)
```

### 循环音乐制作要点

#### 1. 无缝循环技巧
```
Audacity中制作循环:
1. 确保音乐长度为整数小节
2. 使用 分析 → 节拍查找器 确定节拍
3. 在循环点使用交叉淡化
4. 测试循环播放效果

循环点选择:
- 选择音乐自然段落的结束点
- 避免在强拍或重要旋律中间切断
- 确保和声进行的连续性
```

#### 2. 动态变化设计
```
层次化设计:
- 基础层: 鼓点 + 低音 (始终播放)
- 和声层: 和弦 + 垫音 (根据情况加入)
- 旋律层: 主旋律 (高潮时加入)
- 装饰层: 特效音 (偶尔出现)

游戏状态对应:
- 平静探索: 基础层 + 部分和声层
- 遇到敌人: 加入更多和声层
- 战斗状态: 全部层次 + 更快节奏
```

## 音频优化和压缩

### 文件大小优化

#### 1. OGG Vorbis 压缩设置
```
音效压缩:
- 质量等级: 3-5 (96-160 kbps)
- 单声道输出
- 移除静音部分

音乐压缩:
- 质量等级: 5-7 (160-224 kbps)
- 立体声输出
- 保持动态范围
```

#### 2. 批量处理脚本
```bash
# 使用FFmpeg批量转换音频格式
for file in *.wav; do
    ffmpeg -i "$file" -c:a libvorbis -q:a 4 "${file%.wav}.ogg"
done

# 批量调整音量
for file in *.ogg; do
    ffmpeg -i "$file" -filter:a "volume=0.8" "normalized_${file}"
done
```

### 性能优化建议

#### 1. 音频加载策略
```javascript
// Phaser.js 音频预加载
preload() {
    // 重要音效立即加载
    this.load.audio('jump', 'assets/audio/sfx_jump.ogg');
    this.load.audio('collect', 'assets/audio/sfx_collect.ogg');
    
    // 背景音乐延迟加载
    this.load.audio('bgm', 'assets/audio/bgm_level1.ogg');
}

// 音频播放管理
create() {
    // 创建音效对象
    this.jumpSound = this.sound.add('jump', { volume: 0.6 });
    this.collectSound = this.sound.add('collect', { volume: 0.4 });
    
    // 背景音乐循环播放
    this.bgMusic = this.sound.add('bgm', { 
        volume: 0.3, 
        loop: true 
    });
    this.bgMusic.play();
}
```

#### 2. 音频池管理
```javascript
class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.soundPool = new Map();
        this.maxPoolSize = 5;
    }
    
    playSound(key, config = {}) {
        if (!this.soundPool.has(key)) {
            this.soundPool.set(key, []);
        }
        
        const pool = this.soundPool.get(key);
        let sound = pool.find(s => !s.isPlaying);
        
        if (!sound && pool.length < this.maxPoolSize) {
            sound = this.scene.sound.add(key, config);
            pool.push(sound);
        }
        
        if (sound) {
            sound.play();
        }
    }
}
```

## 质量检查清单

### 技术质量检查
- [ ] 采样率和位深度符合规范
- [ ] 音量峰值在合理范围内
- [ ] 文件格式正确
- [ ] 文件大小合理
- [ ] 循环音乐无缝连接

### 游戏集成检查
- [ ] 音效触发时机正确
- [ ] 音量平衡合适
- [ ] 不同音效不会相互干扰
- [ ] 背景音乐循环正常
- [ ] 性能表现良好

### 用户体验检查
- [ ] 音效符合游戏氛围
- [ ] 音量不会过于突兀
- [ ] 长时间游戏不会产生疲劳
- [ ] 音效有助于游戏反馈

## 常见问题解决

### 问题1: 音效播放延迟
```
原因分析:
- 音频文件过大
- 浏览器音频解码延迟
- 音频格式不兼容

解决方案:
1. 使用较小的音频文件
2. 预加载重要音效
3. 使用Web Audio API
4. 选择兼容性好的格式
```

### 问题2: 背景音乐循环有间隙
```
原因分析:
- 音频文件开头/结尾有静音
- 循环点设置不准确
- 浏览器缓冲问题

解决方案:
1. 精确剪辑音频文件
2. 使用音频编辑软件检查波形
3. 在代码中设置精确的循环点
4. 使用无缝循环的音频格式
```

### 问题3: 音效音量不一致
```
原因分析:
- 不同音效制作时音量不统一
- 缺乏音量标准化处理

解决方案:
1. 使用音量标准化工具
2. 建立音效音量规范
3. 在游戏中提供音量控制
4. 定期检查和调整音量平衡
```

## 工具脚本示例

### 音频批量处理脚本

#### 1. 音量标准化脚本 (Python)
```python
import os
from pydub import AudioSegment

def normalize_audio_files(input_dir, output_dir, target_db=-6):
    """批量标准化音频文件音量"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    for filename in os.listdir(input_dir):
        if filename.endswith(('.wav', '.mp3', '.ogg')):
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, filename)
            
            # 加载音频
            audio = AudioSegment.from_file(input_path)
            
            # 标准化音量
            normalized = audio.normalize()
            change_in_db = target_db - normalized.dBFS
            normalized = normalized + change_in_db
            
            # 导出
            normalized.export(output_path, format="ogg")
            print(f"处理完成: {filename}")

# 使用示例
normalize_audio_files("raw_audio", "processed_audio", -6)
```

#### 2. 音频格式转换脚本 (Node.js)
```javascript
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

function convertAudioFiles(inputDir, outputDir) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.readdir(inputDir, (err, files) => {
        if (err) throw err;
        
        files.forEach(file => {
            if (path.extname(file) === '.wav') {
                const inputPath = path.join(inputDir, file);
                const outputPath = path.join(outputDir, 
                    path.basename(file, '.wav') + '.ogg');
                
                ffmpeg(inputPath)
                    .audioCodec('libvorbis')
                    .audioBitrate('128k')
                    .save(outputPath)
                    .on('end', () => {
                        console.log(`转换完成: ${file}`);
                    })
                    .on('error', (err) => {
                        console.error(`转换失败: ${file}`, err);
                    });
            }
        });
    });
}

// 使用示例
convertAudioFiles('./raw_audio', './processed_audio');
```