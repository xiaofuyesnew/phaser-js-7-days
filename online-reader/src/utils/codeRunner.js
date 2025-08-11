class CodeRunner {
  constructor() {
    this.templates = {
      javascript: this.getJavaScriptTemplate(),
      html: this.getHtmlTemplate(),
      css: this.getCssTemplate()
    }
  }
  
  async run(code, language, iframe) {
    try {
      const template = this.getTemplate(code, language)
      const blob = new Blob([template], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      iframe.src = url
      
      // 清理 URL
      iframe.onload = () => {
        URL.revokeObjectURL(url)
      }
      
      return true
    } catch (error) {
      console.error('代码运行失败:', error)
      this.showError(iframe, error.message)
      return false
    }
  }
  
  getTemplate(code, language) {
    switch (language) {
      case 'javascript':
        return this.getJavaScriptTemplate(code)
      case 'html':
        return this.getHtmlTemplate(code)
      case 'css':
        return this.getCssTemplate(code)
      default:
        return this.getPlainTemplate(code, language)
    }
  }
  
  getJavaScriptTemplate(code = '') {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript 代码运行结果</title>
    <style>
        body {
            font-family: 'Monaco', 'Consolas', monospace;
            margin: 0;
            padding: 20px;
            background: #f8f9fa;
            color: #333;
        }
        .console {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.5;
            max-height: 300px;
            overflow-y: auto;
        }
        .log-entry {
            margin-bottom: 5px;
            padding: 2px 0;
        }
        .log-info { color: #4fc3f7; }
        .log-warn { color: #ffb74d; }
        .log-error { color: #f48fb1; }
        .log-success { color: #81c784; }
        .canvas-container {
            margin: 20px 0;
            text-align: center;
        }
        canvas {
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
        }
        .error-message {
            background: #ffebee;
            color: #c62828;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #f44336;
            margin: 20px 0;
        }
        .success-message {
            background: #e8f5e8;
            color: #2e7d32;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #4caf50;
            margin: 20px 0;
        }
        .phaser-game {
            margin: 20px auto;
            display: block;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
</head>
<body>
    <div id="game-container"></div>
    <div class="console" id="console">
        <div class="log-entry log-info">控制台输出:</div>
    </div>

    <script>
        // 重写 console 方法以显示在页面上
        const consoleElement = document.getElementById('console');
        const originalConsole = { ...console };
        
        function addLogEntry(message, type = 'info') {
            const entry = document.createElement('div');
            entry.className = \`log-entry log-\${type}\`;
            entry.textContent = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
            consoleElement.appendChild(entry);
            consoleElement.scrollTop = consoleElement.scrollHeight;
        }
        
        console.log = (...args) => {
            originalConsole.log(...args);
            addLogEntry(args.join(' '), 'info');
        };
        
        console.warn = (...args) => {
            originalConsole.warn(...args);
            addLogEntry(args.join(' '), 'warn');
        };
        
        console.error = (...args) => {
            originalConsole.error(...args);
            addLogEntry(args.join(' '), 'error');
        };
        
        // 错误处理
        window.onerror = function(message, source, lineno, colno, error) {
            addLogEntry(\`错误: \${message} (行 \${lineno})\`, 'error');
            return true;
        };
        
        window.addEventListener('unhandledrejection', function(event) {
            addLogEntry(\`未处理的 Promise 错误: \${event.reason}\`, 'error');
        });
        
        // 成功消息
        function showSuccess(message) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = message;
            document.body.insertBefore(successDiv, consoleElement);
        }
        
        try {
            // 用户代码开始
            ${code}
            // 用户代码结束
            
            console.log('代码执行完成');
        } catch (error) {
            console.error('代码执行错误:', error.message);
        }
    </script>
</body>
</html>`
  }
  
  getHtmlTemplate(code = '') {
    // 检查是否包含完整的 HTML 文档
    if (code.includes('<!DOCTYPE') || code.includes('<html')) {
      return code
    }
    
    // 否则包装在基础模板中
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML 代码运行结果</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .demo-container {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            background: white;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
</head>
<body>
    <div class="demo-container">
        ${code}
    </div>
</body>
</html>`
  }
  
  getCssTemplate(code = '') {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS 代码运行结果</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .demo-container {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            background: white;
        }
        /* 用户 CSS 代码 */
        ${code}
    </style>
</head>
<body>
    <div class="demo-container">
        <h2>CSS 样式演示</h2>
        <p>这是一个段落，用于展示 CSS 样式效果。</p>
        <div class="demo-box">这是一个演示盒子</div>
        <button class="demo-button">演示按钮</button>
        <ul class="demo-list">
            <li>列表项 1</li>
            <li>列表项 2</li>
            <li>列表项 3</li>
        </ul>
    </div>
</body>
</html>`
  }
  
  getPlainTemplate(code, language) {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${language.toUpperCase()} 代码</title>
    <style>
        body {
            font-family: 'Monaco', 'Consolas', monospace;
            margin: 0;
            padding: 20px;
            background: #f8f9fa;
            color: #333;
        }
        .code-display {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            white-space: pre-wrap;
            font-size: 14px;
            line-height: 1.5;
        }
        .language-label {
            background: #007acc;
            color: white;
            padding: 5px 10px;
            border-radius: 4px 4px 0 0;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 0;
        }
    </style>
</head>
<body>
    <div class="language-label">${language.toUpperCase()}</div>
    <div class="code-display">${this.escapeHtml(code)}</div>
</body>
</html>`
  }
  
  showError(iframe, message) {
    const errorTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>代码运行错误</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8f9fa;
        }
        .error-container {
            background: #ffebee;
            color: #c62828;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f44336;
        }
        .error-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .error-message {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-title">代码运行错误</div>
        <div class="error-message">${this.escapeHtml(message)}</div>
    </div>
</body>
</html>`
    
    const blob = new Blob([errorTemplate], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    iframe.src = url
    
    iframe.onload = () => {
      URL.revokeObjectURL(url)
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
  
  // 检测代码类型
  detectCodeType(code) {
    if (code.includes('<!DOCTYPE') || code.includes('<html')) {
      return 'html'
    }
    if (code.includes('Phaser.Game') || code.includes('new Phaser')) {
      return 'javascript'
    }
    if (code.includes('{') && code.includes(':') && code.includes(';')) {
      return 'css'
    }
    return 'javascript' // 默认为 JavaScript
  }
  
  // 预处理代码
  preprocessCode(code, language) {
    switch (language) {
      case 'javascript':
        // 自动添加 Phaser CDN 如果代码中使用了 Phaser
        if (code.includes('Phaser') && !code.includes('phaser.min.js')) {
          return code
        }
        return code
        
      case 'html':
        // 确保 HTML 代码有基本结构
        if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
          return code
        }
        return code
        
      case 'css':
        // CSS 代码预处理
        return code
        
      default:
        return code
    }
  }
  
  // 代码验证
  validateCode(code, language) {
    const errors = []
    
    switch (language) {
      case 'javascript':
        // 基本的 JavaScript 语法检查
        try {
          new Function(code)
        } catch (error) {
          errors.push(`JavaScript 语法错误: ${error.message}`)
        }
        break
        
      case 'html':
        // 基本的 HTML 结构检查
        if (code.includes('<script>') && !code.includes('</script>')) {
          errors.push('HTML 中的 script 标签未正确闭合')
        }
        break
        
      case 'css':
        // 基本的 CSS 语法检查
        const openBraces = (code.match(/{/g) || []).length
        const closeBraces = (code.match(/}/g) || []).length
        if (openBraces !== closeBraces) {
          errors.push('CSS 中的大括号不匹配')
        }
        break
    }
    
    return errors
  }
}

export const codeRunner = new CodeRunner()