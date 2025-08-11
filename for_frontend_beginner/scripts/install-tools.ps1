# 自动化开发环境安装脚本 (Windows PowerShell)
# 安装 Node.js, Git, VS Code 和必要的工具

# 设置执行策略
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# 颜色定义
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Info($message) {
    Write-ColorOutput Green "[INFO] $message"
}

function Write-Warn($message) {
    Write-ColorOutput Yellow "[WARN] $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "[ERROR] $message"
}

# 检查管理员权限
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# 检查命令是否存在
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# 安装 Chocolatey
function Install-Chocolatey {
    if (!(Test-Command "choco")) {
        Write-Info "安装 Chocolatey..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        # 刷新环境变量
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }
    else {
        Write-Info "Chocolatey 已安装"
    }
}

# 安装 Scoop (替代方案)
function Install-Scoop {
    if (!(Test-Command "scoop")) {
        Write-Info "安装 Scoop..."
        Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        irm get.scoop.sh | iex
        
        # 添加额外的 bucket
        scoop bucket add extras
    }
    else {
        Write-Info "Scoop 已安装"
    }
}

# 安装 Git
function Install-Git {
    if (!(Test-Command "git")) {
        Write-Info "安装 Git..."
        try {
            if (Test-Command "choco") {
                choco install git -y
            }
            elseif (Test-Command "scoop") {
                scoop install git
            }
            else {
                Write-Info "下载并安装 Git..."
                $gitUrl = "https://github.com/git-for-windows/git/releases/latest/download/Git-2.42.0.2-64-bit.exe"
                $gitInstaller = "$env:TEMP\git-installer.exe"
                Invoke-WebRequest -Uri $gitUrl -OutFile $gitInstaller
                Start-Process -FilePath $gitInstaller -ArgumentList "/SILENT" -Wait
                Remove-Item $gitInstaller
            }
            
            # 刷新环境变量
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        }
        catch {
            Write-Error "Git 安装失败: $($_.Exception.Message)"
        }
    }
    else {
        Write-Info "Git 已安装: $(git --version)"
    }
}

# 安装 Node.js (使用 NVS)
function Install-NodeJS {
    if (!(Test-Command "node")) {
        Write-Info "安装 Node.js..."
        
        # 安装 NVS
        if (!(Test-Command "nvs")) {
            Write-Info "安装 NVS..."
            try {
                if (Test-Command "choco") {
                    choco install nvs -y
                }
                elseif (Test-Command "scoop") {
                    scoop install nvs
                }
                else {
                    # 手动安装 NVS
                    $nvsUrl = "https://github.com/jasongin/nvs/releases/latest/download/nvs.msi"
                    $nvsInstaller = "$env:TEMP\nvs.msi"
                    Invoke-WebRequest -Uri $nvsUrl -OutFile $nvsInstaller
                    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$nvsInstaller`" /quiet" -Wait
                    Remove-Item $nvsInstaller
                }
                
                # 刷新环境变量
                $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            }
            catch {
                Write-Error "NVS 安装失败: $($_.Exception.Message)"
            }
        }
        
        # 使用 NVS 安装 Node.js
        try {
            nvs add lts
            nvs use lts
            nvs link lts
        }
        catch {
            Write-Warn "NVS 安装 Node.js 失败，尝试直接安装..."
            if (Test-Command "choco") {
                choco install nodejs -y
            }
            elseif (Test-Command "scoop") {
                scoop install nodejs
            }
        }
    }
    else {
        Write-Info "Node.js 已安装: $(node --version)"
    }
}

# 安装 pnpm
function Install-Pnpm {
    if (!(Test-Command "pnpm")) {
        Write-Info "安装 pnpm..."
        try {
            npm install -g pnpm
            
            # 配置淘宝镜像
            pnpm config set registry https://registry.npmmirror.com
        }
        catch {
            Write-Error "pnpm 安装失败: $($_.Exception.Message)"
        }
    }
    else {
        Write-Info "pnpm 已安装: $(pnpm --version)"
    }
}

# 安装 VS Code
function Install-VSCode {
    if (!(Test-Command "code")) {
        Write-Info "安装 VS Code..."
        try {
            if (Test-Command "choco") {
                choco install vscode -y
            }
            elseif (Test-Command "scoop") {
                scoop install vscode
            }
            else {
                Write-Info "下载并安装 VS Code..."
                $vscodeUrl = "https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user"
                $vscodeInstaller = "$env:TEMP\vscode-installer.exe"
                Invoke-WebRequest -Uri $vscodeUrl -OutFile $vscodeInstaller
                Start-Process -FilePath $vscodeInstaller -ArgumentList "/SILENT /mergetasks=!runcode" -Wait
                Remove-Item $vscodeInstaller
            }
            
            # 刷新环境变量
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        }
        catch {
            Write-Error "VS Code 安装失败: $($_.Exception.Message)"
        }
    }
    else {
        Write-Info "VS Code 已安装"
    }
}

# 安装 VS Code 扩展
function Install-VSCodeExtensions {
    Write-Info "安装 VS Code 扩展..."
    
    $extensions = @(
        "ms-ceintl.vscode-language-pack-zh-hans",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "ritwickdey.liveserver",
        "eamodio.gitlens",
        "pkief.material-icon-theme",
        "formulahendry.auto-rename-tag",
        "oderwat.indent-rainbow",
        "dsznajder.es7-react-js-snippets",
        "xabikos.javascriptsnippets"
    )
    
    foreach ($extension in $extensions) {
        try {
            $installed = code --list-extensions | Select-String $extension
            if ($installed) {
                Write-Info "扩展已安装: $extension"
            }
            else {
                Write-Info "安装扩展: $extension"
                code --install-extension $extension --force
            }
        }
        catch {
            Write-Warn "扩展安装失败: $extension"
        }
    }
}

# 配置 Git
function Configure-Git {
    Write-Info "配置 Git..."
    
    try {
        $gitName = git config --global user.name
        if (!$gitName) {
            $name = Read-Host "请输入您的姓名"
            git config --global user.name $name
        }
        
        $gitEmail = git config --global user.email
        if (!$gitEmail) {
            $email = Read-Host "请输入您的邮箱"
            git config --global user.email $email
        }
        
        # 设置默认编辑器为 VS Code
        git config --global core.editor "code --wait"
        
        Write-Info "Git 配置完成:"
        Write-Info "  姓名: $(git config --global user.name)"
        Write-Info "  邮箱: $(git config --global user.email)"
    }
    catch {
        Write-Error "Git 配置失败: $($_.Exception.Message)"
    }
}

# 创建开发目录
function New-DevDirectory {
    $devDir = "$env:USERPROFILE\Development"
    if (!(Test-Path $devDir)) {
        Write-Info "创建开发目录: $devDir"
        New-Item -ItemType Directory -Path $devDir -Force
    }
    
    $phaserDir = "$devDir\phaser-projects"
    if (!(Test-Path $phaserDir)) {
        Write-Info "创建 Phaser 项目目录: $phaserDir"
        New-Item -ItemType Directory -Path $phaserDir -Force
    }
}

# 验证安装
function Test-Installation {
    Write-Info "验证安装..."
    
    Write-Output "=========================================="
    Write-Output "环境检查结果:"
    Write-Output "=========================================="
    
    if (Test-Command "git") {
        Write-ColorOutput Green "✅ Git: $(git --version)"
    }
    else {
        Write-ColorOutput Red "❌ Git: 未安装"
    }
    
    if (Test-Command "node") {
        Write-ColorOutput Green "✅ Node.js: $(node --version)"
    }
    else {
        Write-ColorOutput Red "❌ Node.js: 未安装"
    }
    
    if (Test-Command "npm") {
        Write-ColorOutput Green "✅ npm: $(npm --version)"
    }
    else {
        Write-ColorOutput Red "❌ npm: 未安装"
    }
    
    if (Test-Command "pnpm") {
        Write-ColorOutput Green "✅ pnpm: $(pnpm --version)"
    }
    else {
        Write-ColorOutput Red "❌ pnpm: 未安装"
    }
    
    if (Test-Command "code") {
        Write-ColorOutput Green "✅ VS Code: 已安装"
    }
    else {
        Write-ColorOutput Red "❌ VS Code: 未安装"
    }
    
    Write-Output "=========================================="
}

# 主函数
function Main {
    Write-Output "🚀 Phaser.js 开发环境自动安装脚本 (Windows)"
    Write-Output "=========================================="
    
    # 检查管理员权限
    if (!(Test-Administrator)) {
        Write-Warn "建议以管理员身份运行此脚本以获得最佳体验"
        $continue = Read-Host "是否继续? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Info "脚本已取消"
            return
        }
    }
    
    # 选择包管理器
    Write-Info "选择包管理器:"
    Write-Output "1. Chocolatey (推荐)"
    Write-Output "2. Scoop"
    Write-Output "3. 手动安装"
    $choice = Read-Host "请选择 (1-3)"
    
    switch ($choice) {
        "1" { Install-Chocolatey }
        "2" { Install-Scoop }
        "3" { Write-Info "将使用手动安装方式" }
        default { 
            Write-Info "默认使用 Chocolatey"
            Install-Chocolatey 
        }
    }
    
    Install-Git
    Install-NodeJS
    Install-Pnpm
    Install-VSCode
    
    # 等待安装完成
    Start-Sleep -Seconds 3
    
    Install-VSCodeExtensions
    Configure-Git
    New-DevDirectory
    
    Write-Output ""
    Write-Info "🎉 开发环境安装完成！"
    Write-Output ""
    Write-Info "下一步操作:"
    Write-Info "1. 重新启动 PowerShell 或命令提示符"
    Write-Info "2. 运行环境检查: node check-environment.js"
    Write-Info "3. 创建第一个项目: node setup-project.js"
    Write-Output ""
    
    Test-Installation
    
    Write-Info "按任意键退出..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# 运行主函数
Main