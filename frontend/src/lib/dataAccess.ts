import { User, Client, Case, Document, Message } from './db';
import mongoose from 'mongoose';

interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export class DataAccess {
  private static instance: DataAccess;
  
  private constructor() {}

  public static getInstance(): DataAccess {
    if (!DataAccess.instance) {
      DataAccess.instance = new DataAccess();
    }
    return DataAccess.instance;
  }

  // Cases
  public async getCases(userId: string, options: QueryOptions = {}) {
    let query = Case.find({ lawyer_id: userId });

    // Apply filters
    if (options.filters) {
      query = query.where(options.filters);
    }

    // Apply sorting
    if (options.orderBy) {
      const sortOrder = options.orderDir === 'desc' ? -1 : 1;
      query = query.sort({ [options.orderBy]: sortOrder });
    }

    // Apply pagination
    if (options.limit) {
      const skip = options.offset || 0;
      query = query.skip(skip).limit(options.limit);
    }

    return await query.exec();
  }

  // Clients
  public async getClients(userId: string, options: QueryOptions = {}) {
    let query = Client.find({ lawyer_id: userId });

    if (options.filters) {
      query = query.where(options.filters);
    }

    if (options.orderBy) {
      const sortOrder = options.orderDir === 'desc' ? -1 : 1;
      query = query.sort({ [options.orderBy]: sortOrder });
    }

    if (options.limit) {
      const skip = options.offset || 0;
      query = query.skip(skip).limit(options.limit);
    }

    return await query.exec();
  }

  // Documents
  public async getDocuments(userId: string, options: QueryOptions = {}) {
    let query = Document.find({ lawyer_id: userId });

    if (options.filters) {
      query = query.where(options.filters);
    }

    if (options.orderBy) {
      const sortOrder = options.orderDir === 'desc' ? -1 : 1;
      query = query.sort({ [options.orderBy]: sortOrder });
    }

    if (options.limit) {
      const skip = options.offset || 0;
      query = query.skip(skip).limit(options.limit);
    }

    return await query.exec();
  }

  // Analytics
  public async getAnalytics(userId: string) {
    // Get all required data in parallel
    const [cases, clients, documents] = await Promise.all([
      Case.find({ lawyer_id: userId }),
      Client.find({ lawyer_id: userId }),
      Document.find({ lawyer_id: userId })
    ]);

    // Calculate case statistics
    const caseStats = {
      total: cases.length,
      open: cases.filter(c => c.status === 'open').length,
      closed: cases.filter(c => c.status === 'closed').length,
      inProgress: cases.filter(c => c.status === 'in_progress').length,
      byType: cases.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byMonth: cases.reduce((acc, c) => {
        const month = new Date(c.created_at).toLocaleString('ar-EG', { month: 'long' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    // Calculate client statistics
    const clientStats = {
      total: clients.length,
      byType: clients.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    // Calculate document statistics
    const documentStats = {
      total: documents.length,
      byStatus: documents.reduce((acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return {
      cases: caseStats,
      clients: clientStats,
      documents: documentStats
    };
  }
}