// src/services/reportService.ts
import { supabase } from '../config/supabaseClient';

export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'nsfw' | 'misinformation' | 'other';

interface ReportSubmission {
  post_id: string;
  reported_by: string;
  reason: ReportReason;
  description?: string;
}

/**
 * Submit a report for a post
 */
export async function reportPost(
  postId: string,
  reportedBy: string,
  reason: ReportReason,
  description?: string
): Promise<void> {
  try {
    // Debug: Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 Current session:', session?.user?.id, 'reporting as:', reportedBy);
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Authentication error');
    }

    if (!session) {
      throw new Error('You must be logged in to report posts');
    }

    // Check for duplicate report (using a simpler query)
    console.log('🔍 Checking for duplicate report...');
    const { data: existingReports, error: checkError } = await supabase
      .from('reports')
      .select('id')
      .eq('post_id', postId)
      .eq('reported_by', reportedBy)
      .maybeSingle();

    // Only throw error if it's NOT a "no rows" error
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Duplicate check error:', checkError);
      // Don't throw - just continue to insert
    }

    if (existingReports) {
      throw new Error('You have already reported this post');
    }

    console.log('✅ No duplicate found, proceeding with insert...');

    // Create the report
    const reportData: ReportSubmission = {
      post_id: postId,
      reported_by: reportedBy,
      reason,
      description: description || null,
    };

    console.log('📝 Submitting report:', reportData);

    const { data, error: insertError } = await supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      throw new Error(insertError.message || 'Failed to submit report');
    }

    console.log('✅ Report submitted successfully:', data);
  } catch (error: any) {
    console.error('❌ Report submission failed:', error);
    throw error;
  }
}

/**
 * Get all reports by the current user
 */
export async function getUserReports(userId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      id,
      reason,
      description,
      status,
      created_at,
      post_id
    `)
    .eq('reported_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reports:', error);
    throw error;
  }

  return data;
}

/**
 * Check if user has already reported a specific post
 */
export async function hasUserReportedPost(
  postId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('id')
      .eq('post_id', postId)
      .eq('reported_by', userId)
      .maybeSingle();

    // PGRST116 means "no rows returned" which is fine
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking report status:', error);
      return false; // Assume not reported if we can't check
    }

    return !!data;
  } catch (error) {
    console.error('Exception checking report status:', error);
    return false;
  }
}