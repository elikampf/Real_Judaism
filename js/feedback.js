/**
 * Real Judaism Feedback Form - JavaScript
 * Handles rating stars, form validation, and feedback form functionality
 */

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeRatingStars();
    initializeFeedbackForm();
});

/**
 * Initialize Rating Stars Functionality
 */
function initializeRatingStars() {
    const starLabels = document.querySelectorAll('.star-label');
    const ratingLabels = document.querySelectorAll('.rating-label');
    const starRadios = document.querySelectorAll('.star-radio');

    starLabels.forEach((label, index) => {
        label.addEventListener('click', function() {
            const rating = index + 1;

            // Update visual feedback
            updateStarDisplay(rating);

            // Update rating text
            updateRatingText(rating);

            // Set the radio button
            starRadios[index].checked = true;
        });

        // Add hover effects
        label.addEventListener('mouseenter', function() {
            const hoverRating = index + 1;
            updateStarDisplay(hoverRating, true);
            updateRatingText(hoverRating, true);
        });

        label.addEventListener('mouseleave', function() {
            // Reset to selected rating or default state
            const checkedRadio = document.querySelector('.star-radio:checked');
            if (checkedRadio) {
                const selectedRating = parseInt(checkedRadio.value);
                updateStarDisplay(selectedRating);
                updateRatingText(selectedRating);
            } else {
                resetStarDisplay();
            }
        });
    });
}

/**
 * Update Star Display
 */
function updateStarDisplay(rating, isHover = false) {
    const starLabels = document.querySelectorAll('.star-label');

    starLabels.forEach((label, index) => {
        if (index < rating) {
            label.classList.add('active');
            if (isHover) {
                label.classList.add('hover');
            }
        } else {
            label.classList.remove('active', 'hover');
        }
    });
}

/**
 * Update Rating Text
 */
function updateRatingText(rating, isHover = false) {
    const ratingLabels = document.querySelectorAll('.rating-label');

    ratingLabels.forEach(label => {
        const labelRating = parseInt(label.getAttribute('data-rating'));
        if (labelRating === rating) {
            label.classList.add('active');
            if (isHover) {
                label.classList.add('hover');
            }
        } else {
            label.classList.remove('active', 'hover');
        }
    });
}

/**
 * Reset Star Display
 */
function resetStarDisplay() {
    const starLabels = document.querySelectorAll('.star-label');
    const ratingLabels = document.querySelectorAll('.rating-label');

    starLabels.forEach(label => {
        label.classList.remove('active', 'hover');
    });

    ratingLabels.forEach(label => {
        label.classList.remove('active', 'hover');
    });
}

/**
 * Initialize Feedback Form
 */
function initializeFeedbackForm() {
    const feedbackForm = document.querySelector('.feedback-form');

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            const name = this.querySelector('#name');
            const email = this.querySelector('#email');
            const rating = this.querySelector('input[name="rating"]:checked');
            const likes = this.querySelector('#likes');
            const improvements = this.querySelector('#improvements');
            const bugs = this.querySelector('#bugs');
            const submitBtn = this.querySelector('button[type="submit"]');

            // Basic validation - at least one field should be filled
            const hasContent = (
                (name.value.trim() !== '') ||
                (email.value.trim() !== '') ||
                rating ||
                (likes.value.trim() !== '') ||
                (improvements.value.trim() !== '') ||
                (bugs.value.trim() !== '')
            );

            if (!hasContent) {
                e.preventDefault();
                showFeedbackError('Please fill out at least one field to submit your feedback.');
                return;
            }

            // Email validation if provided
            if (email.value.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.value)) {
                    e.preventDefault();
                    showFeedbackError('Please enter a valid email address.');
                    email.focus();
                    return;
                }
            }

            // Track form submission with GA4
            trackFormSubmission('feedback_form', {
                form_name: 'feedback',
                form_location: window.location.pathname,
                has_rating: !!rating,
                has_likes: likes.value.trim() !== '',
                has_improvements: improvements.value.trim() !== '',
                has_bugs: bugs.value.trim() !== '',
                rating_value: rating ? rating.value : null
            });

            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
                submitBtn.classList.add('loading');
            }
        });

        // Real-time validation
        const inputs = feedbackForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateFeedbackField(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    // Remove error message if it exists
                    const errorMsg = this.parentNode.querySelector('.field-error');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
        });
    }
}

/**
 * Validate Individual Feedback Field
 */
function validateFeedbackField(field) {
    const value = field.value.trim();

    // Remove existing error
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address.');
            return false;
        }
    }

    field.classList.remove('error');
    return true;
}

/**
 * Show Feedback Error Message
 */
function showFeedbackError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.feedback-error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'feedback-error-message';
    errorDiv.style.cssText = `
        background-color: rgba(229, 62, 62, 0.1);
        border: 1px solid rgba(229, 62, 62, 0.2);
        color: #c53030;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
    `;
    errorDiv.textContent = message;

    // Insert before form
    const feedbackForm = document.querySelector('.feedback-form');
    feedbackForm.insertBefore(errorDiv, feedbackForm.firstChild);

    // Remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

/**
 * Show Field-Specific Error
 */
function showFieldError(field, message) {
    // Add error class to field
    field.classList.add('error');

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #e53e3e;
        font-size: 14px;
        margin-top: 4px;
        font-weight: 500;
    `;

    // Insert after field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

/**
 * Google Analytics 4 Tracking Functions for Feedback
 */

// Track form submissions
function trackFormSubmission(formType, additionalData = {}) {
    const consent = localStorage.getItem('cookie-consent');
    if (typeof gtag !== 'undefined' && consent === 'accepted') {
        gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: formType,
            page_location: window.location.href,
            ...additionalData
        });
    }
}

/**
 * Utility Functions
 */

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}














































































