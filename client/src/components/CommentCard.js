import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Trash2 } from 'lucide-react';

const COLORS = ['#0FCAEB', '#06B6D4', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#F97316', '#6366F1'];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  return name.charAt(0).toUpperCase();
}

const CommentCard = ({ comment, canDelete, onDelete, onReply, postAuthorId, currentUserId }) => {
  const username = comment.user?.username || 'Anonymous';
  const commentContent = comment.content || 'No content';
  const commentDate = comment.createdAt ? new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const isPostAuthor = comment.user?._id === postAuthorId;
  const isCurrentUser = comment.user?._id === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="comment-card"
    >
      <div className="comment-header">
        <div
          className="comment-avatar"
          style={{ backgroundColor: getAvatarColor(username) }}
        >
          {getInitials(username)}
        </div>
        <div className="comment-meta">
          <span className="comment-author">
            {username}
            {isPostAuthor && <span className="comment-badge">Author</span>}
          </span>
          <span className="comment-date">{commentDate}</span>
        </div>
        {(canDelete || isCurrentUser) && (
          <button onClick={() => onDelete(comment._id)} className="comment-delete-btn" title="Delete">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="comment-body">{commentContent}</div>
      <div className="comment-actions">
        {onReply && (
          <button onClick={() => onReply(comment._id, username)} className="comment-reply-btn">
            <MessageCircle size={14} />
            Reply
          </button>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => {
            const replyAuthor = reply.user?.username || 'Anonymous';
            const replyDate = reply.createdAt ? new Date(reply.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            const isReplyPostAuthor = reply.user?._id === postAuthorId;
            const canDeleteReply = currentUserId && reply.user?._id === currentUserId;

            return (
              <motion.div
                key={reply._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="comment-card reply-card"
              >
                <div className="comment-header">
                  <div
                    className="comment-avatar reply-avatar"
                    style={{ backgroundColor: getAvatarColor(replyAuthor) }}
                  >
                    {getInitials(replyAuthor)}
                  </div>
                  <div className="comment-meta">
                    <span className="comment-author">
                      {replyAuthor}
                      {isReplyPostAuthor && <span className="comment-badge">Author</span>}
                    </span>
                    <span className="comment-date">{replyDate}</span>
                  </div>
                  {(canDeleteReply) && (
                    <button onClick={() => onDelete(reply._id)} className="comment-delete-btn" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="comment-body">{reply.content}</div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default CommentCard;
