export const tutorialData = {
  chapters: [
    {
      id: 'day1',
      day: 'Day 1',
      title: 'Phaser.js 基础',
      description: '学习 Phaser.js 核心概念、游戏循环和 Scene 系统',
      objectives: [
        '理解 Phaser.js 的基本架构和核心概念',
        '掌握游戏循环的工作原理',
        '学会创建和管理游戏场景',
        '实现第一个可运行的 Phaser 游戏'
      ],
      deliverables: [
        '基础的 Phaser 游戏配置',
        '简单的游戏场景',
        '基本的游戏对象渲染'
      ]
    },
    {
      id: 'day2',
      day: 'Day 2',
      title: '精灵与动画',
      description: '掌握精灵系统、纹理管理和动画播放',
      objectives: [
        '学习精灵的创建和管理',
        '掌握纹理加载和精灵图处理',
        '实现角色动画和控制',
        '处理用户输入和角色移动'
      ],
      deliverables: [
        '可控制的角色精灵',
        '流畅的角色动画',
        '响应式的用户输入系统'
      ]
    },
    {
      id: 'day3',
      day: 'Day 3',
      title: '地图与物理系统',
      description: '学习 Tilemap 系统和 Arcade Physics 物理引擎',
      objectives: [
        '掌握瓦片地图的创建和加载',
        '学习物理引擎的基本使用',
        '实现碰撞检测和响应',
        '创建重力系统和跳跃机制'
      ],
      deliverables: [
        '可交互的游戏地图',
        '物理碰撞系统',
        '平台跳跃游戏原型'
      ]
    },
    {
      id: 'day4',
      day: 'Day 4',
      title: '摄像机与场景滚动',
      description: '掌握摄像机控制和世界坐标系统',
      objectives: [
        '理解摄像机系统和视口概念',
        '实现摄像机跟随和边界限制',
        '创建多层背景滚动效果',
        '优化大型游戏世界的渲染'
      ],
      deliverables: [
        '平滑的摄像机跟随系统',
        '多层背景滚动效果',
        '大型游戏世界支持'
      ]
    },
    {
      id: 'day5',
      day: 'Day 5',
      title: '敌人与碰撞检测',
      description: '实现敌人 AI 系统和高级碰撞处理',
      objectives: [
        '创建敌人类和 AI 行为系统',
        '实现敌人的巡逻、追击和攻击逻辑',
        '处理玩家与敌人的交互',
        '优化对象管理和性能'
      ],
      deliverables: [
        '智能敌人 AI 系统',
        '完整的战斗交互',
        '高效的对象池管理'
      ]
    },
    {
      id: 'day6',
      day: 'Day 6',
      title: '音效、UI 与状态管理',
      description: '完善游戏的音频系统、用户界面和状态管理',
      objectives: [
        '集成音频系统和音效管理',
        '创建游戏 UI 界面和菜单系统',
        '实现游戏状态管理和场景切换',
        '添加数据持久化和设置保存'
      ],
      deliverables: [
        '完整的音频体验',
        '专业的 UI 界面',
        '完善的状态管理系统'
      ]
    },
    {
      id: 'day7',
      day: 'Day 7',
      title: '游戏部署与优化',
      description: '学习游戏优化技巧和部署策略',
      objectives: [
        '掌握性能优化和资源管理',
        '学习构建和部署流程',
        '实现移动端适配和响应式设计',
        '添加错误处理和调试工具'
      ],
      deliverables: [
        '优化的游戏性能',
        '完整的部署方案',
        '可发布的游戏项目'
      ]
    }
  ],
  
  metadata: {
    title: 'Phaser.js 7天游戏开发教程',
    description: '从零基础到完整游戏项目的渐进式学习路径',
    author: 'Phaser Tutorial Team',
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    totalDuration: '20-25 小时',
    difficulty: '初级到中级',
    prerequisites: [
      '基础的 HTML/CSS 知识',
      'JavaScript ES6+ 语法',
      '了解基本的编程概念'
    ],
    tools: [
      'Node.js 18+',
      'VS Code 或其他代码编辑器',
      'Git 版本控制',
      '现代浏览器（Chrome/Firefox/Safari）'
    ]
  },
  
  resources: {
    documentation: [
      {
        title: 'Phaser 官方文档',
        url: 'https://phaser.io/docs',
        description: 'Phaser.js 的官方 API 文档'
      },
      {
        title: 'Phaser 示例',
        url: 'https://phaser.io/examples',
        description: '丰富的代码示例和演示'
      }
    ],
    tools: [
      {
        title: 'Tiled Map Editor',
        url: 'https://www.mapeditor.org/',
        description: '专业的瓦片地图编辑器'
      },
      {
        title: 'Aseprite',
        url: 'https://www.aseprite.org/',
        description: '像素艺术和精灵动画制作工具'
      }
    ],
    assets: [
      {
        title: 'OpenGameArt',
        url: 'https://opengameart.org/',
        description: '免费的游戏素材资源'
      },
      {
        title: 'Freesound',
        url: 'https://freesound.org/',
        description: '免费的音效和音乐资源'
      }
    ]
  }
}