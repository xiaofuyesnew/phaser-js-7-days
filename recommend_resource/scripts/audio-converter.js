#!/usr/bin/env node

/**
 * 音频格式转换和优化脚本
 * 支持批量转换音频文件格式，调整音量，优化文件大小
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AudioConverter {
    constructor() {
        this.supportedFormats = ['.wav', '.mp3', '.ogg', '.m4a', '.flac'];
        this.outputFormat = 'ogg';
        this.defaultQuality = 4; // OGG质量等级 (0-10)
        this.defaultVolume = 0.8; // 音量调整 (0.0-1.0)
    }

    /**
     * 检查FFmpeg是否已安装
     */
    checkFFmpeg() {
        try {
            execSync('ffmpeg -version', { stdio: 'ignore' });
            return true;
        } catch (error) {
            console.error('错误: 未找到FFmpeg，请先安装FFmpeg');
            console.log('安装指南: https://ffmpeg.org/download.html');
            return false;
        }
    }

    /**
     * 获取音频文件信息
     */
    getAudioInfo(filePath) {
        try {
            const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
            const output = execSync(command, { encoding: 'utf8' });
            return JSON.parse(output);
        } catch (error) {
            console.error(`获取音频信息失败: ${filePath}`);
            return null;
        }
    }

    /**
     * 转换单个音频文件
     */
    convertFile(inputPath, outputPath, options = {}) {
        const {
            quality = this.defaultQuality,
            volume = this.defaultVolume,
            mono = false,
            sampleRate = null
        } = options;

        try {
            let command = `ffmpeg -i "${inputPath}"`;
            
            // 音频编码设置
            command += ` -c:a libvorbis -q:a ${quality}`;
            
            // 音量调整
            if (volume !== 1.0) {
                command += ` -filter:a "volume=${volume}"`;
            }
            
            // 声道设置
            if (mono) {
                command += ` -ac 1`;
            }
            
            // 采样率设置
            if (sampleRate) {
                command += ` -ar ${sampleRate}`;
            }
            
            // 覆盖输出文件
            command += ` -y "${outputPath}"`;
            
            console.log(`转换中: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
            execSync(command, { stdio: 'ignore' });
            
            return true;
        } catch (error) {
            console.error(`转换失败: ${inputPath}`);
            console.error(error.message);
            return false;
        }
    }

    /**
     * 批量转换音频文件
     */
    convertDirectory(inputDir, outputDir, options = {}) {
        if (!fs.existsSync(inputDir)) {
            console.error(`输入目录不存在: ${inputDir}`);
            return;
        }

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const files = fs.readdirSync(inputDir);
        const audioFiles = files.filter(file => 
            this.supportedFormats.includes(path.extname(file).toLowerCase())
        );

        if (audioFiles.length === 0) {
            console.log('未找到支持的音频文件');
            return;
        }

        console.log(`找到 ${audioFiles.length} 个音频文件`);
        
        let successCount = 0;
        let failCount = 0;

        audioFiles.forEach(file => {
            const inputPath = path.join(inputDir, file);
            const outputFile = path.basename(file, path.extname(file)) + '.ogg';
            const outputPath = path.join(outputDir, outputFile);

            if (this.convertFile(inputPath, outputPath, options)) {
                successCount++;
            } else {
                failCount++;
            }
        });

        console.log(`\n转换完成: 成功 ${successCount} 个，失败 ${failCount} 个`);
    }

    /**
     * 音效优化 (单声道，较低采样率)
     */
    optimizeForSFX(inputDir, outputDir) {
        console.log('优化音效文件...');
        this.convertDirectory(inputDir, outputDir, {
            quality: 3,
            volume: 0.8,
            mono: true,
            sampleRate: 22050
        });
    }

    /**
     * 音乐优化 (立体声，标准采样率)
     */
    optimizeForMusic(inputDir, outputDir) {
        console.log('优化音乐文件...');
        this.convertDirectory(inputDir, outputDir, {
            quality: 5,
            volume: 0.6,
            mono: false,
            sampleRate: 44100
        });
    }

    /**
     * 分析音频文件
     */
    analyzeDirectory(inputDir) {
        if (!fs.existsSync(inputDir)) {
            console.error(`目录不存在: ${inputDir}`);
            return;
        }

        const files = fs.readdirSync(inputDir);
        const audioFiles = files.filter(file => 
            this.supportedFormats.includes(path.extname(file).toLowerCase())
        );

        console.log(`\n音频文件分析报告 (${inputDir})`);
        console.log('='.repeat(50));

        let totalSize = 0;
        let totalDuration = 0;

        audioFiles.forEach(file => {
            const filePath = path.join(inputDir, file);
            const stats = fs.statSync(filePath);
            const info = this.getAudioInfo(filePath);

            if (info && info.format) {
                const duration = parseFloat(info.format.duration) || 0;
                const bitrate = parseInt(info.format.bit_rate) || 0;
                const size = stats.size;

                totalSize += size;
                totalDuration += duration;

                console.log(`${file}:`);
                console.log(`  时长: ${duration.toFixed(2)}s`);
                console.log(`  大小: ${(size / 1024).toFixed(1)}KB`);
                console.log(`  比特率: ${Math.round(bitrate / 1000)}kbps`);
                console.log('');
            }
        });

        console.log('总计:');
        console.log(`  文件数: ${audioFiles.length}`);
        console.log(`  总时长: ${totalDuration.toFixed(2)}s`);
        console.log(`  总大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log(`
音频转换工具使用说明:

基本用法:
  node audio-converter.js <命令> [选项]

命令:
  convert <输入目录> <输出目录>     批量转换音频文件
  sfx <输入目录> <输出目录>        优化音效文件
  music <输入目录> <输出目录>      优化音乐文件
  analyze <目录>                   分析音频文件信息
  help                            显示帮助信息

示例:
  node audio-converter.js convert ./raw_audio ./processed_audio
  node audio-converter.js sfx ./sound_effects ./game_sfx
  node audio-converter.js music ./background_music ./game_music
  node audio-converter.js analyze ./audio_files

支持的音频格式: ${this.supportedFormats.join(', ')}
输出格式: OGG Vorbis
        `);
    }
}

// 主程序
function main() {
    const converter = new AudioConverter();
    const args = process.argv.slice(2);

    if (args.length === 0) {
        converter.showHelp();
        return;
    }

    if (!converter.checkFFmpeg()) {
        return;
    }

    const command = args[0];

    switch (command) {
        case 'convert':
            if (args.length < 3) {
                console.error('用法: node audio-converter.js convert <输入目录> <输出目录>');
                return;
            }
            converter.convertDirectory(args[1], args[2]);
            break;

        case 'sfx':
            if (args.length < 3) {
                console.error('用法: node audio-converter.js sfx <输入目录> <输出目录>');
                return;
            }
            converter.optimizeForSFX(args[1], args[2]);
            break;

        case 'music':
            if (args.length < 3) {
                console.error('用法: node audio-converter.js music <输入目录> <输出目录>');
                return;
            }
            converter.optimizeForMusic(args[1], args[2]);
            break;

        case 'analyze':
            if (args.length < 2) {
                console.error('用法: node audio-converter.js analyze <目录>');
                return;
            }
            converter.analyzeDirectory(args[1]);
            break;

        case 'help':
        default:
            converter.showHelp();
            break;
    }
}

if (require.main === module) {
    main();
}

module.exports = AudioConverter;