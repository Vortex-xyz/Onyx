// src/services/reportService.ts
import { supabase } from '../config/supabaseClient';

export type ReportReason = 
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'nsfw'
  | 'misinformation'
  | 'other';

export interface Report {
  id: string;
  post_id: string;
  reported_by: string;
  reason: ReportReason;
  description?: string;
  created_at: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export async function reportPost(
  postId: string,
  reason: ReportReason,
  description?: string
): Promise<Report> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Must be logged in to report posts');
  }

  // Check if user already reported this post
  const { data: existing } = await supabase
    .from('reports')
    .select('id')
    .eq('post_id', postId)
    .eq('reported_by', user.id)
    .single();

  if (existing) {
    throw new Error('You have already reported this post');
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      post_id: postId,
      reported_by: user.id,
      reason,
      description,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReportedPosts(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      post:posts(*)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}