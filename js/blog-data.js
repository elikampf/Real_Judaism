/**
 * Blog Data Management System
 * Contains metadata for all blog posts in the "Building Jewish Marriages" series
 */

const blogPosts = [
    {
        id: 1,
        title: "The Core of Judaism",
        category: "Phase 1: Foundation",
        date: "2025-09-09",
        readTime: "4 min read",
        excerpt: "Understanding why the Jewish home is the core of all Judaism and why weddings are public celebrations.",
        url: "blog/foundation/01-the-core-of-judaism.html",
        tags: ["community", "wedding", "purpose"],
        seriesNumber: 1,
        featured: true
    },
    {
        id: 2,
        title: "Welcome to Real Life",
        category: "Phase 1: Foundation",
        date: "2025-09-16",
        readTime: "3 min read",
        excerpt: "Why every couple faces difficulties after marriage and why this process is completely normal.",
        url: "blog/foundation/02-welcome-to-real-life.html",
        tags: ["challenges", "differences", "normal"],
        seriesNumber: 2,
        featured: true
    },
    // Placeholder for future posts
    {
        id: 3,
        title: "Change Your Mindset",
        category: "Phase 1: Foundation",
        date: "2025-09-23",
        readTime: "4 min read",
        excerpt: "The commitment that changes everything - transforming your perspective on marriage challenges.",
        url: "blog/foundation/03-change-your-mindset.html",
        tags: ["mindset", "commitment", "growth"],
        seriesNumber: 3,
        featured: false
    },
    {
        id: 4,
        title: "The Art of Torah-Inspired Listening",
        category: "Communication",
        date: "2025-09-30",
        readTime: "5 min read",
        excerpt: "How the Talmud's wisdom on active listening can transform your marriage conversations.",
        url: "blog/communication/week-25-effective-listening.html",
        tags: ["listening", "communication", "talmud"],
        seriesNumber: 4,
        featured: false
    },
    {
        id: 5,
        title: "From Arguments to Growth: The Jewish Path",
        category: "Conflict Resolution",
        date: "2025-10-07",
        readTime: "4 min read",
        excerpt: "Discover how Torah teaches us to use disagreements as opportunities for spiritual development.",
        url: "blog/conflict/week-24-turning-arguments-into-growth.html",
        tags: ["conflict", "growth", "torah"],
        seriesNumber: 5,
        featured: false
    },
    {
        id: 6,
        title: "Building Spiritual Intimacy Through Prayer",
        category: "Spiritual Connection",
        date: "2025-10-14",
        readTime: "6 min read",
        excerpt: "How shared tefillah can strengthen your marriage bond and invite the Shechinah into your home.",
        url: "blog/spirituality/week-23-praying-together.html",
        tags: ["prayer", "spirituality", "shechinah"],
        seriesNumber: 6,
        featured: false
    }
];

/**
 * Get all unique categories from posts
 */
function getCategories() {
    const categories = [...new Set(blogPosts.map(post => post.category))];
    return categories.sort();
}

/**
 * Get all unique tags from posts
 */
function getTags() {
    const allTags = blogPosts.flatMap(post => post.tags);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
}

/**
 * Get posts by category
 */
function getPostsByCategory(category) {
    return blogPosts.filter(post => post.category === category);
}

/**
 * Get posts by tag
 */
function getPostsByTag(tag) {
    return blogPosts.filter(post => post.tags.includes(tag));
}

/**
 * Get featured posts
 */
function getFeaturedPosts() {
    return blogPosts.filter(post => post.featured).sort((a, b) => b.id - a.id);
}

/**
 * Get recent posts (limit to specified number)
 */
function getRecentPosts(limit = 6) {
    return blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}

/**
 * Search posts by query
 */
function searchPosts(query) {
    const lowercaseQuery = query.toLowerCase();
    return blogPosts.filter(post =>
        post.title.toLowerCase().includes(lowercaseQuery) ||
        post.excerpt.toLowerCase().includes(lowercaseQuery) ||
        post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        post.category.toLowerCase().includes(lowercaseQuery)
    );
}

/**
 * Get post by ID
 */
function getPostById(id) {
    return blogPosts.find(post => post.id === parseInt(id));
}

/**
 * Get next post in series
 */
function getNextPost(currentId) {
    const currentPost = getPostById(currentId);
    if (!currentPost) return null;

    return blogPosts.find(post => post.seriesNumber === currentPost.seriesNumber + 1);
}

/**
 * Get previous post in series
 */
function getPreviousPost(currentId) {
    const currentPost = getPostById(currentId);
    if (!currentPost) return null;

    return blogPosts.find(post => post.seriesNumber === currentPost.seriesNumber - 1);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        blogPosts,
        getCategories,
        getTags,
        getPostsByCategory,
        getPostsByTag,
        getFeaturedPosts,
        getRecentPosts,
        searchPosts,
        getPostById,
        getNextPost,
        getPreviousPost,
        formatDate
    };
}
