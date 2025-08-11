# Day 3 练习题 - 地图与物理系统

> 🎯 通过这些练习，你将深入掌握Tilemap系统和物理引擎的使用

---

## 📋 练习说明

每个练习都有不同的难度等级：
- ⭐ 基础练习 - 掌握基本概念
- ⭐⭐ 进阶练习 - 需要综合运用
- ⭐⭐⭐ 挑战练习 - 考验创新能力

完成练习后，可以对照提供的解决方案检查你的实现。

---

## 练习 1: 基础Tilemap创建 ⭐

### 目标
创建一个简单的Tilemap，包含地面和平台。

### 要求
1. 程序化生成瓦片集纹理
2. 创建基础的地图数据
3. 设置地形碰撞
4. 添加玩家角色和基本控制

### 提示
```javascript
// 创建简单的地图数据
const mapData = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1]
];

// 创建Tilemap
this.map = this.make.tilemap({
    data: mapData,
    tileWidth: 32,
    tileHeight: 32
});
```

### 扩展挑战
- 添加不同类型的瓦片
- 实现瓦片的动画效果
- 添加背景层和装饰层

<details>
<summary>💡 查看解决方案</summary>

```javascript
create() {
    // 创建瓦片集
    this.createTilesetTexture();
    
    // 创建地图数据
    const mapData = this.generateSimpleMap(20, 15);
    
    // 创建Tilemap
    this.map = this.make.tilemap({
        data: mapData,
        tileWidth: 32,
        tileHeight: 32
    });
    
    const tileset = this.map.addTilesetImage('tileset');
    this.groundLayer = this.map.createLayer(0, tileset, 0, 0);
    
    // 设置碰撞
    this.groundLayer.setCollisionByProperty({ collision: true });
    
    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    
    // 设置碰撞
    this.physics.add.collider(this.player, this.groundLayer);
    
    // 输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
}

generateSimpleMap(width, height) {
    const data = [];
    for (let y = 0; y < height; y++) {
        data[y] = [];
        for (let x = 0; x < width; x++) {
            if (y > height * 0.7) {
                data[y][x] = 1; // 地面
            } else if (y > height * 0.5 && Math.random() < 0.2) {
                data[y][x] = 1; // 随机平台
            } else {
                data[y][x] = 0; // 空气
            }
        }
    }
    return data;
}
```
</details>

---

## 练习 2: 多层地图系统 ⭐⭐

### 目标
实现一个多层的地图系统，包含背景、地形、装饰等层级。

### 要求
1. 创建背景层、地形层、装饰层
2. 设置不同层的透明度和深度
3. 实现层的显示/隐藏切换
4. 添加视觉层次效果

### 提示
```javascript
// 创建多层地图
const layers = [
    { name: 'background', data: backgroundData },
    { name: 'terrain', data: terrainData },
    { name: 'decoration', data: decorationData }
];

this.map = this.make.tilemap({
    data: layers.map(layer => layer.data),
    tileWidth: 32,
    tileHeight: 32
});
```

### 扩展挑战
- 实现视差滚动效果
- 添加动态天气系统
- 创建交互式装饰元素

---

## 练习 3: 物理属性系统 ⭐⭐

### 目标
为不同类型的瓦片设置不同的物理属性。

### 要求
1. 定义瓦片的摩擦力、弹性等属性
2. 实现冰面、沙地等特殊地形效果
3. 添加液体物理模拟
4. 创建可破坏的瓦片

### 提示
```javascript
// 设置瓦片属性
const tileProperties = {
    1: { friction: 0.8, bounce: 0 },    // 普通地面
    2: { friction: 0.1, bounce: 0.2 },  // 冰面
    3: { friction: 0.4, bounce: 0 },    // 沙地
    4: { liquid: true, viscosity: 0.5 } // 水
};

// 应用属性
layer.forEachTile(tile => {
    if (tile.index > 0) {
        tile.properties = tileProperties[tile.index];
    }
});
```

---

## 练习 4: 动态地图编辑 ⭐⭐⭐

### 目标
实现运行时的地图编辑功能。

### 要求
1. 鼠标点击放置/移除瓦片
2. 不同的瓦片类型选择
3. 实时碰撞更新
4. 编辑历史记录（撤销/重做）

### 挑战
- 实现地图的保存和加载功能
- 添加地图验证系统
- 创建地图分享功能

---

## 练习 5: 程序化地图生成 ⭐⭐⭐

### 目标
使用算法程序化生成不同类型的地图。

### 要求
1. 实现平台跳跃地图生成
2. 使用细胞自动机生成洞穴
3. 实现迷宫生成算法
4. 添加地图后处理和优化

### 算法提示
```javascript
// 细胞自动机洞穴生成
generateCave(width, height) {
    let map = this.randomFill(width, height, 0.45);
    
    for (let i = 0; i < 5; i++) {
        map = this.smoothMap(map);
    }
    
    return map;
}

smoothMap(map) {
    const newMap = [];
    for (let y = 0; y < map.length; y++) {
        newMap[y] = [];
        for (let x = 0; x < map[y].length; x++) {
            const neighbors = this.countNeighbors(map, x, y);
            newMap[y][x] = neighbors >= 4 ? 1 : 0;
        }
    }
    return newMap;
}
```

---

## 🎯 综合项目: 平台跳跃关卡编辑器

### 项目描述
创建一个完整的关卡编辑器，支持地图创建、测试和分享。

### 功能要求
1. **地图编辑**: 可视化的瓦片放置和编辑
2. **物理测试**: 实时测试地图的可玩性
3. **资源管理**: 瓦片集和素材管理
4. **导入导出**: 地图数据的保存和加载
5. **验证系统**: 检查地图的合理性

### 技术要点
- 高效的地图渲染
- 实时物理模拟
- 用户界面设计
- 数据序列化
- 性能优化

---

## 📝 学习检查清单

完成练习后，请检查你是否掌握了以下知识点：

### Tilemap系统
- [ ] 理解Tilemap的基本概念和用途
- [ ] 掌握瓦片集的创建和管理
- [ ] 会使用多层地图系统
- [ ] 了解地图数据的组织方式

### 物理引擎
- [ ] 掌握Arcade Physics的基本用法
- [ ] 理解碰撞检测的原理
- [ ] 会设置物理体属性
- [ ] 了解性能优化技巧

### 高级功能
- [ ] 掌握程序化地图生成
- [ ] 理解不同地形的物理效果
- [ ] 会实现动态地图修改
- [ ] 了解地图编辑器的设计

### 性能优化
- [ ] 了解视口剔除的概念
- [ ] 掌握大地图的优化策略
- [ ] 理解内存管理的重要性
- [ ] 会使用性能监控工具

---

## 🚀 下一步学习

恭喜你完成了Day 3的所有练习！明天我们将学习：

- **摄像机系统**: 实现平滑的摄像机跟随和控制
- **场景滚动**: 创建大型游戏世界的浏览体验  
- **视口管理**: 优化大地图的渲染和更新
- **实践项目**: 制作一个完整的卷轴滚动关卡

你已经掌握了构建游戏世界的核心技术，继续加油！🗺️