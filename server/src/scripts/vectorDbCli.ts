#!/usr/bin/env tsx

import { Command } from 'commander';
import { VectorDatabaseService } from '@/utils/vectorDatabase';
import { EmbeddingService } from '@/services/embeddingService';
import { initializeDatabase } from '@/utils/database';
import { logger } from '@/utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('vector-db-cli')
  .description('CLI tool for managing the vector database')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize the vector database')
  .action(async () => {
    try {
      await initializeDatabase();
      await VectorDatabaseService.initialize();
      console.log('✅ Vector database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize vector database:', error);
      process.exit(1);
    }
  });

program
  .command('stats')
  .description('Show vector database statistics')
  .option('-u, --user-id <userId>', 'Show stats for specific user')
  .action(async (options) => {
    try {
      await initializeDatabase();
      
      if (options.userId) {
        const stats = await VectorDatabaseService.getUserDocumentStats(options.userId);
        console.log(`📊 Document statistics for user ${options.userId}:`);
        console.table(stats);
        
        const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
        console.log(`📈 Total documents: ${total}`);
      } else {
        // Show global stats
        const { db } = await import('@/utils/database');
        const result = await db.query(`
          SELECT 
            document_type,
            COUNT(*) as count,
            COUNT(DISTINCT user_id) as unique_users
          FROM vector_documents 
          GROUP BY document_type
          ORDER BY count DESC
        `);
        
        console.log('📊 Global vector database statistics:');
        console.table(result.rows);
      }
    } catch (error) {
      console.error('❌ Failed to get statistics:', error);
      process.exit(1);
    }
  });

program
  .command('search')
  .description('Perform semantic search')
  .requiredOption('-q, --query <query>', 'Search query')
  .option('-u, --user-id <userId>', 'Search within user documents')
  .option('-t, --type <type>', 'Document type filter')
  .option('-l, --limit <limit>', 'Maximum results', '10')
  .option('--threshold <threshold>', 'Similarity threshold', '0.7')
  .action(async (options) => {
    try {
      await initializeDatabase();
      
      const results = await VectorDatabaseService.similaritySearch(
        options.query,
        options.userId,
        options.type,
        parseInt(options.limit),
        parseFloat(options.threshold)
      );
      
      console.log(`🔍 Search results for: "${options.query}"`);
      console.log(`📊 Found ${results.length} results\n`);
      
      results.forEach((result, index) => {
        console.log(`${index + 1}. Similarity: ${result.similarity.toFixed(3)}`);
        console.log(`   Type: ${result.document.documentType}`);
        console.log(`   Content: ${result.document.content.substring(0, 100)}...`);
        console.log(`   Created: ${result.document.createdAt}`);
        console.log('');
      });
    } catch (error) {
      console.error('❌ Search failed:', error);
      process.exit(1);
    }
  });

program
  .command('add-document')
  .description('Add a document to the vector database')
  .requiredOption('-u, --user-id <userId>', 'User ID')
  .requiredOption('-c, --content <content>', 'Document content')
  .requiredOption('-t, --type <type>', 'Document type')
  .option('-m, --metadata <metadata>', 'Metadata as JSON string', '{}')
  .action(async (options) => {
    try {
      await initializeDatabase();
      
      let metadata;
      try {
        metadata = JSON.parse(options.metadata);
      } catch {
        console.error('❌ Invalid metadata JSON');
        process.exit(1);
      }
      
      const document = await VectorDatabaseService.storeDocument({
        userId: options.userId,
        content: options.content,
        metadata,
        documentType: options.type
      });
      
      console.log('✅ Document added successfully');
      console.log(`📄 Document ID: ${document.id}`);
      console.log(`🔢 Embedding dimensions: ${document.embedding?.length || 'N/A'}`);
    } catch (error) {
      console.error('❌ Failed to add document:', error);
      process.exit(1);
    }
  });

program
  .command('analyze-writing')
  .description('Analyze writing style for a user')
  .requiredOption('-u, --user-id <userId>', 'User ID')
  .action(async (options) => {
    try {
      await initializeDatabase();
      
      const analysis = await EmbeddingService.analyzeWritingStyle(options.userId);
      
      console.log(`✍️  Writing style analysis for user ${options.userId}:`);
      console.log(`📝 Tone: ${analysis.tone}`);
      console.log(`🎯 Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
      console.log(`📚 Vocabulary (top 10): ${analysis.vocabulary.slice(0, 10).join(', ')}`);
      console.log(`🏗️  Sentence structure: ${analysis.sentenceStructure}`);
      console.log(`📋 Topic preferences: ${analysis.topicPreferences.join(', ')}`);
      
      if (analysis.commonPhrases.length > 0) {
        console.log(`💬 Common phrases:`);
        analysis.commonPhrases.forEach((phrase, index) => {
          console.log(`   ${index + 1}. "${phrase}"`);
        });
      }
    } catch (error) {
      console.error('❌ Writing analysis failed:', error);
      process.exit(1);
    }
  });

program
  .command('cleanup')
  .description('Clean up old or invalid documents')
  .option('--dry-run', 'Show what would be deleted without actually deleting')
  .action(async (options) => {
    try {
      await initializeDatabase();
      
      const { db } = await import('@/utils/database');
      
      // Find documents with null embeddings
      const nullEmbeddingQuery = 'SELECT id, content FROM vector_documents WHERE embedding IS NULL';
      const nullEmbeddingResult = await db.query(nullEmbeddingQuery);
      
      console.log(`🧹 Found ${nullEmbeddingResult.rows.length} documents with null embeddings`);
      
      if (options.dryRun) {
        console.log('🔍 Dry run mode - no changes will be made');
        nullEmbeddingResult.rows.forEach(row => {
          console.log(`   - ${row.id}: ${row.content.substring(0, 50)}...`);
        });
      } else {
        if (nullEmbeddingResult.rows.length > 0) {
          const deleteQuery = 'DELETE FROM vector_documents WHERE embedding IS NULL';
          const deleteResult = await db.query(deleteQuery);
          console.log(`✅ Deleted ${deleteResult.rowCount} documents with null embeddings`);
        }
      }
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    }
  });

program
  .command('export')
  .description('Export vector documents to JSON')
  .requiredOption('-u, --user-id <userId>', 'User ID')
  .option('-o, --output <file>', 'Output file', 'vector-export.json')
  .action(async (options) => {
    try {
      await initializeDatabase();
      
      const documents = await VectorDatabaseService.getUserDocuments(options.userId);
      
      const exportData = {
        userId: options.userId,
        exportDate: new Date().toISOString(),
        documentCount: documents.length,
        documents: documents.map(doc => ({
          id: doc.id,
          content: doc.content,
          metadata: doc.metadata,
          documentType: doc.documentType,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt
          // Note: embeddings are excluded from export due to size
        }))
      };
      
      const fs = await import('fs/promises');
      await fs.writeFile(options.output, JSON.stringify(exportData, null, 2));
      
      console.log(`✅ Exported ${documents.length} documents to ${options.output}`);
    } catch (error) {
      console.error('❌ Export failed:', error);
      process.exit(1);
    }
  });

// Handle errors and show help
program.parseAsync(process.argv).catch((error) => {
  console.error('❌ CLI error:', error);
  process.exit(1);
});

export default program;