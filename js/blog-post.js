/**
 * Blog Post Page JavaScript
 * Handles individual blog post functionality, sharing, and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeBlogPost();
});

/**
 * Initialize blog post functionality
 */
function initializeBlogPost() {
    initializeShareButtons();
    initializeReadingTime();
    initializeTableOfContents();
    addReadingProgress();
    initializeImageLazyLoading();
}

/**
 * Initialize sharing functionality for blog posts
 */
function initializeShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');

    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.getAttribute('data-share');
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
                    showCopySuccess(this);
                    return;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
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
function showCopySuccess(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<svg viewBox="0 0 24 24" class="share-icon"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}

/**
 * Calculate and display reading time
 */
function initializeReadingTime() {
    const articleContent = document.querySelector('.article-body');
    if (!articleContent) return;

    const text = articleContent.textContent;
    const wordCount = text.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200); // Average reading speed

    const readingTimeElement = document.querySelector('.article-read-time');
    if (readingTimeElement) {
        readingTimeElement.textContent = `${readingTimeMinutes} min read`;
    }
}

/**
 * Generate table of contents from headings
 */
function initializeTableOfContents() {
    const articleBody = document.querySelector('.article-body');
    if (!articleBody) return;

    const headings = articleBody.querySelectorAll('h2');
    if (headings.length < 3) return; // Only show TOC if there are enough headings

    const toc = document.createElement('nav');
    toc.className = 'table-of-contents';
    toc.innerHTML = `
        <h3 class="toc-title">Table of Contents</h3>
        <ul class="toc-list"></ul>
    `;

    const tocList = toc.querySelector('.toc-list');

    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;

        const li = document.createElement('li');
        li.innerHTML = `<a href="#${id}" class="toc-link">${heading.textContent}</a>`;
        tocList.appendChild(li);
    });

    // Insert TOC after article meta
    const articleMeta = document.querySelector('.article-meta');
    if (articleMeta) {
        articleMeta.insertAdjacentElement('afterend', toc);
    }

    // Smooth scroll for TOC links
    toc.addEventListener('click', function(e) {
        if (e.target.classList.contains('toc-link')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }
        }
    });
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
        background: linear-gradient(90deg, #ed8936, #d97706);
        z-index: 1000;
        transition: width 0.25s ease;
    `;

    document.body.appendChild(progressBar);

    function updateProgress() {
        const article = document.querySelector('.article-content');
        if (!article) return;

        const scrollTop = window.pageYOffset;
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;

        // Calculate progress based on article position
        const scrollProgress = Math.max(0, scrollTop - articleTop);
        const totalScrollable = articleHeight - windowHeight;
        const progress = Math.min(100, (scrollProgress / totalScrollable) * 100);

        progressBar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress();
}

/**
 * Initialize lazy loading for images
 */
function initializeImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-loading');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy-loading');
        });
    }
}

/**
 * Highlight current section in TOC based on scroll position
 */
function highlightCurrentSection() {
    const tocLinks = document.querySelectorAll('.toc-link');
    if (tocLinks.length === 0) return;

    const headings = document.querySelectorAll('.article-body h2');

    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100; // Offset for header

        headings.forEach((heading, index) => {
            const headingTop = heading.offsetTop;
            const headingBottom = headingTop + heading.offsetHeight;

            if (scrollPosition >= headingTop && scrollPosition < headingBottom) {
                tocLinks.forEach(link => link.classList.remove('active'));
                tocLinks[index].classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
}

// Initialize TOC highlighting if TOC exists
if (document.querySelector('.table-of-contents')) {
    highlightCurrentSection();
}

