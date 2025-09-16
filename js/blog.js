/**
 * Blog Management System
 * Handles dynamic blog functionality, filtering, search, and navigation
 */

// Global variables
let currentPosts = [];
let filteredPosts = [];
let currentFilter = 'all';
let currentSearchQuery = '';
let postsPerPage = 9;
let currentPage = 1;

/**
 * Initialize blog system based on current page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load blog data
    if (typeof blogPosts === 'undefined') {
        // Load blog-data.js if not already loaded
        const script = document.createElement('script');
        script.src = 'js/blog-data.js';
        script.onload = initializeBlogSystem;
        document.head.appendChild(script);
    } else {
        initializeBlogSystem();
    }
});

/**
 * Initialize the appropriate blog functionality based on current page
 */
function initializeBlogSystem() {
    const isBlogHomePage = document.querySelector('.blog-posts-grid') !== null;
    const isBlogPostPage = document.querySelector('.blog-post-article') !== null;

    if (isBlogHomePage) {
        initializeBlogHomePage();
    } else if (isBlogPostPage) {
        initializeBlogPostPage();
    }

    // Common functionality for all blog pages
    initializeNewsletterForm();
    initializeShareButtons();
}

/**
 * Initialize blog homepage functionality
 */
function initializeBlogHomePage() {
    // Populate featured posts
    populateFeaturedPosts();

    // Initialize filters and search
    initializeFilters();
    initializeSearch();

    // Load initial posts
    loadPosts();

    // Initialize load more
    initializeLoadMore();
}

/**
 * Initialize blog post page functionality
 */
function initializeBlogPostPage() {
    // Extract post ID from URL or content
    const postId = getCurrentPostId();

    if (postId) {
        populateSeriesNavigation(postId);
        populateRelatedPosts(postId);
    }

    // Add reading progress indicator
    addReadingProgress();
}

/**
 * Populate featured posts section
 */
function populateFeaturedPosts() {
    const featuredPosts = getFeaturedPosts();
    const featuredGrid = document.querySelector('.blog-posts-grid');

    if (!featuredGrid) return;

    // Clear existing content
    featuredGrid.innerHTML = '';

    // Only show first 6 featured posts for homepage
    const postsToShow = featuredPosts.slice(0, 6);

    postsToShow.forEach(post => {
        const postCard = createPostCard(post);
        featuredGrid.appendChild(postCard);
    });
}

/**
 * Create a post card element
 */
function createPostCard(post) {
    const article = document.createElement('article');
    article.className = 'blog-post-card';

    article.innerHTML = `
        <div class="blog-post-content">
            <div class="post-meta">
                <span class="post-category">${post.category}</span>
                <span class="post-date">${formatDate(post.date)}</span>
                <span class="post-read-time">${post.readTime}</span>
            </div>
            <h3 class="blog-post-title">
                <a href="${post.url}">${post.title}</a>
            </h3>
            <p class="blog-post-excerpt">${post.excerpt}</p>
            <div class="blog-post-actions">
                <a href="${post.url}" class="btn-cta-white-blue">
                    <span class="btn-icon">▶</span>
                    Read Now
                </a>
            </div>
        </div>
    `;

    return article;
}

/**
 * Initialize filter functionality
 */
function initializeFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');

    if (categoryFilter) {
        // Populate categories
        const categories = getCategories();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        categoryFilter.addEventListener('change', function() {
            currentFilter = this.value;
            currentPage = 1;
            filterAndLoadPosts();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            currentPage = 1;
            loadPosts();
        });
    }
}

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearchQuery = this.value.trim();
            currentPage = 1;
            filterAndLoadPosts();
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                currentSearchQuery = searchInput.value.trim();
                currentPage = 1;
                filterAndLoadPosts();
            }
        });
    }
}

/**
 * Filter and load posts based on current criteria
 */
function filterAndLoadPosts() {
    let posts = [...blogPosts];

    // Apply search filter
    if (currentSearchQuery) {
        posts = searchPosts(currentSearchQuery);
    }

    // Apply category filter
    if (currentFilter !== 'all') {
        posts = posts.filter(post => post.category === currentFilter);
    }

    filteredPosts = posts;
    loadPosts();
}

/**
 * Load posts into the browse section
 */
function loadPosts() {
    const postsGrid = document.getElementById('all-posts-grid');
    if (!postsGrid) return;

    // Clear existing content
    postsGrid.innerHTML = '';

    // Get posts to display
    let postsToShow = [...filteredPosts];

    // Apply sorting
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        const sortValue = sortFilter.value;
        if (sortValue === 'oldest') {
            postsToShow.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            postsToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    }

    // Apply pagination
    const startIndex = 0;
    const endIndex = currentPage * postsPerPage;
    postsToShow = postsToShow.slice(startIndex, endIndex);

    // Display posts
    if (postsToShow.length === 0) {
        postsGrid.innerHTML = '<div class="no-posts">No posts found matching your criteria.</div>';
    } else {
        postsToShow.forEach(post => {
            const postCard = createPostCard(post);
            postsGrid.appendChild(postCard);
        });
    }

    // Update load more button
    updateLoadMoreButton();
}

/**
 * Initialize load more functionality
 */
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', function() {
        currentPage++;
        loadPosts();
    });
}

/**
 * Update load more button visibility
 */
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;

    const totalPosts = filteredPosts.length;
    const loadedPosts = currentPage * postsPerPage;

    if (loadedPosts >= totalPosts) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

/**
 * Get current post ID from URL or page content
 */
function getCurrentPostId() {
    // Try to extract from URL
    const urlParts = window.location.pathname.split('/');
    const filename = urlParts[urlParts.length - 1];

    // Extract ID from filename (e.g., "01-the-core-of-judaism.html" -> 1)
    const match = filename.match(/^(\d+)/);
    if (match) {
        return parseInt(match[1]);
    }

    return null;
}

/**
 * Populate series navigation for blog post pages
 */
function populateSeriesNavigation(currentId) {
    const prevPost = getPreviousPost(currentId);
    const nextPost = getNextPost(currentId);

    const prevButton = document.querySelector('.nav-prev');
    const nextButton = document.querySelector('.nav-next');

    if (prevButton && prevPost) {
        prevButton.href = prevPost.url;
        prevButton.classList.remove('disabled');
        prevButton.querySelector('.nav-icon').textContent = '⬅';
    } else if (prevButton) {
        prevButton.classList.add('disabled');
        prevButton.removeAttribute('href');
    }

    if (nextButton && nextPost) {
        nextButton.href = nextPost.url;
        nextButton.classList.remove('disabled');
        nextButton.querySelector('.nav-icon').textContent = '➡';
    } else if (nextButton) {
        nextButton.classList.add('disabled');
        nextButton.removeAttribute('href');
    }

    // Update series progress
    const currentPost = getPostById(currentId);
    if (currentPost) {
        const progressElements = document.querySelectorAll('.series-progress');
        progressElements.forEach(element => {
            element.textContent = `Week ${currentPost.seriesNumber} of 100+`;
        });
    }
}

/**
 * Populate related posts section
 */
function populateRelatedPosts(currentId) {
    const currentPost = getPostById(currentId);
    if (!currentPost) return;

    const relatedPostsGrid = document.querySelector('.related-posts-grid');
    if (!relatedPostsGrid) return;

    // Get previous and next posts
    const prevPost = getPreviousPost(currentId);
    const nextPost = getNextPost(currentId);

    const postsToShow = [];
    if (prevPost) postsToShow.push(prevPost);
    if (nextPost) postsToShow.push(nextPost);

    // Clear existing content
    relatedPostsGrid.innerHTML = '';

    postsToShow.forEach(post => {
        const relatedCard = document.createElement('article');
        relatedCard.className = 'related-post-card';

        relatedCard.innerHTML = `
            <div class="related-post-content">
                <div class="post-meta">
                    <span class="post-category">${post.category}</span>
                    <span class="post-date">${formatDate(post.date)}</span>
                    <span class="post-read-time">${post.readTime}</span>
                </div>
                <h4 class="related-post-title">
                    <a href="${post.url}">${post.title}</a>
                </h4>
                <p class="related-post-excerpt">${post.excerpt}</p>
                <a href="${post.url}" class="btn-cta-white-blue">
                    <span class="btn-icon">▶</span>
                    Read ${post.id < currentId ? 'Previous' : 'Next'}
                </a>
            </div>
        `;

        relatedPostsGrid.appendChild(relatedCard);
    });
}

/**
 * Initialize sharing functionality
 */
function initializeShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');

    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.classList.contains('share-facebook') ? 'facebook' :
                           this.classList.contains('share-twitter') ? 'twitter' :
                           this.classList.contains('share-whatsapp') ? 'whatsapp' : 'copy';

            shareOnPlatform(platform);
        });
    });
}

/**
 * Share on specific platform
 */
function shareOnPlatform(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const description = encodeURIComponent(getMetaDescription());

    let shareUrl = '';

    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}&via=RealJudaism`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${title}%20${url}`;
            break;
        case 'copy':
            copyToClipboard(window.location.href);
            showCopySuccess();
            return;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

/**
 * Get meta description for sharing
 */
function getMetaDescription() {
    const metaDesc = document.querySelector('meta[name="description"]');
    return metaDesc ? metaDesc.getAttribute('content') : '';
}

/**
 * Copy URL to clipboard
 */
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess();
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            showCopySuccess();
        } catch (err) {
            console.error('Fallback: Could not copy text: ', err);
        }

        textArea.remove();
    }
}

/**
 * Show copy success message
 */
function showCopySuccess() {
    const copyBtn = document.querySelector('.share-link');
    if (copyBtn) {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="share-icon">✓</span> Copied!';

        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    }
}

/**
 * Initialize newsletter form
 */
function initializeNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const emailInput = this.querySelector('input[type="email"]');
        const submitBtn = this.querySelector('button[type="submit"]');

        if (!emailInput.value) {
            showFormMessage('Please enter your email address', 'error');
            return;
        }

        // Simulate form submission
        submitBtn.textContent = 'Subscribing...';
        submitBtn.disabled = true;

        setTimeout(() => {
            showFormMessage('Thank you for subscribing! Check your email for confirmation.', 'success');
            emailInput.value = '';
            submitBtn.textContent = 'Subscribe to Series';
            submitBtn.disabled = false;
        }, 2000);
    });
}

/**
 * Show form message
 */
function showFormMessage(message, type) {
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;

    const form = document.querySelector('.newsletter-form');
    form.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

/**
 * Add reading progress indicator
 */
function addReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 4px;
        background: var(--color-primary);
        z-index: 1000;
        transition: width 0.1s ease;
    `;

    document.body.appendChild(progressBar);

    function updateProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress();
}

