const AWS = require('aws-sdk');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config');

const execAsync = promisify(exec);
const s3 = new AWS.S3();

class BackupService {
  constructor() {
    this.backupPath = path.join(__dirname, '../../backups');
  }

  async createDatabaseBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(this.backupPath, filename);

    try {
      // Create database dump
      await execAsync(
        `PGPASSWORD="${config.db.password}" pg_dump -h ${config.db.host} -U ${config.db.user} ${config.db.database} > ${filepath}`
      );

      // Upload to S3
      const s3Key = `database-backups/${filename}`;
      await s3.putObject({
        Bucket: config.aws.backupBucket,
        Key: s3Key,
        Body: require('fs').createReadStream(filepath),
      }).promise();

      logger.info(`Database backup created successfully: ${s3Key}`);
      return { filename, s3Key };
    } catch (error) {
      logger.error('Database backup failed:', error);
      throw error;
    } finally {
      // Cleanup local file
      await execAsync(`rm -f ${filepath}`);
    }
  }

  async restoreFromBackup(s3Key) {
    const filepath = path.join(this.backupPath, path.basename(s3Key));

    try {
      // Download from S3
      const { Body } = await s3.getObject({
        Bucket: config.aws.backupBucket,
        Key: s3Key,
      }).promise();

      require('fs').writeFileSync(filepath, Body);

      // Restore database
      await execAsync(
        `PGPASSWORD="${config.db.password}" psql -h ${config.db.host} -U ${config.db.user} ${config.db.database} < ${filepath}`
      );

      logger.info(`Database restored successfully from: ${s3Key}`);
    } catch (error) {
      logger.error('Database restore failed:', error);
      throw error;
    } finally {
      await execAsync(`rm -f ${filepath}`);
    }
  }
}

module.exports = new BackupService(); 