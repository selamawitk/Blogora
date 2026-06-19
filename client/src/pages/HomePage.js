import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, ArrowRight, PenSquare, Globe, Mail } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import api from '../services/api';

const COLORS = ['#0FCAEB', '#06B6D4', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#F97316', '#6366F1'];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  return name.charAt(0).toUpperCase();
}

function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalPosts: 0, totalAuthors: 0 });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const [postsRes, statsRes] = await Promise.all([
          api.get('/posts'),
          api.get('/stats').catch(() => ({ data: { totalPosts: 0, totalAuthors: 0 } })),
        ]);
        const data = postsRes.data?.success ? postsRes.data.data : Array.isArray(postsRes.data) ? postsRes.data : [];
        setBlogs(data || []);
        setStats(statsRes.data || { totalPosts: 0, totalAuthors: 0 });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const authors = useMemo(() => {
    const map = new Map();
    blogs.forEach((post) => {
      const user = post.user || {};
      const name = user.username || 'Guest Author';
      const existing = map.get(name);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(name, {
          name,
          count: 1,
          linkedinUrl: user.linkedinUrl || '',
          twitterUrl: user.twitterUrl || '',
          githubUrl: user.githubUrl || '',
          websiteUrl: user.websiteUrl || '',
          bio: user.bio || '',
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [blogs]);

  const trendingPosts = blogs.slice(0, 9);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="home-page">
      <Helmet>
        <title>Blogora — Modern Storytelling Platform</title>
        <meta name="description" content="Discover compelling posts, publish with confidence, and present your work with a premium editorial experience." />
        <meta property="og:title" content="Blogora — Modern Storytelling Platform" />
        <meta property="og:description" content="Discover compelling posts, publish with confidence on Blogora." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-floating-shape hero-floating-shape-1" />
        <div className="hero-floating-shape hero-floating-shape-2" />
        <div className="hero-floating-shape hero-floating-shape-3" />
        <motion.div
          className="hero-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="row align-items-center gx-5">
            <div className="col-lg-6">
              <motion.span
                className="hero-badge"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <BookOpen size={14} />
                Premium Blogging Platform
              </motion.span>
              <motion.h1
                className="hero-title mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                Blogora is the modern storytelling engine for visionary creators.
              </motion.h1>
              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                Discover compelling posts, publish with confidence, and present your work with a premium editorial experience built for freelancers and startups.
              </motion.p>
              <motion.div
                className="d-flex flex-column flex-sm-row gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
              >
                <Link to="/create" className="hero-cta-btn">
                  Start Writing
                  <PenSquare size={16} />
                </Link>
                <Link to="/signin" className="hero-cta-btn hero-cta-outline">
                  Sign In
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
            <div className="col-lg-6 mt-4 mt-lg-0">
              <motion.div
                className="insights-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="insights-title">Fast insights</h3>
                <p className="insights-text">
                  Browse the latest stories with smooth interactions, subtle motion, and a clean reading experience that looks polished at every screen size.
                </p>
                <div className="row g-3">
                  <div className="col-6">
                    <motion.div
                      className="stat-card"
                      whileHover={{ y: -3, borderColor: 'rgba(15, 202, 235, 0.15)' }}
                    >
                      <div className="stat-label">Stories</div>
                      <div className="stat-value">{stats.totalPosts}</div>
                    </motion.div>
                  </div>
                  <div className="col-6">
                    <motion.div
                      className="stat-card"
                      whileHover={{ y: -3, borderColor: 'rgba(15, 202, 235, 0.15)' }}
                    >
                      <div className="stat-label">Authors</div>
                      <div className="stat-value">{stats.totalAuthors}</div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {loading ? (
        <div className="loading-section">
          <div className="spinner" />
          <p className="loading-text">Curating the freshest articles for you...</p>
        </div>
      ) : error ? (
        <div className="error-section">
          <h4>Oops! Something went wrong.</h4>
          <p>{error}</p>
          <p className="error-hint">Please refresh the page or try again later.</p>
        </div>
      ) : (
        <>
          <motion.section
            className="section-block"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.div className="section-header" variants={itemVariants}>
              <div>
                <h2 className="section-heading">Latest stories</h2>
                <p className="section-subtitle">Fresh insights from the Blogora community.</p>
              </div>
            </motion.div>
            {trendingPosts.length > 0 ? (
              <div className="blog-cards-grid">
                {trendingPosts.map((blog, index) => (
                  <BlogCard key={blog._id} blog={blog} index={index} />
                ))}
              </div>
            ) : (
              <motion.div className="empty-card" variants={itemVariants}>
                <BookOpen size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                <h4 className="empty-title">No articles yet</h4>
                <p>Be the first to create a post!</p>
                <Link to="/create" className="empty-cta">Create your first post</Link>
              </motion.div>
            )}
          </motion.section>

          {authors.length > 0 && (
            <motion.section
              className="section-block"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <motion.div className="section-header text-center" variants={itemVariants}>
                <div>
                  <h2 className="section-heading">
                    <TrendingUp size={24} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)' }} />
                    Trending authors
                  </h2>
                  <p className="section-subtitle" style={{ margin: '0 auto' }}>Top talent from the Blogora community.</p>
                </div>
              </motion.div>
              <div className="authors-grid">
                {authors.map((author, idx) => (
                  <motion.div
                    key={author.name}
                    className="author-card"
                    variants={itemVariants}
                    whileHover={{ y: -8, transition: { duration: 0.25 } }}
                  >
                    <div className="author-avatar-wrapper">
                      <div
                        className="author-avatar"
                        style={{ backgroundColor: getAvatarColor(author.name) }}
                      >
                        {getInitials(author.name)}
                      </div>
                      <div className="author-rank">{idx + 1}</div>
                    </div>
                    <div className="author-info">
                      <h4 className="author-name">{author.name}</h4>
                      <p className="author-stats">
                        {author.count} {author.count === 1 ? 'Story' : 'Stories'}
                      </p>
                    </div>
                    {(author.linkedinUrl || author.twitterUrl || author.websiteUrl) && (
                      <div className="author-social-links" style={{ justifyContent: 'center', borderTop: 'none', marginTop: '0.5rem', paddingTop: '0' }}>
                        {author.linkedinUrl && (
                          <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer" className="author-social-link linkedin" onClick={(e) => e.stopPropagation()}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          </a>
                        )}
                        {author.twitterUrl && (
                          <a href={author.twitterUrl} target="_blank" rel="noopener noreferrer" className="author-social-link twitter" onClick={(e) => e.stopPropagation()}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          </a>
                        )}
                        {author.websiteUrl && (
                          <a href={author.websiteUrl} target="_blank" rel="noopener noreferrer" className="author-social-link website" onClick={(e) => e.stopPropagation()}>
                            <Globe size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          <motion.section
            className="section-block newsletter-section"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.div
              className="newsletter-card"
              variants={itemVariants}
              whileHover={{ boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)' }}
            >
              <motion.div
                className="newsletter-content"
                variants={itemVariants}
              >
                <motion.div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--primary-dim)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontSize: '1.3rem',
                  }}
                  whileHover={{ rotate: -10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Mail size={24} />
                </motion.div>
                <h2 className="newsletter-title">Stay in the loop</h2>
                <p className="newsletter-text">
                  Get the latest stories and updates delivered to your inbox.
                </p>
                <form className="newsletter-form" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newsletterEmail.trim()) return;
                  setNewsletterSubmitting(true);
                  setNewsletterMsg('');
                  try {
                    const res = await api.post('/newsletter', { email: newsletterEmail });
                    setNewsletterMsg(res.data.message || 'Subscribed!');
                    setNewsletterEmail('');
                  } catch (err) {
                    setNewsletterMsg(err.response?.data?.message || 'Something went wrong.');
                  } finally {
                    setNewsletterSubmitting(false);
                  }
                }}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="newsletter-input"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={newsletterSubmitting}
                  />
                  <motion.button
                    type="submit"
                    className="newsletter-btn"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={newsletterSubmitting}
                  >
                    {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </motion.button>
                </form>
                {newsletterMsg && (
                  <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--primary)' }}>
                    {newsletterMsg}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </motion.section>
        </>
      )}
    </div>
  );
}

export default HomePage;
