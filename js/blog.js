/**
 * Blog Page JavaScript
 * Handles blog functionality, sharing, and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeBlogPage();
    loadBlogPosts();
});

/**
 * Initialize blog page functionality
 */
function initializeBlogPage() {
    initializeShareButtons();
    initializeNewsletterForm();
    initializePostFilters();
    initializeLoadMore();
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

        renderLatestPost(latestPost);
        renderUpcomingPosts(upcomingPosts, latestPostIndex); // Pass a flag if the first post is not the latest

    } catch (error) {
        console.error("Could not load blog posts:", error);
        // Optionally display an error message on the page
        const latestPostContainer = document.getElementById('latest-post-container');
        if (latestPostContainer) {
            latestPostContainer.innerHTML = '<p class="error-message">Could not load the latest post. Please try again later.</p>';
        }
        const upcomingPostsContainer = document.getElementById('upcoming-posts-container');
        if (upcomingPostsContainer) {
            upcomingPostsContainer.innerHTML = '<p class="error-message">Could not load upcoming posts. Please try again later.</p>';
        }
    }
}

/**
 * Render the latest post on the blog homepage
 */
function renderLatestPost(post) {
    const container = document.getElementById('latest-post-container');
    if (!container || !post) return;

    const weekNumber = post.week_number.split(' ')[1];

    container.innerHTML = `
        <div class="featured-post-card-light">
            <div class="accent-bar accent-${(parseInt(weekNumber) % 4) + 1}"></div>
            <div class="card-content">
                <div class="card-header">
                    <span class="card-eyebrow">Latest Published Post</span>
                    <div class="week-badge-light">
                         <span class="week-label">Week</span>
                         <span class="week-number">${weekNumber}</span>
                    </div>
                </div>
                <h2 class="card-title">${post.title}</h2>
                <p class="card-excerpt">${post.excerpt}</p>
                <div class="card-footer">
                    <span class="card-meta">Published on ${post.date} • ${post.read_time}</span>
                    <a href="blog/${post.slug}.html" class="btn-primary">
                        Start Reading <span class="btn-icon">→</span>
                    </a>
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
 * Initialize post filters (if needed for future expansion)
 */
function initializePostFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            filterPosts(filter);
        });
    });
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

