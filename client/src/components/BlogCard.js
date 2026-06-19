import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, ArrowRight, Clock, Globe } from 'lucide-react';

const COLORS = ['#0FCAEB', '#06B6D4', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#F97316', '#6366F1'];
const GRADIENTS = [
  'linear-gradient(135deg, #0FCAEB22, #06B6D411)',
  'linear-gradient(135deg, #F59E0B22, #F9731611)',
  'linear-gradient(135deg, #8B5CF622, #6366F111)',
  'linear-gradient(135deg, #EC489922, #F9731611)',
  'linear-gradient(135deg, #10B98122, #06B6D411)',
  'linear-gradient(135deg, #6366F122, #8B5CF611)',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  return name.charAt(0).toUpperCase();
}

function getGradient(title) {
  let hash = 0;
  for (let i = 0; i < (title || '').length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function BlogCard({ blog, featured, index = 0 }) {
  const wordCount = blog.content?.trim().split(/\s+/).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));
  const author = blog.user?.username || 'Guest Author';
  const date = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const excerpt = blog.content?.length > 150 ? blog.content.substring(0, 150) + '...' : blog.content;
  const titleInitial = (blog.title || 'B').charAt(0).toUpperCase();
  const userSocial = blog.user || {};

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="blog-card"
      style={{
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        transition: 'box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.35)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)'; }}
    >
      <Link to={`/blogs/${blog._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="blog-card-image" style={{ background: getGradient(blog.title) }}>
          <div className="blog-card-image-placeholder">
            {titleInitial}
          </div>
        </div>
      </Link>

      <div className="blog-card-body">
        <div className="blog-card-meta">
          <span className="blog-card-category">{featured ? 'Featured' : 'Article'}</span>
          <span className="blog-card-readtime">
            <Clock size={12} style={{ marginRight: '0.2rem', verticalAlign: 'middle' }} />
            {readingTime} min read
          </span>
        </div>

        <h3 className="blog-card-title">
          <Link to={`/blogs/${blog._id}`}>
            {blog.title}
          </Link>
        </h3>

        <p className="blog-card-excerpt">{excerpt}</p>

        <div className="blog-card-footer">
          <div className="blog-card-author">
            <div className="blog-card-avatar" style={{ backgroundColor: getAvatarColor(author) }}>
              {getInitials(author)}
            </div>
            <div className="blog-card-author-info">
              <span className="blog-card-author-name">{author}</span>
              <span className="blog-card-date">{date}</span>
            </div>
          </div>

          <div className="blog-card-stats">
            <span className="blog-card-stat">
              <Heart size={14} />
              <span>{blog.likesCount || 0}</span>
            </span>
            <span className="blog-card-stat">
              <MessageCircle size={14} />
              <span>{blog.commentsCount || 0}</span>
            </span>
          </div>
        </div>

        {(userSocial.linkedinUrl || userSocial.twitterUrl || userSocial.githubUrl || userSocial.websiteUrl) && (
          <div className="author-social-links">
            {userSocial.linkedinUrl && (
              <a href={userSocial.linkedinUrl} target="_blank" rel="noopener noreferrer" className="author-social-link linkedin" onClick={(e) => e.stopPropagation()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            )}
            {userSocial.twitterUrl && (
              <a href={userSocial.twitterUrl} target="_blank" rel="noopener noreferrer" className="author-social-link twitter" onClick={(e) => e.stopPropagation()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {userSocial.githubUrl && (
              <a href={userSocial.githubUrl} target="_blank" rel="noopener noreferrer" className="author-social-link github" onClick={(e) => e.stopPropagation()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
            )}
            {userSocial.websiteUrl && (
              <a href={userSocial.websiteUrl} target="_blank" rel="noopener noreferrer" className="author-social-link website" onClick={(e) => e.stopPropagation()}>
                <Globe size={14} />
              </a>
            )}
          </div>
        )}

        <Link to={`/blogs/${blog._id}`} className="blog-card-readmore" style={{ marginTop: '0.75rem' }}>
          Read More
          <ArrowRight size={14} />
        </Link>
      </div>
    </motion.article>
  );
}

export default React.memo(BlogCard);
