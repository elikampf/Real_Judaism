/**
 * Blog Page JavaScript
 * Handles blog functionality, sharing, and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeBlogPage();
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

