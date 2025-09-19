function initializePostNavigation(currentIndex, posts) {
    const navContainer = document.getElementById('post-navigation');
    if (!navContainer) return;

    const prevPost = posts[currentIndex - 1];
    const nextPost = posts[currentIndex + 1];

    let navHtml = '';

    if (prevPost) {
        navHtml += `<a href="${prevPost.slug}.html" class="premium-post-nav-link prev">
                        <div class="nav-label">הקודם</div>
                        <div class="nav-title">${prevPost.title}</div>
                    </a>`;
    } else {
        navHtml += `<a href="#" class="premium-post-nav-link prev disabled">
                        <div class="nav-label">הקודם</div>
                        <div class="nav-title">זהו הפוסט הראשון</div>
                    </a>`;
    }

    if (nextPost) {
        const nextPostDate = new Date(nextPost.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (nextPostDate <= today) {
            navHtml += `<a href="${nextPost.slug}.html" class="premium-post-nav-link next">
                            <div class="nav-label">הבא</div>
                            <div class="nav-title">${nextPost.title}</div>
                        </a>`;
        } else {
            navHtml += `<a href="#" class="premium-post-nav-link next disabled">
                            <div class="nav-label">הבא</div>
                            <div class="nav-title">יפורסם ב-${formatDateHebrew(nextPost.date)}</div>
                        </a>`;
        }
    } else {
        navHtml += `<a href="#" class="premium-post-nav-link next disabled">
                        <div class="nav-label">הבא</div>
                        <div class="nav-title">זהו הפוסט האחרון</div>
                    </a>`;
    }

    navContainer.innerHTML = navHtml;
}

function formatDateHebrew(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long' };
    return new Intl.DateTimeFormat('he-IL', options).format(date);
}
