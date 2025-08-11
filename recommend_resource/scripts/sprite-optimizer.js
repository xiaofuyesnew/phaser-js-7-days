#!/usr/bin/env node

/**
 * 精灵图优化和处理脚本
 * 支持图片压缩、格式转换、精灵图集生成等功能
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SpriteOptimizer {
    constructor() {
        this.supportedFormats = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];
        this.outputFormat = 'png';
        this.defaultQuality = 90; // PNG压缩质量
    }

    /**
     * 检查ImageMagick是否已安装
     */
    checkImageMagick() {
        try {
            execSync('magick -version', { stdio: 'ignore' });
            return true;
        } catch (error) {
            try {
                execSync('convert -version', { stdio: 'ignore' });
                return true;
            } catch (error2) {
                console.error('错误: 未找到ImageMagick，请先安装ImageMagick');
                console.log('安装指南: https://imagemagick.org/script/download.php');
                return false;
            }
        }
    }

    /**
     * 获取图片信息
     */
    getImageInfo(filePath) {
        try {
            const command = `magick identify -format "%wx%h %b %m" "${filePath}"`;
            const output = execSync(command, { encoding: 'utf8' }).trim();
            const [dimensions, size, format] = output.split(' ');
            const [width, height] = dimensions.split('x').map(Number);
            
            return {
                width,
                height,
                size,
                format,
                path: filePath
            };
        } catch (error) {
            console.error(`获取图片信息失败: ${filePath}`);
            return null;
        }
    }

    /**
     * 优化单个图片文件
     */
    optimizeImage(inputPath, outputPath, options = {}) {
        const {
            width = null,
            height = null,
            quality = this.defaultQuality,
            removeAlpha = false,
            powerOfTwo = false
        } = options;

        try {
            let command = `magick "${inputPath}"`;
            
            // 尺寸调整
            if (width && height) {
                command += ` -resize ${width}x${height}!`;
            } else if (width) {
                command += ` -resize ${width}x`;
            } else if (height) {
                command += ` -resize x${height}`;
            }
            
            // 2的幂次方尺寸调整
            if (powerOfTwo) {
                const info = this.getImageInfo(inputPath);
                if (info) {
                    const newWidth = this.nearestPowerOfTwo(info.width);
                    const newHeight = this.nearestPowerOfTwo(info.height);
                    command += ` -resize ${newWidth}x${newHeight}!`;
                }
            }
            
            // 移除透明通道
            if (removeAlpha) {
                command += ` -background white -alpha remove`;
            }
            
            // 质量设置
            command += ` -quality ${quality}`;
            
            // 输出文件
            command += ` "${outputPath}"`;
            
            console.log(`优化中: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
            execSync(command, { stdio: 'ignore' });
            
            return true;
        } catch (error) {
            console.error(`优化失败: ${inputPath}`);
            console.error(error.message);
            return false;
        }
    }

    /**
     * 批量优化图片
     */
    optimizeDirectory(inputDir, outputDir, options = {}) {
        if (!fs.existsSync(inputDir)) {
            console.error(`输入目录不存在: ${inputDir}`);
            return;
        }

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const files = fs.readdirSync(inputDir);
        const imageFiles = files.filter(file => 
            this.supportedFormats.includes(path.extname(file).toLowerCase())
        );

        if (imageFiles.length === 0) {
            console.log('未找到支持的图片文件');
            return;
        }

        console.log(`找到 ${imageFiles.length} 个图片文件`);
        
        let successCount = 0;
        let failCount = 0;

        imageFiles.forEach(file => {
            const inputPath = path.join(inputDir, file);
            const outputFile = path.basename(file, path.extname(file)) + '.png';
            const outputPath = path.join(outputDir, outputFile);

            if (this.optimizeImage(inputPath, outputPath, options)) {
                successCount++;
            } else {
                failCount++;
            }
        });

        console.log(`\n优化完成: 成功 ${successCount} 个，失败 ${failCount} 个`);
    }

    /**
     * 创建精灵图集
     */
    createSpriteSheet(inputDir, outputPath, options = {}) {
        const {
            columns = 4,
            padding = 2,
            backgroundColor = 'transparent'
        } = options;

        if (!fs.existsSync(inputDir)) {
            console.error(`输入目录不存在: ${inputDir}`);
            return;
        }

        const files = fs.readdirSync(inputDir);
        const imageFiles = files.filter(file => 
            this.supportedFormats.includes(path.extname(file).toLowerCase())
        ).sort();

        if (imageFiles.length === 0) {
            console.log('未找到图片文件');
            return;
        }

        try {
            // 构建ImageMagick命令
            const inputPaths = imageFiles.map(file => `"${path.join(inputDir, file)}"`).join(' ');
            const command = `magick ${inputPaths} -background ${backgroundColor} -geometry +${padding}+${padding} -tile ${columns}x "${outputPath}"`;
            
            console.log(`创建精灵图集: ${imageFiles.length} 个文件 -> ${path.basename(outputPath)}`);
            execSync(command, { stdio: 'ignore' });
            
            // 生成JSON配置文件
            this.generateSpriteSheetJSON(inputDir, outputPath, imageFiles, options);
            
            console.log('精灵图集创建完成');
            return true;
        } catch (error) {
            console.error('创建精灵图集失败');
            console.error(error.message);
            return false;
        }
    }

    /**
     * 生成精灵图集JSON配置
     */
    generateSpriteSheetJSON(inputDir, outputPath, imageFiles, options) {
        const { columns = 4, padding = 2 } = options;
        
        // 获取第一个图片的尺寸作为基准
        const firstImagePath = path.join(inputDir, imageFiles[0]);
        const firstImageInfo = this.getImageInfo(firstImagePath);
        
        if (!firstImageInfo) {
            console.error('无法获取图片尺寸信息');
            return;
        }

        const frameWidth = firstImageInfo.width;
        const frameHeight = firstImageInfo.height;
        
        const jsonData = {
            frames: {},
            meta: {
                app: "SpriteOptimizer",
                version: "1.0",
                image: path.basename(outputPath),
                format: "RGBA8888",
                size: {
                    w: columns * (frameWidth + padding * 2),
                    h: Math.ceil(imageFiles.length / columns) * (frameHeight + padding * 2)
                },
                scale: "1"
            }
        };

        imageFiles.forEach((file, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            const x = col * (frameWidth + padding * 2) + padding;
            const y = row * (frameHeight + padding * 2) + padding;
            
            const frameName = path.basename(file, path.extname(file));
            jsonData.frames[frameName] = {
                frame: { x, y, w: frameWidth, h: frameHeight },
                rotated: false,
                trimmed: false,
                spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
                sourceSize: { w: frameWidth, h: frameHeight }
            };
        });

        const jsonPath = outputPath.replace(/\.[^/.]+$/, '.json');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        console.log(`JSON配置文件已生成: ${path.basename(jsonPath)}`);
    }

    /**
     * 调整图片到2的幂次方尺寸
     */
    nearestPowerOfTwo(value) {
        return Math.pow(2, Math.ceil(Math.log2(value)));
    }

    /**
     * 批量调整图片尺寸到2的幂次方
     */
    makePowerOfTwo(inputDir, outputDir) {
        console.log('调整图片尺寸到2的幂次方...');
        this.optimizeDirectory(inputDir, outputDir, {
            powerOfTwo: true,
            quality: 100
        });
    }

    /**
     * 创建像素艺术优化版本
     */
    optimizePixelArt(inputDir, outputDir) {
        console.log('优化像素艺术...');
        this.optimizeDirectory(inputDir, outputDir, {
            quality: 100,
            powerOfTwo: true
        });
    }

    /**
     * 分析图片目录
     */
    analyzeDirectory(inputDir) {
        if (!fs.existsSync(inputDir)) {
            console.error(`目录不存在: ${inputDir}`);
            return;
        }

        const files = fs.readdirSync(inputDir);
        const imageFiles = files.filter(file => 
            this.supportedFormats.includes(path.extname(file).toLowerCase())
        );

        console.log(`\n图片文件分析报告 (${inputDir})`);
        console.log('='.repeat(60));

        let totalSize = 0;
        const dimensions = new Map();
        const formats = new Map();

        imageFiles.forEach(file => {
            const filePath = path.join(inputDir, file);
            const stats = fs.statSync(filePath);
            const info = this.getImageInfo(filePath);

            if (info) {
                totalSize += stats.size;
                
                const dimKey = `${info.width}x${info.height}`;
                dimensions.set(dimKey, (dimensions.get(dimKey) || 0) + 1);
                formats.set(info.format, (formats.get(info.format) || 0) + 1);

                console.log(`${file}:`);
                console.log(`  尺寸: ${info.width}x${info.height}`);
                console.log(`  大小: ${(stats.size / 1024).toFixed(1)}KB`);
                console.log(`  格式: ${info.format}`);
                
                // 检查是否为2的幂次方
                const isPowerOfTwo = this.isPowerOfTwo(info.width) && this.isPowerOfTwo(info.height);
                if (!isPowerOfTwo) {
                    const newWidth = this.nearestPowerOfTwo(info.width);
                    const newHeight = this.nearestPowerOfTwo(info.height);
                    console.log(`  建议尺寸: ${newWidth}x${newHeight} (2的幂次方)`);
                }
                console.log('');
            }
        });

        console.log('统计信息:');
        console.log(`  文件数: ${imageFiles.length}`);
        console.log(`  总大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
        
        console.log('\n尺寸分布:');
        for (const [dim, count] of dimensions.entries()) {
            console.log(`  ${dim}: ${count} 个文件`);
        }
        
        console.log('\n格式分布:');
        for (const [format, count] of formats.entries()) {
            console.log(`  ${format}: ${count} 个文件`);
        }
    }

    /**
     * 检查是否为2的幂次方
     */
    isPowerOfTwo(value) {
        return value > 0 && (value & (value - 1)) === 0;
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log(`
精灵图优化工具使用说明:

基本用法:
  node sprite-optimizer.js <命令> [选项]

命令:
  optimize <输入目录> <输出目录>      批量优化图片
  spritesheet <输入目录> <输出文件>  创建精灵图集
  poweroftwo <输入目录> <输出目录>   调整到2的幂次方尺寸
  pixelart <输入目录> <输出目录>     像素艺术优化
  analyze <目录>                     分析图片信息
  help                              显示帮助信息

示例:
  node sprite-optimizer.js optimize ./raw_sprites ./optimized_sprites
  node sprite-optimizer.js spritesheet ./character_frames ./character_sheet.png
  node sprite-optimizer.js poweroftwo ./sprites ./power_of_two_sprites
  node sprite-optimizer.js analyze ./sprite_directory

支持的图片格式: ${this.supportedFormats.join(', ')}
输出格式: PNG
        `);
    }
}

// 主程序
function main() {
    const optimizer = new SpriteOptimizer();
    const args = process.argv.slice(2);

    if (args.length === 0) {
        optimizer.showHelp();
        return;
    }

    if (!optimizer.checkImageMagick()) {
        return;
    }

    const command = args[0];

    switch (command) {
        case 'optimize':
            if (args.length < 3) {
                console.error('用法: node sprite-optimizer.js optimize <输入目录> <输出目录>');
                return;
            }
            optimizer.optimizeDirectory(args[1], args[2]);
            break;

        case 'spritesheet':
            if (args.length < 3) {
                console.error('用法: node sprite-optimizer.js spritesheet <输入目录> <输出文件>');
                return;
            }
            optimizer.createSpriteSheet(args[1], args[2]);
            break;

        case 'poweroftwo':
            if (args.length < 3) {
                console.error('用法: node sprite-optimizer.js poweroftwo <输入目录> <输出目录>');
                return;
            }
            optimizer.makePowerOfTwo(args[1], args[2]);
            break;

        case 'pixelart':
            if (args.length < 3) {
                console.error('用法: node sprite-optimizer.js pixelart <输入目录> <输出目录>');
                return;
            }
            optimizer.optimizePixelArt(args[1], args[2]);
            break;

        case 'analyze':
            if (args.length < 2) {
                console.error('用法: node sprite-optimizer.js analyze <目录>');
                return;
            }
            optimizer.analyzeDirectory(args[1]);
            break;

        case 'help':
        default:
            optimizer.showHelp();
            break;
    }
}

if (require.main === module) {
    main();
}

module.exports = SpriteOptimizer;