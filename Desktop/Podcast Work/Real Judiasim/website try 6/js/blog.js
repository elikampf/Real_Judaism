// Simple blog loader
async function loadBlogPosts() {
    try {
        const response = await fetch('data/blog_posts.json');
        const data = await response.json();

        const blogPostsContainer = document.getElementById('blog-posts');
        blogPostsContainer.innerHTML = '';

        data.forEach(post => {
            const postElement = document.createElement('article');
            postElement.innerHTML = `
                <h3><a href="blog/${post.slug}.html">${post.title}</a></h3>
                <p>${post.excerpt}</p>
                <p><small>${post.date} • ${post.read_time}</small></p>
                <hr>
            `;
            blogPostsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
        document.getElementById('blog-posts').innerHTML = '<p>Error loading blog posts.</p>';
    }
}

// Load blog posts when page loads
document.addEventListener('DOMContentLoaded', loadBlogPosts);
