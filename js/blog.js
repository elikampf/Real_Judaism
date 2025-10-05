/**
 * Blog Page JavaScript
 * Handles blog functionality, sharing, and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeBlogPage();
    loadBlogPosts();
});

// Global variables for filtering
let allPosts = [];
let filteredPosts = [];
let currentFilter = 'all';
let currentSort = 'newest';
let currentSearch = '';

/**
 * Initialize blog page functionality
 */
function initializeBlogPage() {
    initializeShareButtons();
    initializeNewsletterForm();
    initializePostFilters();
    initializeLoadMore();
    initializeBlogFiltering();
}

/**
 * Load and render blog posts from JSON data
 */
async function loadBlogPosts() {
    try {
        const response = await fetch('../data/blog_posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const posts = await response.json();
        
        // --- Date-aware logic to find the current post ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to midnight

        let latestPostIndex = -1;

        // Find the index of the most recent post that has been published
        posts.forEach((post, index) => {
            const postDate = new Date(post.date);
            if (postDate <= today) {
                latestPostIndex = index;
            }
        });
        
        // If no posts are published yet (e.g., all future dates), default to the first post.
        if (latestPostIndex === -1) {
            latestPostIndex = 0;
        }

        const latestPost = posts[latestPostIndex];
        const upcomingPosts = posts.slice(latestPostIndex + 1, latestPostIndex + 4); // Get the next 3 posts

        // Store all posts globally for filtering
        allPosts = posts;

        renderLatestPost(latestPost);
        renderBlogArchive(posts, latestPostIndex);
        renderUpcomingPosts(upcomingPosts, latestPostIndex); // Pass a flag if the first post is not the latest

        // Hide skeleton loaders when content loads
        document.getElementById('latest-post-container').classList.add('loaded');
        document.getElementById('archive-loading').style.display = 'none';
        document.getElementById('upcoming-posts-container').classList.add('loaded');

        // Update progress indicator
        updateProgressIndicator(posts, latestPostIndex);

        // Initialize filter bar visibility after content loads
        setTimeout(() => {
            const filterBar = document.getElementById('blog-filter-bar');
            if (filterBar) {
                filterBar.style.opacity = '1';
                filterBar.style.transform = 'translateY(0)';
            }
        }, 500);

    } catch (error) {
        console.error("Could not load blog posts:", error);
        // Optionally display an error message on the page
        const latestPostContainer = document.getElementById('latest-post-container');
        if (latestPostContainer) {
            latestPostContainer.innerHTML = '<p class="error-message">Could not load the latest post. Please try again later.</p>';
            latestPostContainer.classList.add('loaded');
        }
        const upcomingPostsContainer = document.getElementById('upcoming-posts-container');
        if (upcomingPostsContainer) {
            upcomingPostsContainer.innerHTML = '<p class="error-message">Could not load upcoming posts. Please try again later.</p>';
            upcomingPostsContainer.classList.add('loaded');
        }

        // Update progress indicator with fallback values
        updateProgressIndicatorWithFallback();
    }
}

/**
 * Render all published posts in the archive grid (excluding the latest featured post)
 */
function renderBlogArchive(posts, latestPostIndex) {
    const archiveContainer = document.getElementById('blog-archive-grid');
    if (!archiveContainer || !posts) return;

    // Get all published posts except the latest one (which is featured)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const archivePosts = posts.filter((post, index) => {
        const postDate = new Date(post.date);
        return postDate <= today && index !== latestPostIndex;
    });

    if (archivePosts.length === 0) {
        archiveContainer.innerHTML = '<p class="no-archive-posts">No archived posts available yet.</p>';
        return;
    }

    let archiveHtml = '';
    archivePosts.forEach(post => {
        const weekNumber = post.week_number.split(' ')[1];
        archiveHtml += `
            <article class="blog-card">
                <div class="blog-card-header">
                    <div class="blog-card-week">
                        Week ${weekNumber}
                    </div>
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                </div>
                <div class="blog-card-footer">
                    <span class="blog-card-meta">Published on ${post.date} • ${post.read_time}</span>
                    <a href="blog/${post.slug}.html" class="blog-card-link">Read More</a>
                </div>
            </article>
        `;
    });

    archiveContainer.innerHTML = archiveHtml;
}

/**
 * Render the latest post on the blog homepage
 */
function renderLatestPost(post) {
    const container = document.getElementById('latest-post-container');
    if (!container || !post) return;

    const weekNumber = post.week_number.split(' ')[1];

    // Format the date nicely
    const postDate = new Date(post.date);
    const formattedDate = postDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    container.innerHTML = `
        <div class="featured-post-card-enhanced">
            <div class="featured-post-bg"></div>
            <div class="featured-post-content">
                <div class="featured-post-header">
                    <div class="featured-post-label">
                        <span class="featured-badge">Latest Post</span>
                    </div>
                    <div class="week-badge-featured">
                         <span class="week-label-featured">Week</span>
                         <span class="week-number-featured">${weekNumber}</span>
                    </div>
                </div>

                <div class="featured-post-main">
                    <h1 class="featured-post-title">${post.title}</h1>
                    <p class="featured-post-excerpt">${post.excerpt}</p>
                </div>

                <div class="featured-post-meta">
                    <div class="meta-item">
                        <span class="meta-icon">📅</span>
                        <span class="meta-text">${formattedDate}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">⏱️</span>
                        <span class="meta-text">${post.read_time}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">✍️</span>
                        <span class="meta-text">Rabbi Ari Klapper</span>
                    </div>
                </div>

                <div class="featured-post-actions">
                    <a href="blog/${post.slug}.html" class="btn-featured-primary">
                        <span class="btn-text">Start Reading</span>
                        <span class="btn-icon">→</span>
                    </a>
                    <button onclick="scrollToArchive()" class="btn-featured-secondary">
                        <span class="btn-text">View All Posts</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render all subsequent posts as a journey/timeline
 */
function renderUpcomingPosts(posts, latestPostIndex) {
    const container = document.getElementById('upcoming-posts-container');
    if (!container || !posts) return;

    if (posts.length === 0) {
        container.innerHTML = '<p class="no-more-posts">You are all caught up! More posts coming soon.</p>';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let postsHtml = '';
    posts.forEach((post, index) => {
        const weekNumber = post.week_number.split(' ')[1];
        const postDate = new Date(post.date);
        const isPublished = postDate <= today;
        const cardState = isPublished ? 'published' : 'locked';
        
        postsHtml += `
            <div class="journey-post-card-wrapper">
                <div class="journey-line"></div>
                <div class="journey-post-card ${cardState}">
                    <div class="journey-card-header">
                        <div class="week-badge-journey">
                            <span class="week-number-journey">${weekNumber}</span>
                        </div>
                        <div class="journey-card-meta">
                            <h3 class="journey-card-title">${post.title}</h3>
                            <span class="journey-card-date">${ isPublished ? `Published on ${post.date}` : `Coming on ${post.date}` }</span>
                        </div>
                    </div>
                    <p class="journey-card-excerpt">${post.excerpt}</p>
                    <div class="journey-card-footer">
                        ${ isPublished
                            ? `<a href="blog/${post.slug}.html" class="btn-secondary">Read Article <span class="btn-icon">→</span></a>`
                            : `<span class="status-badge-locked">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
                                Locked
                               </span>`
                        }
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = postsHtml;
}

/**
 * Update the blog series progress indicator
 */
function updateProgressIndicator(posts, latestPostIndex) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (!progressFill || !progressText || !posts || posts.length === 0) {
        return;
    }

    const totalPosts = posts.length;
    const currentWeekNumber = parseInt(posts[latestPostIndex].week_number.split(' ')[1]);
    const progressPercentage = (currentWeekNumber / totalPosts) * 100;
    const remainingWeeks = totalPosts - currentWeekNumber;

    // Update progress bar width
    progressFill.style.width = progressPercentage + '%';

    // Update progress text
    progressText.textContent = `Week ${currentWeekNumber} of ${totalPosts} • ${remainingWeeks} more week${remainingWeeks !== 1 ? 's' : ''} of wisdom`;
}

/**
 * Update the blog series progress indicator with fallback values when posts can't be loaded
 */
function updateProgressIndicatorWithFallback() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (!progressFill || !progressText) {
        return;
    }

    // Set a default progress (e.g., 25% if we can't load the data)
    const fallbackProgress = 25;
    progressFill.style.width = fallbackProgress + '%';
    progressText.textContent = 'Building Your Jewish Home • Weekly Torah wisdom series';
}

/**
 * Initialize sharing functionality
 */
function initializeShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');

    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.getAttribute('data-share');
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);

            let shareUrl = '';

            switch(platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
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
        });
    });
}

/**
 * Copy URL to clipboard
 */
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
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
    const button = document.querySelector('[data-share="copy"]');
    const originalText = button.textContent;

    button.textContent = '✓ Copied!';
    button.style.backgroundColor = '#10b981';

    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 2000);
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
            submitBtn.textContent = 'Subscribe';
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
 * Initialize blog filtering functionality
 */
function initializeBlogFiltering() {
    // Initialize filter bar with fade-in animation
    const filterBar = document.getElementById('blog-filter-bar');
    if (filterBar) {
        filterBar.style.opacity = '0';
        filterBar.style.transform = 'translateY(-20px)';
        filterBar.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    }

    // Initialize filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            applyFilter(filter);
        });
    });

    // Initialize search input
    const searchInput = document.getElementById('blog-search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applySearch(this.value);
            }, 300); // Debounce search
        });
    }

    // Initialize sort dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            applySort(this.value);
        });
    }
}

/**
 * Apply category filter
 */
function applyFilter(filter) {
    currentFilter = filter;
    updateActiveFilters();
    applyAllFilters();
}

/**
 * Apply search filter
 */
function applySearch(searchTerm) {
    currentSearch = searchTerm.toLowerCase();
    updateActiveFilters();
    applyAllFilters();
}

/**
 * Apply sort order
 */
function applySort(sort) {
    currentSort = sort;
    applyAllFilters();
}

/**
 * Apply all active filters and update display
 */
function applyAllFilters() {
    if (allPosts.length === 0) return;

    // Start with all published posts (excluding latest featured post)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filteredPosts = allPosts.filter((post, index) => {
        const postDate = new Date(post.date);
        return postDate <= today; // Only published posts
    });

    // Apply category filter
    if (currentFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => {
            // For demo purposes, categorize based on title/content
            // In a real implementation, you'd have a category field in the JSON
            const title = post.title.toLowerCase();
            const excerpt = post.excerpt.toLowerCase();

            switch(currentFilter) {
                case 'foundation':
                    return title.includes('core') || title.includes('foundation') || excerpt.includes('core') || excerpt.includes('foundation');
                case 'marriage':
                    return title.includes('marriage') || title.includes('home') || excerpt.includes('marriage') || excerpt.includes('home');
                case 'spirituality':
                    return title.includes('spiritual') || title.includes('growth') || excerpt.includes('spiritual') || excerpt.includes('growth');
                default:
                    return true;
            }
        });
    }

    // Apply search filter
    if (currentSearch) {
        filteredPosts = filteredPosts.filter(post => {
            const title = post.title.toLowerCase();
            const excerpt = post.excerpt.toLowerCase();
            return title.includes(currentSearch) || excerpt.includes(currentSearch);
        });
    }

    // Apply sorting
    filteredPosts = sortPosts(filteredPosts, currentSort);

    // Update display
    updateBlogArchiveDisplay();
}

/**
 * Sort posts based on selected criteria
 */
function sortPosts(posts, sortBy) {
    const sortedPosts = [...posts];

    switch(sortBy) {
        case 'newest':
            return sortedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'oldest':
            return sortedPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'alphabetical':
            return sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
        default:
            return sortedPosts;
    }
}

/**
 * Update the blog archive display with filtered results
 */
function updateBlogArchiveDisplay() {
    const gridContainer = document.getElementById('blog-archive-grid');
    const noResultsContainer = document.getElementById('no-results');

    if (filteredPosts.length === 0) {
        // Show no results message
        gridContainer.style.display = 'none';
        noResultsContainer.style.display = 'block';
    } else {
        // Show filtered posts
        noResultsContainer.style.display = 'none';
        gridContainer.style.display = 'grid';

        // Re-render the grid with filtered posts
        let archiveHtml = '';
        filteredPosts.forEach(post => {
            const weekNumber = post.week_number.split(' ')[1];
            archiveHtml += `
                <article class="blog-card">
                    <div class="blog-card-header">
                        <div class="blog-card-week">
                            Week ${weekNumber}
                        </div>
                        <h3 class="blog-card-title">${post.title}</h3>
                        <p class="blog-card-excerpt">${post.excerpt}</p>
                    </div>
                    <div class="blog-card-footer">
                        <span class="blog-card-meta">Published on ${post.date} • ${post.read_time}</span>
                        <a href="blog/${post.slug}.html" class="blog-card-link">Read More</a>
                    </div>
                </article>
            `;
        });

        gridContainer.innerHTML = archiveHtml;
    }
}

/**
 * Update active filters display
 */
function updateActiveFilters() {
    const activeFiltersContainer = document.getElementById('active-filters');
    if (!activeFiltersContainer) return;

    let activeFiltersHtml = '';

    if (currentFilter !== 'all') {
        const filterNames = {
            'foundation': 'Blog',
            'marriage': 'Marriage',
            'spirituality': 'Spirituality'
        };
        activeFiltersHtml += `
            <span class="active-filter-tag">
                ${filterNames[currentFilter] || currentFilter}
                <button class="remove-filter" onclick="applyFilter('all')">×</button>
            </span>
        `;
    }

    if (currentSearch) {
        activeFiltersHtml += `
            <span class="active-filter-tag">
                Search: "${currentSearch}"
                <button class="remove-filter" onclick="applySearch('')">×</button>
            </span>
        `;
    }

    activeFiltersContainer.innerHTML = activeFiltersHtml;
}

/**
 * Clear all filters
 */
function clearFilters() {
    currentFilter = 'all';
    currentSearch = '';
    currentSort = 'newest';

    // Reset UI elements
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');

    document.getElementById('blog-search').value = '';
    document.getElementById('sort-select').value = 'newest';

    // Clear active filters display
    document.getElementById('active-filters').innerHTML = '';

    // Reapply filters (which will show all posts)
    applyAllFilters();
}

/**
 * Initialize post filters (if needed for future expansion)
 */
function initializePostFilters() {
    // This is now handled by initializeBlogFiltering()
    // Keeping for backward compatibility
}

/**
 * Filter blog posts (placeholder for future implementation)
 */
function filterPosts(filter) {
    // This would filter posts based on category, date, etc.
    // For now, just log the filter
    console.log('Filtering posts by:', filter);
}

/**
 * Initialize load more functionality
 */
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-posts');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', function() {
        this.textContent = 'Loading...';

        // Simulate loading more posts
        setTimeout(() => {
            // In a real implementation, this would fetch more posts from an API
            // For now, just hide the button
            this.style.display = 'none';

            // Show message that there are no more posts
            const message = document.createElement('p');
            message.className = 'no-more-posts';
            message.textContent = 'No more posts to load.';
            this.parentNode.appendChild(message);
        }, 1500);
    });
}

/**
 * Scroll to posts section
 */
function scrollToPosts() {
    const postsSection = document.getElementById('posts');
    if (postsSection) {
        postsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Scroll to blog archive section
 */
function scrollToArchive() {
    const archiveSection = document.querySelector('.blog-archive-section');
    if (archiveSection) {
        archiveSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
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
        height: 3px;
        background: linear-gradient(90deg, #ed8936, #d97706);
        z-index: 1000;
        transition: width 0.25s ease;
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

// Initialize reading progress on blog post pages
if (document.querySelector('.article-content')) {
    addReadingProgress();
}

