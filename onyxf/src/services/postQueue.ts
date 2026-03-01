// src/services/postQueue.ts
import { supabase } from '../config/supabaseClient';

interface QueuedPost {
  id: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  userId: string;
  timestamp: number;
  retries: number;
  status: 'pending' | 'processing' | 'failed';
}

const STORAGE_KEY = 'onyx_post_queue';
const MAX_RETRIES = 3;

class PostQueueService {
  private queue: QueuedPost[] = [];
  private processing = false;

  constructor() {
    this.loadQueue();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.queue = stored ? JSON.parse(stored) : [];
      console.log('📦 Loaded queue:', this.queue.length, 'items');
    } catch (error) {
      console.error('❌ Failed to load queue:', error);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('❌ Failed to save queue:', error);
    }
  }

  // ✅ FIXED: Made async and await getUser()
  async enqueue(content: string, media_url?: string, media_type?: 'image' | 'video'): Promise<QueuedPost> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const queuedPost: QueuedPost = {
      id: `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      media_url,
      media_type,
      userId: user.id,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    };

    this.queue.push(queuedPost);
    this.saveQueue();
    
    console.log('➕ Post queued:', queuedPost.id);
    
    // Auto-process if tab is visible
    if (!document.hidden) {
      this.processQueue();
    }

    return queuedPost;
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    console.log('🔄 Processing queue:', this.queue.length, 'items');

    const pendingPosts = this.queue.filter(p => p.status === 'pending');

    for (const post of pendingPosts) {
      try {
        post.status = 'processing';
        this.saveQueue();

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.warn('⚠️ No session, skipping post processing');
          post.status = 'pending';
          this.saveQueue();
          break;
        }

        // Insert post with 30s timeout
        const { error } = await Promise.race([
          supabase
            .from('posts')
            .insert({
              content: post.content,
              user_id: post.userId,
              media_url: post.media_url,
              media_type: post.media_type,
            })
            .select(`
              *,
              author:users (
                id,
                username,
                avatar_url,
                level,
                ispremium
              )
            `)
            .single(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 30000)
          )
        ]) as any;

        if (error) throw error;

        // Success - remove from queue
        this.queue = this.queue.filter(p => p.id !== post.id);
        this.saveQueue();
        
        console.log('✅ Post processed:', post.id);

      } catch (error: any) {
        console.error('❌ Failed to process post:', error);
        
        post.retries++;
        
        if (post.retries >= MAX_RETRIES) {
          post.status = 'failed';
          console.error('💀 Post failed after', MAX_RETRIES, 'retries');
        } else {
          post.status = 'pending';
          console.log('🔁 Retry', post.retries, 'of', MAX_RETRIES);
        }
        
        this.saveQueue();
      }
    }

    this.processing = false;
    this.cleanupOldPosts();
  }

  private cleanupOldPosts() {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const before = this.queue.length;
    
    this.queue = this.queue.filter(p => 
      p.status !== 'failed' || p.timestamp > dayAgo
    );
    
    if (this.queue.length !== before) {
      console.log('🧹 Cleaned', before - this.queue.length, 'old posts');
      this.saveQueue();
    }
  }

  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(p => p.status === 'pending').length,
      processing: this.queue.filter(p => p.status === 'processing').length,
      failed: this.queue.filter(p => p.status === 'failed').length
    };
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
    console.log('🗑️ Queue cleared');
  }

  retryFailed() {
    this.queue.forEach(post => {
      if (post.status === 'failed') {
        post.status = 'pending';
        post.retries = 0;
      }
    });
    this.saveQueue();
    this.processQueue();
  }
}

export const postQueue = new PostQueueService();