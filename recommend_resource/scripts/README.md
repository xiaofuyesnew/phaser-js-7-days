# 游戏开发工具脚本

本目录包含了用于游戏开发资源处理的自动化脚本工具，帮助开发者快速处理音频和图像资源。

## 工具列表

### 1. 音频转换工具 (audio-converter.js)
- 批量转换音频格式
- 音频压缩和优化
- 音量标准化
- 音频信息分析

### 2. 精灵图优化工具 (sprite-optimizer.js)
- 批量优化图片
- 精灵图集生成
- 尺寸调整到2的幂次方
- 像素艺术优化

## 安装依赖

### 系统要求
- Node.js 14.0.0 或更高版本
- FFmpeg (用于音频处理)
- ImageMagick (用于图像处理)

### 安装FFmpeg

#### Windows
1. 下载FFmpeg: https://ffmpeg.org/download.html
2. 解压到任意目录 (如 C:\ffmpeg)
3. 将 C:\ffmpeg\bin 添加到系统PATH环境变量
4. 重启命令提示符，运行 `ffmpeg -version` 验证安装

#### macOS
```bash
# 使用Homebrew安装
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

### 安装ImageMagick

#### Windows
1. 下载ImageMagick: https://imagemagick.org/script/download.php#windows
2. 运行安装程序
3. 确保勾选"Install development headers and libraries for C and C++"
4. 重启命令提示符，运行 `magick -version` 验证安装

#### macOS
```bash
# 使用Homebrew安装
brew install imagemagick
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install imagemagick
```

## 使用方法

### 音频转换工具

#### 基本用法
```bash
# 显示帮助信息
node audio-converter.js help

# 批量转换音频文件
node audio-converter.js convert ./raw_audio ./processed_audio

# 优化音效文件 (单声道，22050Hz)
node audio-converter.js sfx ./sound_effects ./game_sfx

# 优化音乐文件 (立体声，44100Hz)
node audio-converter.js music ./background_music ./game_music

# 分析音频文件信息
node audio-converter.js analyze ./audio_files
```

#### 使用npm脚本
```bash
# 安装依赖
npm install

# 运行音频转换工具
npm run audio-convert -- convert ./raw_audio ./processed_audio
npm run audio-convert -- sfx ./sound_effects ./game_sfx
npm run audio-convert -- music ./background_music ./game_music
```

#### 功能说明

**convert命令**: 批量转换音频文件格式
- 支持输入格式: WAV, MP3, OGG, M4A, FLAC
- 输出格式: OGG Vorbis
- 默认质量: 4 (128kbps)
- 默认音量: 0.8

**sfx命令**: 专门优化音效文件
- 转换为单声道
- 采样率: 22050Hz
- 质量等级: 3 (96kbps)
- 音量: 0.8

**music命令**: 专门优化音乐文件
- 保持立体声
- 采样率: 44100Hz
- 质量等级: 5 (160kbps)
- 音量: 0.6

**analyze命令**: 分析音频文件信息
- 显示文件时长、大小、比特率
- 统计总时长和总大小
- 帮助评估优化效果

### 精灵图优化工具

#### 基本用法
```bash
# 显示帮助信息
node sprite-optimizer.js help

# 批量优化图片
node sprite-optimizer.js optimize ./raw_sprites ./optimized_sprites

# 创建精灵图集
node sprite-optimizer.js spritesheet ./character_frames ./character_sheet.png

# 调整到2的幂次方尺寸
node sprite-optimizer.js poweroftwo ./sprites ./power_of_two_sprites

# 像素艺术优化
node sprite-optimizer.js pixelart ./pixel_sprites ./optimized_pixel_sprites

# 分析图片信息
node sprite-optimizer.js analyze ./sprite_directory
```

#### 使用npm脚本
```bash
# 运行精灵图优化工具
npm run sprite-optimize -- optimize ./raw_sprites ./optimized_sprites
npm run sprite-optimize -- spritesheet ./character_frames ./character_sheet.png
npm run sprite-optimize -- poweroftwo ./sprites ./power_of_two_sprites
```

#### 功能说明

**optimize命令**: 批量优化图片文件
- 支持输入格式: PNG, JPG, JPEG, GIF, BMP
- 输出格式: PNG
- 默认质量: 90%
- 保持透明度

**spritesheet命令**: 创建精灵图集
- 自动排列多个图片
- 生成对应的JSON配置文件
- 支持自定义列数和间距
- 兼容Phaser.js格式

**poweroftwo命令**: 调整到2的幂次方尺寸
- 自动计算最近的2的幂次方尺寸
- 保持图片质量
- 优化GPU性能

**pixelart命令**: 像素艺术专用优化
- 保持像素完美
- 禁用抗锯齿
- 调整到2的幂次方尺寸

**analyze命令**: 分析图片信息
- 显示尺寸、大小、格式
- 统计尺寸分布
- 检查2的幂次方兼容性

## 配置选项

### 音频转换配置
可以通过修改脚本中的默认参数来自定义转换设置:

```javascript
// audio-converter.js 中的配置
this.defaultQuality = 4;     // OGG质量等级 (0-10)
this.defaultVolume = 0.8;    // 音量调整 (0.0-1.0)
```

### 精灵图优化配置
```javascript
// sprite-optimizer.js 中的配置
this.defaultQuality = 90;    // PNG压缩质量 (0-100)
```

## 批处理示例

### Windows批处理脚本 (process-assets.bat)
```batch
@echo off
echo 处理游戏资源...

echo 转换音效文件...
node audio-converter.js sfx "./raw_audio/sfx" "./assets/audio/sfx"

echo 转换音乐文件...
node audio-converter.js music "./raw_audio/music" "./assets/audio/music"

echo 优化精灵图...
node sprite-optimizer.js optimize "./raw_sprites" "./assets/sprites"

echo 创建角色精灵图集...
node sprite-optimizer.js spritesheet "./raw_sprites/character" "./assets/sprites/character.png"

echo 处理完成！
pause
```

### Linux/macOS脚本 (process-assets.sh)
```bash
#!/bin/bash
echo "处理游戏资源..."

echo "转换音效文件..."
node audio-converter.js sfx "./raw_audio/sfx" "./assets/audio/sfx"

echo "转换音乐文件..."
node audio-converter.js music "./raw_audio/music" "./assets/audio/music"

echo "优化精灵图..."
node sprite-optimizer.js optimize "./raw_sprites" "./assets/sprites"

echo "创建角色精灵图集..."
node sprite-optimizer.js spritesheet "./raw_sprites/character" "./assets/sprites/character.png"

echo "处理完成！"
```

## 故障排除

### 常见问题

#### 1. FFmpeg未找到
```
错误: 未找到FFmpeg，请先安装FFmpeg
解决方案:
1. 确认FFmpeg已正确安装
2. 检查PATH环境变量设置
3. 重启命令提示符
4. 运行 ffmpeg -version 验证
```

#### 2. ImageMagick未找到
```
错误: 未找到ImageMagick，请先安装ImageMagick
解决方案:
1. 确认ImageMagick已正确安装
2. 检查PATH环境变量设置
3. 重启命令提示符
4. 运行 magick -version 验证
```

#### 3. 权限错误
```
错误: EACCES: permission denied
解决方案:
1. 确保有读写目标目录的权限
2. 在Linux/macOS上使用sudo (如需要)
3. 检查文件是否被其他程序占用
```

#### 4. 内存不足
```
错误: JavaScript heap out of memory
解决方案:
1. 增加Node.js内存限制:
   node --max-old-space-size=4096 script.js
2. 分批处理大量文件
3. 关闭其他占用内存的程序
```

### 性能优化建议

#### 1. 批量处理优化
- 将大量文件分批处理
- 使用SSD存储提高I/O性能
- 关闭不必要的后台程序

#### 2. 并行处理
可以修改脚本支持并行处理:
```javascript
// 示例: 并行处理多个文件
const promises = files.map(file => processFileAsync(file));
await Promise.all(promises);
```

#### 3. 缓存机制
- 跳过已处理的文件
- 使用文件修改时间判断
- 实现增量处理

## 扩展开发

### 添加新的音频格式支持
```javascript
// 在audio-converter.js中添加
this.supportedFormats.push('.aac', '.wma');
```

### 添加新的图像处理功能
```javascript
// 在sprite-optimizer.js中添加新方法
addWatermark(inputPath, outputPath, watermarkPath) {
    const command = `magick "${inputPath}" "${watermarkPath}" -gravity southeast -composite "${outputPath}"`;
    execSync(command);
}
```

### 创建配置文件支持
```javascript
// 支持外部配置文件
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持音频格式转换和优化
- 支持图像优化和精灵图集生成
- 提供命令行界面

### 计划功能
- GUI界面支持
- 更多音频和图像格式支持
- 批量处理进度显示
- 配置文件支持
- 插件系统

## 贡献指南

欢迎提交问题报告和功能请求！

### 开发环境设置
1. Fork本项目
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建Pull Request

### 代码规范
- 使用ES6+语法
- 添加适当的错误处理
- 编写清晰的注释
- 遵循现有的代码风格

## 许可证

MIT License - 详见LICENSE文件