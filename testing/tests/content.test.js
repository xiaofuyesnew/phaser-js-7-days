import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { marked } from 'marked';

/**
 * 内容测试套件
 * 使用 Vitest 进行单元测试
 */

describe('教程内容测试', () => {
  let tutorialDirs = [];
  
  beforeAll(async () => {
    // 获取所有教程目录
    tutorialDirs = [
      '../1_starter',
      '../2_sprite', 
      '../3_tilemap',
      '../4_camera',
      '../5_enemy',
      '../6_audio_ui_status',
      '../7_deploy_review'
    ];
  });

  describe('文件结构测试', () => {
    it.each([1, 2, 3, 4, 5, 6, 7])('Day %i 应该有必需的文件', async (day) => {
      const tutorialDir = `../${day}_*`;
      const dirs = await fs.glob(tutorialDir);
      expect(dirs.length).toBeGreaterThan(0);
      
      const dir = dirs[0];
      
      // 检查 README.md
      const readmePath = path.join(dir, 'README.md');
      expect(await fs.pathExists(readmePath)).toBe(true);
      
      // 检查 source 目录
      const sourcePath = path.join(dir, 'source');
      expect(await fs.pathExists(sourcePath)).toBe(true);
    });
    
    it('每个 source 目录应该有基本的项目文件', async () => {
      for (const dir of tutorialDirs) {
        const sourcePath = path.join(dir, 'source');
        if (await fs.pathExists(sourcePath)) {
          // 检查 package.json
          const packagePath = path.join(sourcePath, 'package.json');
          expect(await fs.pathExists(packagePath)).toBe(true);
          
          // 检查 index.html
          const indexPath = path.join(sourcePath, 'index.html');
          expect(await fs.pathExists(indexPath)).toBe(true);
          
          // 检查 src/main.js
          const mainPath = path.join(sourcePath, 'src/main.js');
          expect(await fs.pathExists(mainPath)).toBe(true);
        }
      }
    });
  });

  describe('Markdown 内容测试', () => {
    it.each([1, 2, 3, 4, 5, 6, 7])('Day %i README.md 应该有正确的结构', async (day) => {
      const tutorialDir = `../${day}_*`;
      const dirs = await fs.glob(tutorialDir);
      const readmePath = path.join(dirs[0], 'README.md');
      
      if (await fs.pathExists(readmePath)) {
        const content = await fs.readFile(readmePath, 'utf-8');
        const tokens = marked.lexer(content);
        
        // 检查是否有标题
        const headings = tokens.filter(token => token.type === 'heading');
        expect(headings.length).toBeGreaterThan(0);
        
        // 检查是否有代码块
        const codeBlocks = tokens.filter(token => token.type === 'code');
        expect(codeBlocks.length).toBeGreaterThan(0);
        
        // 检查内容长度
        expect(content.length).toBeGreaterThan(500);
      }
    });
    
    it('所有代码块应该有语言标识', async () => {
      for (const dir of tutorialDirs) {
        const readmePath = path.join(dir, 'README.md');
        if (await fs.pathExists(readmePath)) {
          const content = await fs.readFile(readmePath, 'utf-8');
          const tokens = marked.lexer(content);
          const codeBlocks = tokens.filter(token => token.type === 'code');
          
          for (const block of codeBlocks) {
            if (block.text.length > 20) { // 忽略很短的代码块
              expect(block.lang).toBeTruthy();
            }
          }
        }
      }
    });
  });

  describe('代码质量测试', () => {
    it('JavaScript 文件应该有有效的语法', async () => {
      for (const dir of tutorialDirs) {
        const sourcePath = path.join(dir, 'source');
        if (await fs.pathExists(sourcePath)) {
          const jsFiles = await fs.glob('**/*.js', { cwd: sourcePath });
          
          for (const file of jsFiles) {
            const filePath = path.join(sourcePath, file);
            const code = await fs.readFile(filePath, 'utf-8');
            
            // 基本语法检查
            expect(() => {
              new Function(code);
            }).not.toThrow();
          }
        }
      }
    });
    
    it('package.json 应该有必需的依赖', async () => {
      for (const dir of tutorialDirs) {
        const packagePath = path.join(dir, 'source/package.json');
        if (await fs.pathExists(packagePath)) {
          const packageJson = await fs.readJson(packagePath);
          
          // 检查 Phaser 依赖
          expect(
            packageJson.dependencies?.phaser || 
            packageJson.devDependencies?.phaser
          ).toBeTruthy();
          
          // 检查脚本
          expect(packageJson.scripts).toBeTruthy();
        }
      }
    });
  });

  describe('内容一致性测试', () => {
    it('所有教程应该使用一致的 Phaser 版本', async () => {
      const versions = new Set();
      
      for (const dir of tutorialDirs) {
        const packagePath = path.join(dir, 'source/package.json');
        if (await fs.pathExists(packagePath)) {
          const packageJson = await fs.readJson(packagePath);
          const phaserVersion = packageJson.dependencies?.phaser || 
                               packageJson.devDependencies?.phaser;
          if (phaserVersion) {
            versions.add(phaserVersion);
          }
        }
      }
      
      // 所有版本应该相同
      expect(versions.size).toBeLessThanOrEqual(1);
    });
    
    it('所有教程应该有一致的项目结构', async () => {
      const structures = [];
      
      for (const dir of tutorialDirs) {
        const sourcePath = path.join(dir, 'source');
        if (await fs.pathExists(sourcePath)) {
          const files = await fs.glob('**/*', { cwd: sourcePath });
          const structure = files.filter(f => !f.includes('node_modules')).sort();
          structures.push(structure);
        }
      }
      
      // 检查基本文件是否存在于所有项目中
      const commonFiles = ['package.json', 'index.html', 'src/main.js'];
      
      for (const structure of structures) {
        for (const file of commonFiles) {
          expect(structure).toContain(file);
        }
      }
    });
  });

  describe('学习递进性测试', () => {
    it('教程复杂度应该逐渐递增', async () => {
      const complexities = [];
      
      for (const dir of tutorialDirs) {
        const readmePath = path.join(dir, 'README.md');
        if (await fs.pathExists(readmePath)) {
          const content = await fs.readFile(readmePath, 'utf-8');
          const tokens = marked.lexer(content);
          
          // 简单的复杂度计算
          const wordCount = content.split(/\s+/).length;
          const codeBlocks = tokens.filter(t => t.type === 'code').length;
          const complexity = wordCount / 100 + codeBlocks;
          
          complexities.push(complexity);
        }
      }
      
      // 检查是否大致递增
      for (let i = 1; i < complexities.length; i++) {
        // 允许一定的波动，但总体应该递增
        const trend = complexities.slice(0, i + 1);
        const avgEarly = trend.slice(0, Math.ceil(trend.length / 2))
          .reduce((a, b) => a + b, 0) / Math.ceil(trend.length / 2);
        const avgLate = trend.slice(Math.floor(trend.length / 2))
          .reduce((a, b) => a + b, 0) / Math.ceil(trend.length / 2);
        
        if (i > 2) { // 从第3个教程开始检查
          expect(avgLate).toBeGreaterThanOrEqual(avgEarly * 0.8); // 允许20%的波动
        }
      }
    });
  });

  describe('技术概念覆盖测试', () => {
    it('应该覆盖所有核心 Phaser.js 概念', async () => {
      const coreConcepts = [
        'Phaser.Game',
        'Scene',
        'Sprite',
        'Physics',
        'Camera',
        'Tilemap',
        'Animation',
        'Audio',
        'Input'
      ];
      
      const allContent = [];
      
      for (const dir of tutorialDirs) {
        const readmePath = path.join(dir, 'README.md');
        if (await fs.pathExists(readmePath)) {
          const content = await fs.readFile(readmePath, 'utf-8');
          allContent.push(content);
        }
      }
      
      const combinedContent = allContent.join(' ');
      
      for (const concept of coreConcepts) {
        expect(combinedContent).toContain(concept);
      }
    });
    
    it('每个教程应该引入新的概念', async () => {
      const conceptsByDay = [];
      
      const conceptPatterns = [
        /Phaser\.\w+/g,
        /\w+Scene/g,
        /\w+Sprite/g,
        /physics\.\w+/gi,
        /camera\.\w+/gi
      ];
      
      for (const dir of tutorialDirs) {
        const readmePath = path.join(dir, 'README.md');
        if (await fs.pathExists(readmePath)) {
          const content = await fs.readFile(readmePath, 'utf-8');
          const concepts = new Set();
          
          for (const pattern of conceptPatterns) {
            const matches = content.match(pattern) || [];
            matches.forEach(match => concepts.add(match));
          }
          
          conceptsByDay.push(concepts);
        }
      }
      
      // 检查每天都有一定数量的概念
      for (const concepts of conceptsByDay) {
        expect(concepts.size).toBeGreaterThan(2);
      }
    });
  });
});