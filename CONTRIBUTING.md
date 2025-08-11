# 贡献指南

感谢您对《七天速通 Phaser.js 游戏开发》项目的关注！我们欢迎各种形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- 🎨 优化用户体验
- 🌍 翻译内容

## 📋 贡献类型

### 1. Bug 报告

如果您发现了问题，请通过 GitHub Issues 报告：

**报告模板：**
```markdown
**Bug 描述**
简要描述遇到的问题

**复现步骤**
1. 进入 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

**期望行为**
描述您期望发生的情况

**实际行为**
描述实际发生的情况

**环境信息**
- 操作系统: [例如 Windows 11]
- 浏览器: [例如 Chrome 120]
- Node.js 版本: [例如 18.17.0]
- 项目版本: [例如 v1.0.0]

**截图**
如果适用，请添加截图来帮助解释问题

**附加信息**
添加任何其他相关信息
```

### 2. 功能建议

我们欢迎新功能建议！请通过 GitHub Issues 提交：

**建议模板：**
```markdown
**功能描述**
简要描述您希望添加的功能

**问题背景**
描述这个功能要解决的问题

**解决方案**
描述您希望的解决方案

**替代方案**
描述您考虑过的其他解决方案

**附加信息**
添加任何其他相关信息、截图或示例
```

### 3. 文档改进

文档改进包括：
- 修正错别字和语法错误
- 改进代码示例
- 添加更多解释说明
- 优化教程结构
- 添加常见问题解答

### 4. 代码贡献

我们欢迎代码贡献，包括：
- Bug 修复
- 新功能实现
- 性能优化
- 代码重构
- 测试用例添加

## 🚀 开发环境搭建

### 1. Fork 项目

点击项目页面右上角的 "Fork" 按钮，将项目 fork 到您的 GitHub 账户。

### 2. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/phaser-tutorial-handbook.git
cd phaser-tutorial-handbook
```

### 3. 安装依赖

```bash
# 安装全局依赖
npm install -g pnpm

# 安装项目依赖
pnpm install

# 初始化所有子项目
node project-template/setup-project.js
```

### 4. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 5. 开发和测试

```bash
# 启动开发服务器
cd 1_starter/source
pnpm dev

# 运行测试
cd ../../testing
pnpm test

# 运行代码检查
pnpm lint
```

## 📝 代码规范

### JavaScript/ES6+ 规范

我们使用 ESLint 和 Prettier 来保持代码风格一致：

```javascript
// ✅ 推荐写法
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // 属性初始化
        this.health = 100;
        this.speed = 160;
        
        // 方法调用
        this.setupPhysics();
        this.createAnimations();
    }
    
    setupPhysics() {
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
    }
    
    update() {
        this.handleInput();
        this.updateAnimation();
    }
}

// ❌ 不推荐写法
class player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene,x,y) {
        super(scene,x,y,'player')
        this.health=100
        this.speed=160
        this.setBounce(0.2)
        this.setCollideWorldBounds(true)
    }
    update(){
        this.handleInput()
        this.updateAnimation()
    }
}
```

### 命名规范

- **类名**: PascalCase (例如: `GameScene`, `PlayerController`)
- **方法名**: camelCase (例如: `handleInput`, `createAnimations`)
- **变量名**: camelCase (例如: `playerSpeed`, `enemyCount`)
- **常量**: UPPER_SNAKE_CASE (例如: `MAX_HEALTH`, `GAME_WIDTH`)
- **文件名**: kebab-case (例如: `game-scene.js`, `player-controller.js`)

### 注释规范

```javascript
/**
 * 玩家角色类
 * 处理玩家的移动、动画和交互逻辑
 */
class Player extends Phaser.Physics.Arcade.Sprite {
    /**
     * 构造函数
     * @param {Phaser.Scene} scene - 游戏场景
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // 玩家基础属性
        this.health = 100;      // 生命值
        this.speed = 160;       // 移动速度
        this.jumpPower = 330;   // 跳跃力度
    }
    
    /**
     * 处理玩家输入
     * 根据键盘输入控制玩家移动和跳跃
     */
    handleInput() {
        const cursors = this.scene.cursors;
        
        // 左右移动
        if (cursors.left.isDown) {
            this.setVelocityX(-this.speed);
        } else if (cursors.right.isDown) {
            this.setVelocityX(this.speed);
        } else {
            this.setVelocityX(0);
        }
        
        // 跳跃（仅在地面时）
        if (cursors.up.isDown && this.body.touching.down) {
            this.setVelocityY(-this.jumpPower);
        }
    }
}
```

### 文档规范

#### README 文档结构
```markdown
# 项目标题

简要描述项目内容和目标

## 学习目标
- 目标1
- 目标2

## 核心概念
### 概念1
详细解释

### 概念2
详细解释

## 代码示例
```javascript
// 示例代码
```

## 练习题
1. 练习1描述
2. 练习2描述

## 扩展阅读
- 相关资源链接
```

#### 代码示例规范
- 每个示例都要有清晰的注释
- 提供完整可运行的代码
- 包含错误处理
- 添加使用说明

## 🔄 提交流程

### 1. 提交代码

```bash
# 添加修改的文件
git add .

# 提交修改（使用规范的提交信息）
git commit -m "feat: 添加玩家跳跃功能"

# 推送到您的 fork
git push origin feature/your-feature-name
```

### 2. 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 新功能
git commit -m "feat: 添加敌人AI系统"

# Bug修复
git commit -m "fix: 修复玩家碰撞检测问题"

# 文档更新
git commit -m "docs: 更新API文档"

# 样式修改
git commit -m "style: 统一代码格式"

# 重构
git commit -m "refactor: 重构场景管理系统"

# 测试
git commit -m "test: 添加玩家移动测试用例"

# 构建相关
git commit -m "build: 更新vite配置"
```

### 3. 创建 Pull Request

1. 访问您的 fork 页面
2. 点击 "New Pull Request"
3. 选择目标分支（通常是 `main`）
4. 填写 PR 描述

**PR 模板：**
```markdown
## 变更描述
简要描述这个PR的内容

## 变更类型
- [ ] Bug修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 样式修改
- [ ] 重构
- [ ] 测试

## 测试
- [ ] 已通过现有测试
- [ ] 已添加新测试
- [ ] 已手动测试

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已添加必要的注释
- [ ] 已更新相关文档
- [ ] 已测试所有变更

## 截图（如适用）
添加截图来展示变更效果

## 相关Issue
关闭 #issue_number
```

## 🧪 测试指南

### 运行测试

```bash
# 运行所有测试
cd testing
pnpm test

# 运行特定测试
pnpm test -- --grep "Player"

# 运行浏览器测试
pnpm test:browser

# 生成测试报告
pnpm test:report
```

### 编写测试

```javascript
// 示例测试文件: tests/player.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '../src/sprites/Player.js';

describe('Player', () => {
    let mockScene;
    let player;
    
    beforeEach(() => {
        // 创建模拟场景
        mockScene = {
            add: { existing: vi.fn() },
            physics: { add: { existing: vi.fn() } }
        };
        
        player = new Player(mockScene, 100, 100);
    });
    
    it('应该正确初始化玩家属性', () => {
        expect(player.health).toBe(100);
        expect(player.speed).toBe(160);
        expect(player.jumpPower).toBe(330);
    });
    
    it('应该正确处理伤害', () => {
        player.takeDamage(30);
        expect(player.health).toBe(70);
    });
});
```

## 📚 学习资源

### Phaser.js 相关
- [Phaser 官方文档](https://phaser.io/learn)
- [Phaser 示例](https://phaser.io/examples)
- [Phaser 社区](https://phaser.io/community)

### JavaScript/ES6+
- [MDN JavaScript 指南](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide)
- [ES6 入门教程](https://es6.ruanyifeng.com/)

### 游戏开发
- [游戏开发模式](https://gameprogrammingpatterns.com/)
- [HTML5 游戏开发](https://developer.mozilla.org/zh-CN/docs/Games)

## 🏆 贡献者认可

我们会在以下地方认可贡献者：
- README.md 贡献者列表
- 发布说明中的感谢
- 项目网站的贡献者页面

### 贡献者等级
- **🌟 核心贡献者**: 长期活跃，多次重要贡献
- **🚀 功能贡献者**: 实现重要新功能
- **🐛 Bug 猎手**: 发现并修复重要问题
- **📝 文档专家**: 显著改进项目文档
- **🎨 设计师**: 改进用户界面和体验
- **🌍 翻译者**: 提供多语言支持

## 📞 联系我们

如果您有任何问题或建议，可以通过以下方式联系我们：

- **GitHub Issues**: [提交问题](https://github.com/your-repo/phaser-tutorial-handbook/issues)
- **GitHub Discussions**: [参与讨论](https://github.com/your-repo/phaser-tutorial-handbook/discussions)
- **邮箱**: [your-email@example.com](mailto:your-email@example.com)

## 📄 许可证

通过贡献代码，您同意您的贡献将在 [MIT License](LICENSE) 下授权。

---

再次感谢您的贡献！🎉