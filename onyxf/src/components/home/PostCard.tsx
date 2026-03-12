// src/components/home/PostCard.tsx
import React from 'react';
import { FaClock } from 'react-icons/fa';
import { Post, Comment, UserData } from './types';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostMedia } from './PostMedia';
import { PostActions } from './PostActions';
import { PostMenu } from './PostMenu';
import { PostComments } from './PostComments';

interface PostCardProps {
  darkMode: boolean;
  post: Post;
  user: any;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  showComments: boolean;
  showPostMenu: boolean;
  comments: Comment[];
  commentText: string;
  loadingComments: boolean;
  userData: UserData;
  onLike: () => void;
  onToggleComments: () => void;
  onShare: () => void;
  onToggleSave: () => void;
  onFollow: () => void;
  onDelete: () => void;
  onToggleMenu: () => void;
  onReport: () => void;
  onCommentChange: (text: string) => void;
  onSubmitComment: () => void;
  formatTime: (isoString: string) => string;
  formatCount: (count: number) => string;
}

export const PostCard: React.FC<PostCardProps> = ({
  darkMode,
  post,
  user,
  isLiked,
  isSaved,
  isFollowing,
  followLoading,
  showComments,
  showPostMenu,
  comments,
  commentText,
  loadingComments,
  userData,
  onLike,
  onToggleComments,
  onShare,
  onToggleSave,
  onFollow,
  onDelete,
  onToggleMenu,
  onReport,
  onCommentChange,
  onSubmitComment,
  formatTime,
  formatCount
}) => {
  const isOptimistic = post.id.startsWith('optimistic_');
  const isOwnPost = user && String(post.user_id).trim() === String(user.id).trim();

  return (
    <article
      className={`rounded-2xl overflow-hidden border transition-all ${
        darkMode
          ? 'bg-gray-900 border-gray-800 hover:border-purple-900/50'
          : 'bg-white border-gray-200 hover:border-purple-300'
      } ${isOptimistic ? 'opacity-70' : ''}`}
    >
      {isOptimistic && (
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center space-x-2 text-purple-600 text-xs">
            <FaClock className="animate-pulse" />
            <span>Syncing...</span>
          </div>
        </div>
      )}

      <div className="p-5 flex items-center justify-between">
        <PostHeader
          darkMode={darkMode}
          author={post.author}
          createdAt={post.created_at}
          isOwnPost={isOwnPost}
          isFollowing={isFollowing}
          followLoading={followLoading}
          onFollow={onFollow}
          formatTime={formatTime}
        />

        <PostMenu
          darkMode={darkMode}
          postId={post.id}
          isOwnPost={isOwnPost}
          isOptimistic={isOptimistic}
          isOpen={showPostMenu}
          onToggle={onToggleMenu}
          onShare={onShare}
          onDelete={onDelete}
          onReport={onReport}
        />
      </div>

      <PostContent darkMode={darkMode} content={post.content} />

      <PostMedia darkMode={darkMode} mediaUrl={post.media_url} mediaType={post.media_type} />

      <PostActions
        darkMode={darkMode}
        postId={post.id}
        likes={post.likes}
        commentsCount={post.comments_count}
        shares={post.shares}
        isLiked={isLiked}
        isSaved={isSaved}
        isOptimistic={isOptimistic}
        showComments={showComments}
        onLike={onLike}
        onToggleComments={onToggleComments}
        onShare={onShare}
        onToggleSave={onToggleSave}
        formatCount={formatCount}
      />

      {showComments && (
        <PostComments
          darkMode={darkMode}
          postId={post.id}
          comments={comments}
          commentText={commentText}
          loading={loadingComments}
          userData={userData}
          onCommentChange={onCommentChange}
          onSubmitComment={onSubmitComment}
          formatTime={formatTime}
        />
      )}
    </article>
  );
};