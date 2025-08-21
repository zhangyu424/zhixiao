/**
 * 文档同步工具
 * 用于同步zhixiaodocs和docs目录，以及与API服务的同步
 * 仅供开发过程使用
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DocumentSynchronizer {
  constructor(configPath = './config.json') {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    this.sourceDir = path.resolve(__dirname, this.config.sync.sourceDir);
    this.targetDir = path.resolve(__dirname, this.config.sync.targetDir);
    this.backupDir = path.resolve(__dirname, this.config.backup.backupDir);
    this.logFile = path.resolve(__dirname, this.config.notifications.logFile);
    this.syncResults = [];
  }

  async syncAll() {
    this.log('📋 开始文档同步...');
    this.log(`📁 源目录: ${this.sourceDir}`);
    this.log(`📁 目标目录: ${this.targetDir}`);

    try {
      // 确保目录存在
      this.ensureDirectories();

      // 创建备份
      if (this.config.backup.enabled) {
        await this.createBackup();
      }

      // 同步文档
      await this.syncDocuments();

      // 验证同步结果
      await this.validateSync();

      // 生成报告
      this.generateSyncReport();

      this.log('✅ 文档同步完成!');
    } catch (error) {
      this.log(`❌ 同步失败: ${error.message}`, 'error');
      throw error;
    }
  }

  ensureDirectories() {
    [this.targetDir, this.backupDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`📁 创建目录: ${dir}`);
      }
    });
  }

  async createBackup() {
    this.log('💾 创建备份...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}`);

    try {
      // 复制目标目录到备份
      await this.copyDirectory(this.targetDir, backupPath);
      this.log(`✅ 备份创建成功: ${backupPath}`);

      // 清理旧备份
      await this.cleanupBackups();
    } catch (error) {
      this.log(`⚠️  备份创建失败: ${error.message}`, 'warning');
    }
  }

  async copyDirectory(source, target) {
    if (!fs.existsSync(source)) return;

    fs.mkdirSync(target, { recursive: true });

    const files = fs.readdirSync(source);
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);

      const stat = fs.statSync(sourcePath);
      if (stat.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  async cleanupBackups() {
    const backups = fs
      .readdirSync(this.backupDir)
      .filter(name => name.startsWith('backup-'))
      .map(name => ({
        name,
        path: path.join(this.backupDir, name),
        time: fs.statSync(path.join(this.backupDir, name)).mtime
      }))
      .sort((a, b) => b.time - a.time);

    if (backups.length > this.config.backup.maxBackups) {
      const toDelete = backups.slice(this.config.backup.maxBackups);
      for (const backup of toDelete) {
        fs.rmSync(backup.path, { recursive: true, force: true });
        this.log(`🗑️  删除旧备份: ${backup.name}`);
      }
    }
  }

  async syncDocuments() {
    this.log('🔄 同步文档文件...');

    if (!fs.existsSync(this.sourceDir)) {
      throw new Error(`源目录不存在: ${this.sourceDir}`);
    }

    const sourceFiles = this.getMarkdownFiles(this.sourceDir);

    for (const sourceFile of sourceFiles) {
      await this.syncFile(sourceFile);
    }
  }

  getMarkdownFiles(dir) {
    const files = [];

    const scan = currentDir => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          scan(itemPath);
        } else if (
          item.endsWith('.md') &&
          !this.config.excludeFiles.includes(item)
        ) {
          files.push(itemPath);
        }
      }
    };

    scan(dir);
    return files;
  }

  async syncFile(sourceFilePath) {
    const fileName = path.basename(sourceFilePath);
    const relativePath = path.relative(this.sourceDir, sourceFilePath);

    // 检查映射
    const targetFileName = this.config.mappings[fileName] || fileName;
    const targetFilePath = path.join(this.targetDir, targetFileName);

    try {
      const sourceContent = fs.readFileSync(sourceFilePath, 'utf8');
      const sourceHash = this.calculateHash(sourceContent);

      let shouldSync = true;
      let syncReason = 'new';

      if (fs.existsSync(targetFilePath)) {
        const targetContent = fs.readFileSync(targetFilePath, 'utf8');
        const targetHash = this.calculateHash(targetContent);

        if (sourceHash === targetHash) {
          shouldSync = false;
          syncReason = 'unchanged';
        } else {
          syncReason = 'updated';
        }
      }

      if (shouldSync) {
        let processedContent = sourceContent;

        // 应用转换
        if (this.config.transformations.updateTimestamp) {
          processedContent = this.updateTimestamp(processedContent);
        }

        if (this.config.transformations.addSyncNotice) {
          processedContent = this.addSyncNotice(
            processedContent,
            sourceFilePath
          );
        }

        fs.writeFileSync(targetFilePath, processedContent, 'utf8');

        this.log(`✅ ${syncReason}: ${fileName} -> ${targetFileName}`);

        this.syncResults.push({
          source: sourceFilePath,
          target: targetFilePath,
          action: syncReason,
          timestamp: new Date().toISOString(),
          size: processedContent.length
        });
      } else {
        this.log(`⏭️  跳过: ${fileName} (无变更)`);
      }
    } catch (error) {
      this.log(`❌ 同步失败: ${fileName} - ${error.message}`, 'error');

      this.syncResults.push({
        source: sourceFilePath,
        target: targetFilePath,
        action: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  calculateHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  updateTimestamp(content) {
    const timestamp = new Date().toISOString().split('T')[0];

    // 更新文档中的时间戳
    content = content.replace(
      /最后更新[：:]\s*\d{4}-\d{2}-\d{2}/g,
      `最后更新: ${timestamp}`
    );

    content = content.replace(
      /更新时间[：:]\s*\d{4}-\d{2}-\d{2}/g,
      `更新时间: ${timestamp}`
    );

    return content;
  }

  addSyncNotice(content, sourcePath) {
    const notice = `\n---\n> 📝 此文档由同步工具自动更新，源文件: ${path.relative(process.cwd(), sourcePath)}\n> 🕐 同步时间: ${new Date().toLocaleString()}\n---\n`;

    // 在文档末尾添加同步说明
    return content + notice;
  }

  async validateSync() {
    this.log('🔍 验证同步结果...');

    const sourceFiles = this.getMarkdownFiles(this.sourceDir);
    const targetFiles = this.getMarkdownFiles(this.targetDir);

    const sourceCount = sourceFiles.length;
    const targetCount = targetFiles.length;
    const syncedCount = this.syncResults.filter(
      r => r.action !== 'failed'
    ).length;

    this.log(`📊 同步统计:`);
    this.log(`  源文件数: ${sourceCount}`);
    this.log(`  目标文件数: ${targetCount}`);
    this.log(`  成功同步: ${syncedCount}`);
    this.log(
      `  失败同步: ${this.syncResults.filter(r => r.action === 'failed').length}`
    );
  }

  generateSyncReport() {
    const report = {
      timestamp: new Date().toISOString(),
      sourceDir: this.sourceDir,
      targetDir: this.targetDir,
      summary: {
        total: this.syncResults.length,
        new: this.syncResults.filter(r => r.action === 'new').length,
        updated: this.syncResults.filter(r => r.action === 'updated').length,
        failed: this.syncResults.filter(r => r.action === 'failed').length,
        unchanged: this.syncResults.filter(r => r.action === 'unchanged').length
      },
      details: this.syncResults
    };

    const reportPath = path.join(__dirname, `sync-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`📄 同步报告已生成: ${reportPath}`);
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    console.log(logMessage);

    if (this.config.notifications.logFile) {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    }
  }

  // 监听文件变化并自动同步
  watch() {
    this.log('👀 开始监听文件变化...');

    const chokidar = require('chokidar');

    const watcher = chokidar.watch(this.sourceDir, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true
    });

    let syncTimeout;

    const triggerSync = () => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        this.log('📄 检测到文件变化，开始同步...');
        this.syncAll().catch(error => {
          this.log(`❌ 自动同步失败: ${error.message}`, 'error');
        });
      }, 1000); // 延迟1秒执行，避免频繁同步
    };

    watcher
      .on('add', path => {
        this.log(`➕ 新文件: ${path}`);
        triggerSync();
      })
      .on('change', path => {
        this.log(`📝 文件变更: ${path}`);
        triggerSync();
      })
      .on('unlink', path => {
        this.log(`🗑️  文件删除: ${path}`);
        triggerSync();
      });

    return watcher;
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';

  const synchronizer = new DocumentSynchronizer();

  switch (command) {
    case 'sync':
      console.log('🔄 文档同步工具');
      console.log('仅供开发过程使用\n');
      synchronizer.syncAll().catch(error => {
        console.error('❌ 同步失败:', error.message);
        process.exit(1);
      });
      break;

    case 'watch':
      console.log('👀 文档监听模式');
      console.log('仅供开发过程使用\n');
      console.log('按 Ctrl+C 停止监听\n');

      const watcher = synchronizer.watch();

      process.on('SIGINT', () => {
        console.log('\n🛑 停止监听...');
        watcher.close();
        process.exit(0);
      });
      break;

    case 'help':
    default:
      console.log(`
🔄 文档同步工具

📖 可用命令:

  sync     执行一次性文档同步 (默认)
  watch    监听文件变化并自动同步
  help     显示此帮助信息

📋 使用示例:

  # 执行同步
  node sync.js sync

  # 监听模式
  node sync.js watch

⚙️  配置文件: config.json

📞 如需帮助，请联系开发团队。
`);
      break;
  }
}

module.exports = DocumentSynchronizer;
