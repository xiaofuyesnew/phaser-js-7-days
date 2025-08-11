#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import fs from 'fs-extra'
import path from 'path'
import { PDFGenerator } from './generator.js'

const program = new Command()

program
  .name('pdf-generator')
  .description('Phaser.js 教程 PDF 生成工具')
  .version('1.0.0')

// 单文件生成命令
program
  .command('single <input> <output>')
  .description('从单个 Markdown 文件生成 PDF')
  .option('-t, --title <title>', '文档标题')
  .option('-a, --author <author>', '作者名称')
  .option('--format <format>', 'PDF 格式 (A4, Letter)', 'A4')
  .option('--margin <margin>', '页边距 (如: 2cm)', '2cm')
  .option('--no-header', '不显示页眉')
  .option('--no-footer', '不显示页脚')
  .action(async (input, output, options) => {
    const spinner = ora('正在生成 PDF...').start()
    
    try {
      // 检查输入文件
      if (!await fs.pathExists(input)) {
        throw new Error(`输入文件不存在: ${input}`)
      }
      
      // 确保输出目录存在
      await fs.ensureDir(path.dirname(output))
      
      const generator = new PDFGenerator({
        format: options.format,
        margin: parseMargin(options.margin),
        displayHeaderFooter: options.header !== false,
      })
      
      await generator.generateFromMarkdown(input, output, {
        title: options.title,
        author: options.author
      })
      
      const stats = await generator.getGenerationStats(output)
      
      spinner.succeed(chalk.green('PDF 生成成功!'))
      console.log(chalk.blue(`输出文件: ${output}`))
      if (stats) {
        console.log(chalk.gray(`文件大小: ${stats.sizeFormatted}`))
      }
      
      await generator.close()
    } catch (error) {
      spinner.fail(chalk.red('PDF 生成失败'))
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })

// 多文件合并生成命令
program
  .command('merge <output>')
  .description('合并多个 Markdown 文件生成 PDF')
  .option('-i, --input <files...>', '输入文件列表')
  .option('-d, --dir <directory>', '输入目录（自动查找 .md 文件）')
  .option('-t, --title <title>', '文档标题', 'Phaser.js 教程小册')
  .option('-a, --author <author>', '作者名称', 'Phaser Tutorial Team')
  .option('--format <format>', 'PDF 格式 (A4, Letter)', 'A4')
  .option('--margin <margin>', '页边距 (如: 2cm)', '2cm')
  .action(async (output, options) => {
    const spinner = ora('正在合并生成 PDF...').start()
    
    try {
      let inputFiles = []
      
      if (options.input) {
        inputFiles = options.input
      } else if (options.dir) {
        // 从目录中查找 Markdown 文件
        const files = await fs.readdir(options.dir)
        inputFiles = files
          .filter(file => file.endsWith('.md'))
          .map(file => path.join(options.dir, file))
          .sort()
      } else {
        throw new Error('请指定输入文件或目录')
      }
      
      if (inputFiles.length === 0) {
        throw new Error('没有找到 Markdown 文件')
      }
      
      // 检查所有输入文件
      for (const file of inputFiles) {
        if (!await fs.pathExists(file)) {
          throw new Error(`输入文件不存在: ${file}`)
        }
      }
      
      // 确保输出目录存在
      await fs.ensureDir(path.dirname(output))
      
      const generator = new PDFGenerator({
        format: options.format,
        margin: parseMargin(options.margin)
      })
      
      await generator.generateFromMultipleMarkdown(inputFiles, output, {
        title: options.title,
        author: options.author
      })
      
      const stats = await generator.getGenerationStats(output)
      
      spinner.succeed(chalk.green('PDF 合并生成成功!'))
      console.log(chalk.blue(`输出文件: ${output}`))
      console.log(chalk.gray(`合并文件数: ${inputFiles.length}`))
      if (stats) {
        console.log(chalk.gray(`文件大小: ${stats.sizeFormatted}`))
      }
      
      await generator.close()
    } catch (error) {
      spinner.fail(chalk.red('PDF 合并生成失败'))
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })

// 教程专用生成命令
program
  .command('tutorial <tutorialDir> <output>')
  .description('生成完整的 Phaser.js 教程 PDF')
  .option('-t, --title <title>', '教程标题', 'Phaser.js 7天游戏开发教程')
  .option('-a, --author <author>', '作者名称', 'Phaser Tutorial Team')
  .option('-v, --version <version>', '版本号', '1.0.0')
  .option('--format <format>', 'PDF 格式 (A4, Letter)', 'A4')
  .option('--margin <margin>', '页边距 (如: 2cm)', '2cm')
  .action(async (tutorialDir, output, options) => {
    const spinner = ora('正在生成教程 PDF...').start()
    
    try {
      // 检查教程目录
      if (!await fs.pathExists(tutorialDir)) {
        throw new Error(`教程目录不存在: ${tutorialDir}`)
      }
      
      // 确保输出目录存在
      await fs.ensureDir(path.dirname(output))
      
      const generator = new PDFGenerator({
        format: options.format,
        margin: parseMargin(options.margin)
      })
      
      await generator.generateTutorialPDF(tutorialDir, output, {
        title: options.title,
        author: options.author,
        version: options.version
      })
      
      const stats = await generator.getGenerationStats(output)
      
      spinner.succeed(chalk.green('教程 PDF 生成成功!'))
      console.log(chalk.blue(`输出文件: ${output}`))
      if (stats) {
        console.log(chalk.gray(`文件大小: ${stats.sizeFormatted}`))
      }
      
      await generator.close()
    } catch (error) {
      spinner.fail(chalk.red('教程 PDF 生成失败'))
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })

// 批量生成命令
program
  .command('batch <configFile>')
  .description('根据配置文件批量生成 PDF')
  .action(async (configFile) => {
    const spinner = ora('正在批量生成 PDF...').start()
    
    try {
      // 读取配置文件
      if (!await fs.pathExists(configFile)) {
        throw new Error(`配置文件不存在: ${configFile}`)
      }
      
      const config = await fs.readJson(configFile)
      const generator = new PDFGenerator(config.options || {})
      
      const results = await generator.generateBatch(config.tasks || [])
      
      let successCount = 0
      let failCount = 0
      
      for (const result of results) {
        if (result.success) {
          successCount++
          console.log(chalk.green(`✓ ${result.task.output}`))
        } else {
          failCount++
          console.log(chalk.red(`✗ ${result.task.output}: ${result.error}`))
        }
      }
      
      await generator.close()
      
      if (failCount === 0) {
        spinner.succeed(chalk.green(`批量生成完成! 成功: ${successCount}`))
      } else {
        spinner.warn(chalk.yellow(`批量生成完成! 成功: ${successCount}, 失败: ${failCount}`))
      }
    } catch (error) {
      spinner.fail(chalk.red('批量生成失败'))
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })

// 创建配置文件命令
program
  .command('init [configFile]')
  .description('创建配置文件模板')
  .action(async (configFile = 'pdf-config.json') => {
    try {
      if (await fs.pathExists(configFile)) {
        console.log(chalk.yellow(`配置文件已存在: ${configFile}`))
        return
      }
      
      const config = {
        options: {
          format: 'A4',
          margin: {
            top: '2cm',
            right: '2cm',
            bottom: '2cm',
            left: '2cm'
          },
          displayHeaderFooter: true,
          printBackground: true
        },
        tasks: [
          {
            type: 'single',
            input: 'example.md',
            output: 'output/example.pdf',
            options: {
              title: '示例文档',
              author: '作者名称'
            }
          },
          {
            type: 'tutorial',
            tutorialDir: './tutorial',
            output: 'output/tutorial.pdf',
            options: {
              title: 'Phaser.js 7天游戏开发教程',
              author: 'Phaser Tutorial Team',
              version: '1.0.0'
            }
          }
        ]
      }
      
      await fs.writeJson(configFile, config, { spaces: 2 })
      console.log(chalk.green(`配置文件创建成功: ${configFile}`))
    } catch (error) {
      console.error(chalk.red(`创建配置文件失败: ${error.message}`))
      process.exit(1)
    }
  })

// 辅助函数
function parseMargin(marginStr) {
  if (typeof marginStr === 'object') return marginStr
  
  return {
    top: marginStr,
    right: marginStr,
    bottom: marginStr,
    left: marginStr
  }
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('未处理的 Promise 错误:'), reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error(chalk.red('未捕获的异常:'), error)
  process.exit(1)
})

// 解析命令行参数
program.parse()

// 如果没有提供命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp()
}