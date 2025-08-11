#!/usr/bin/env node

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

class DomainManager {
    constructor() {
        this.config = {
            domain: null,
            subdomain: null,
            provider: null,
            sslEnabled: true,
            cdnEnabled: true
        };
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        
        console.log(`${colors[type]}${message}${colors.reset}`);
    }

    // 验证域名格式
    validateDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    }

    // 检查域名可用性
    async checkDomainAvailability(domain) {
        try {
            const result = execSync(`nslookup ${domain}`, { encoding: 'utf8' });
            return result.includes('NXDOMAIN') ? 'available' : 'taken';
        } catch (error) {
            return 'unknown';
        }
    }

    // 生成 CNAME 文件
    generateCNAME(domain) {
        const cnamePath = join(rootDir, 'dist', 'CNAME');
        writeFileSync(cnamePath, domain);
        this.log(`✅ 创建 CNAME 文件: ${domain}`);
    }

    // 配置 GitHub Pages 自定义域名
    configureGitHubPages(domain) {
        this.log('🔧 配置 GitHub Pages 自定义域名...');
        
        try {
            // 创建 CNAME 文件
            this.generateCNAME(domain);
            
            // 更新 GitHub 仓库设置（需要 GitHub CLI）
            try {
                execSync(`gh api repos/:owner/:repo/pages -X PATCH -f source.branch=gh-pages -f source.path=/ -f cname=${domain}`, {
                    stdio: 'inherit'
                });
                this.log('✅ GitHub Pages 域名配置完成');
            } catch (error) {
                this.log('⚠️ 无法自动配置 GitHub Pages，请手动在仓库设置中配置', 'warning');
                this.log('   1. 进入仓库 Settings > Pages');
                this.log('   2. 在 Custom domain 中输入: ' + domain);
                this.log('   3. 勾选 Enforce HTTPS');
            }
            
        } catch (error) {
            this.log(`❌ GitHub Pages 配置失败: ${error.message}`, 'error');
        }
    }

    // 配置 Vercel 自定义域名
    configureVercel(domain) {
        this.log('🔧 配置 Vercel 自定义域名...');
        
        try {
            // 添加域名到 Vercel 项目
            execSync(`vercel domains add ${domain}`, { stdio: 'inherit' });
            
            // 更新 vercel.json
            const vercelConfigPath = join(rootDir, 'vercel.json');
            let config = {};
            
            if (existsSync(vercelConfigPath)) {
                config = JSON.parse(readFileSync(vercelConfigPath, 'utf8'));
            }
            
            config.alias = [domain];
            
            writeFileSync(vercelConfigPath, JSON.stringify(config, null, 2));
            
            this.log('✅ Vercel 域名配置完成');
            
        } catch (error) {
            this.log(`❌ Vercel 配置失败: ${error.message}`, 'error');
        }
    }

    // 配置 Netlify 自定义域名
    configureNetlify(domain) {
        this.log('🔧 配置 Netlify 自定义域名...');
        
        try {
            // 添加域名到 Netlify 站点
            execSync(`netlify sites:update --domain ${domain}`, { stdio: 'inherit' });
            
            // 更新 netlify.toml
            const netlifyConfigPath = join(rootDir, 'netlify.toml');
            let config = '';
            
            if (existsSync(netlifyConfigPath)) {
                config = readFileSync(netlifyConfigPath, 'utf8');
            }
            
            // 添加域名配置
            const domainConfig = `
# 自定义域名配置
[[redirects]]
  from = "https://www.${domain}/*"
  to = "https://${domain}/:splat"
  status = 301
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
`;
            
            config += domainConfig;
            writeFileSync(netlifyConfigPath, config);
            
            this.log('✅ Netlify 域名配置完成');
            
        } catch (error) {
            this.log(`❌ Netlify 配置失败: ${error.message}`, 'error');
        }
    }

    // 生成 DNS 配置指南
    generateDNSGuide(domain, provider) {
        const dnsGuide = `
# DNS 配置指南

## 域名: ${domain}
## 部署平台: ${provider}

### 需要添加的 DNS 记录:

${this.getDNSRecords(domain, provider)}

### 验证步骤:

1. 登录您的域名注册商管理面板
2. 找到 DNS 管理或域名解析设置
3. 添加上述 DNS 记录
4. 等待 DNS 传播（通常需要 24-48 小时）
5. 使用以下命令验证配置:

\`\`\`bash
# 检查 A 记录
dig ${domain} A

# 检查 CNAME 记录
dig www.${domain} CNAME

# 检查 SSL 证书
curl -I https://${domain}
\`\`\`

### 常见问题:

1. **DNS 未生效**: 等待更长时间或清除本地 DNS 缓存
2. **SSL 证书错误**: 确保 HTTPS 重定向已启用
3. **404 错误**: 检查部署状态和文件路径

### 联系支持:

如果遇到问题，请联系:
- 域名注册商客服
- ${provider} 技术支持
- 项目维护者: [your-email@example.com](mailto:your-email@example.com)
        `.trim();
        
        const guidePath = join(rootDir, `DNS_SETUP_${domain.replace('.', '_').toUpperCase()}.md`);
        writeFileSync(guidePath, dnsGuide);
        
        this.log(`📋 DNS 配置指南已生成: ${guidePath}`);
        return guidePath;
    }

    // 获取不同平台的 DNS 记录
    getDNSRecords(domain, provider) {
        const records = {
            'github-pages': `
| 类型 | 名称 | 值 | TTL |
|------|------|-----|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |
| CNAME | www | ${domain} | 3600 |
            `,
            'vercel': `
| 类型 | 名称 | 值 | TTL |
|------|------|-----|-----|
| CNAME | @ | cname.vercel-dns.com | 3600 |
| CNAME | www | cname.vercel-dns.com | 3600 |
            `,
            'netlify': `
| 类型 | 名称 | 值 | TTL |
|------|------|-----|-----|
| CNAME | @ | your-site.netlify.app | 3600 |
| CNAME | www | your-site.netlify.app | 3600 |
            `
        };
        
        return records[provider] || '请查看部署平台的 DNS 配置文档';
    }

    // 测试域名配置
    async testDomainConfiguration(domain) {
        this.log(`🧪 测试域名配置: ${domain}`);
        
        const tests = [
            {
                name: 'DNS 解析',
                test: () => execSync(`nslookup ${domain}`, { encoding: 'utf8' })
            },
            {
                name: 'HTTP 连接',
                test: () => execSync(`curl -I http://${domain}`, { encoding: 'utf8' })
            },
            {
                name: 'HTTPS 连接',
                test: () => execSync(`curl -I https://${domain}`, { encoding: 'utf8' })
            },
            {
                name: 'SSL 证书',
                test: () => execSync(`openssl s_client -connect ${domain}:443 -servername ${domain} < /dev/null`, { encoding: 'utf8' })
            }
        ];
        
        const results = [];
        
        for (const test of tests) {
            try {
                const result = test.test();
                results.push({ name: test.name, status: 'pass', details: result });
                this.log(`✅ ${test.name}: 通过`);
            } catch (error) {
                results.push({ name: test.name, status: 'fail', error: error.message });
                this.log(`❌ ${test.name}: 失败 - ${error.message}`, 'error');
            }
        }
        
        return results;
    }

    // 设置域名
    async setupDomain(domain, provider = 'github-pages') {
        this.log(`🌐 设置自定义域名: ${domain}`);
        
        // 验证域名格式
        if (!this.validateDomain(domain)) {
            throw new Error('无效的域名格式');
        }
        
        // 检查域名可用性
        const availability = await this.checkDomainAvailability(domain);
        this.log(`域名状态: ${availability}`);
        
        // 根据平台配置域名
        switch (provider) {
            case 'github-pages':
                this.configureGitHubPages(domain);
                break;
            case 'vercel':
                this.configureVercel(domain);
                break;
            case 'netlify':
                this.configureNetlify(domain);
                break;
            default:
                throw new Error(`不支持的部署平台: ${provider}`);
        }
        
        // 生成 DNS 配置指南
        this.generateDNSGuide(domain, provider);
        
        // 更新项目配置
        this.updateProjectConfig(domain, provider);
        
        this.log('✅ 域名设置完成！', 'success');
        this.log('📋 请按照生成的 DNS 配置指南设置域名解析');
        this.log('⏰ DNS 传播通常需要 24-48 小时');
    }

    // 更新项目配置
    updateProjectConfig(domain, provider) {
        const configPath = join(rootDir, 'domain-config.json');
        const config = {
            domain,
            provider,
            configuredAt: new Date().toISOString(),
            sslEnabled: true,
            cdnEnabled: true
        };
        
        writeFileSync(configPath, JSON.stringify(config, null, 2));
        this.log(`📝 更新项目配置: ${configPath}`);
    }

    // 移除域名配置
    removeDomain() {
        this.log('🗑️ 移除自定义域名配置...');
        
        const filesToRemove = [
            join(rootDir, 'dist', 'CNAME'),
            join(rootDir, 'domain-config.json')
        ];
        
        for (const file of filesToRemove) {
            if (existsSync(file)) {
                require('fs').unlinkSync(file);
                this.log(`删除文件: ${file}`);
            }
        }
        
        this.log('✅ 域名配置已移除');
    }
}

// 命令行接口
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const domainManager = new DomainManager();
    
    if (args.length === 0) {
        console.log(`
域名配置工具使用说明:

node scripts/setup-domain.js <command> [options]

命令:
  setup <domain> [provider]    设置自定义域名
  test <domain>               测试域名配置
  remove                      移除域名配置
  help                        显示帮助信息

提供商:
  github-pages (默认)
  vercel
  netlify

示例:
  node scripts/setup-domain.js setup example.com
  node scripts/setup-domain.js setup example.com vercel
  node scripts/setup-domain.js test example.com
  node scripts/setup-domain.js remove
        `);
        process.exit(0);
    }
    
    const command = args[0];
    
    try {
        switch (command) {
            case 'setup':
                if (!args[1]) {
                    throw new Error('请提供域名');
                }
                await domainManager.setupDomain(args[1], args[2] || 'github-pages');
                break;
                
            case 'test':
                if (!args[1]) {
                    throw new Error('请提供域名');
                }
                await domainManager.testDomainConfiguration(args[1]);
                break;
                
            case 'remove':
                domainManager.removeDomain();
                break;
                
            case 'help':
                // 帮助信息已在上面显示
                break;
                
            default:
                throw new Error(`未知命令: ${command}`);
        }
    } catch (error) {
        console.error(`❌ 错误: ${error.message}`);
        process.exit(1);
    }
}

export { DomainManager };