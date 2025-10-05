import json
import os

def create_blog_post_pages():
    # Load the JSON data
    try:
        with open('data/blog_posts.json', 'r', encoding='utf-8') as f:
            posts = json.load(f)
    except FileNotFoundError:
        print("Error: data/blog_posts.json not found.")
        return
    except json.JSONDecodeError:
        print("Error: Could not decode JSON from data/blog_posts.json.")
        return

    # Create the blog directory if it doesn't exist
    if not os.path.exists('blog'):
        os.makedirs('blog')

    # HTML template based on week-1-the-core-of-judaism.html
    html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Building Your Jewish Home</title>
    <meta name="description" content="{excerpt}">
    <meta name="keywords" content="Building Your Jewish Home, {week_number}, {title}">

    <!-- Google Fonts - Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../images/favicon.ico">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="../css/main.css">
    <link rel="stylesheet" href="../css/components.css">

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="{title} - Building Your Jewish Home">
    <meta property="og:description" content="{excerpt}">
    <meta property="og:image" content="../images/profile.png">
    <meta property="og:url" content="https://real-judaism.com/blog/{slug}">
    <meta property="og:type" content="article">
</head>
<body>

    <!-- Navigation -->
    <header class="site-header">
        <nav class="main-navigation">
            <div class="nav-container">
                <div class="nav-brand-left">
                    <a href="../index.html" class="brand-link">
                        <span class="tagline">Real Judaism</span>
                    </a>
                </div>
                <ul class="nav-menu">
                    <li><a href="../index.html" class="nav-link">Home</a></li>
                    <li class="nav-dropdown">
                        <a href="#" class="nav-link dropdown-toggle">Podcast <span class="dropdown-icon">▼</span></a>
                        <ul class="dropdown-menu">
                            <li><a href="../index.html" class="dropdown-link">All Podcasts</a></li>
                            <li><a href="../series/dating.html" class="dropdown-link">Dating</a></li>
                            <li><a href="../series/shalom-bayis.html" class="dropdown-link">Shalom Bayis</a></li>
                            <li><a href="../series/shmiras-einayim.html" class="dropdown-link">Shmiras Einayim</a></li>
                            <li><a href="../series/shmiras-halashon.html" class="dropdown-link">Shmiras Halashon</a></li>
                            <li><a href="../series/shabbos.html" class="dropdown-link">Shabbos Malkesa</a></li>
                            <li><a href="../series/mesilas-yesharim.html" class="dropdown-link">Mesilas Yesharim</a></li>
                        </ul>
                    </li>
                    <li><a href="../blog.html" class="nav-link active">Blog</a></li>
                    <li><a href="../about.html" class="nav-link">About</a></li>
                    <li><a href="../hebrew-home/index.html" class="nav-link hebrew-link">הבית הישראלי</a></li>
                </ul>
                <button class="mobile-menu-btn" aria-label="Toggle mobile menu">☰</button>
            </div>
        </nav>
    </header>

    <main class="main-content" id="main-content">
        <!-- Article Header -->
        <section class="article-header">
            <div class="container">
                <nav class="hero-breadcrumbs">
                    <a href="../blog.html" class="breadcrumb-link">Building Your Jewish Home</a>
                    <span class="breadcrumb-separator">></span>
                    <span class="breadcrumb-item">{week_number}</span>
                </nav>
                <h1 class="article-title">{title}</h1>
                <div class="article-meta">
                    <span class="article-category">Building Your Jewish Home - {week_number}</span>
                    <span class="article-date">{date}</span>
                    <span class="article-read-time">{read_time}</span>
                </div>
            </div>
        </section>

        <!-- Article Content -->
        <section class="article-content">
            <div class="container">
                <div class="premium-article-body">
                    {full_content}
                    <!-- Navigation between posts -->
                    <div class="premium-post-navigation">
                        {prev_post_link}
                        {next_post_link}
                    </div>
                    <!-- Back to Blog -->
                    <div class="back-to-blog">
                        <a href="../blog.html" class="btn-secondary">
                            <span class="btn-icon">←</span>
                            Back to Blog Homepage
                        </a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="footer-about">
                    <h3 class="footer-section-title">Real Judaism</h3>
                    <div class="footer-contact-info">
                        <p class="contact-label">📧 Contact:</p>
                        <p><a href="mailto:rabbiariklapper@gmail.com" class="footer-email">rabbiariklapper@gmail.com</a></p>
                        <p class="contact-label">🛠️ Technical Support:</p>
                        <p><a href="mailto:eli@elipodcastproductions.com" class="footer-email">eli@elipodcastproductions.com</a></p>
                    </div>
                </div>
                <div class="footer-explore">
                    <h4 class="footer-section-title">Explore</h4>
                    <ul class="footer-links">
                        <li><a href="../index.html" class="footer-link">All Podcast Series</a></li>
                        <li><a href="../about.html" class="footer-link">About Rabbi Klapper</a></li>
                        <li><a href="#contact" class="footer-link">Contact</a></li>
                        <li><a href="../blog.html" class="footer-link">Blog</a></li>
                    </ul>
                </div>
                <div class="footer-legal">
                    <h4 class="footer-section-title">Information</h4>
                    <ul class="footer-links">
                        <li><a href="../privacy-policy.html" class="footer-link">Privacy Policy</a></li>
                        <li><a href="../terms-of-service.html" class="footer-link">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                 <p class="footer-credit-centered">Website & Podcast Design: <a href="https://elipodcastproductions.com" target="_blank" rel="noopener" class="footer-credit-link"><strong>Eli Podcast Productions</strong></a></p>
                <p>&copy; 2025 Real Judaism. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="../js/main.js"></script>
    <script src="../js/blog-post.js"></script>

</body>
</html>
    """

    for i, post in enumerate(posts):
        # Previous post link
        if i == 0:
            prev_post_link = '<a href="#" class="premium-post-nav-link prev disabled"><div class="nav-label">Previous Week</div><div class="nav-title">This is the first post</div></a>'
        else:
            prev_post = posts[i - 1]
            prev_post_link = f'<a href="{prev_post["slug"]}.html" class="premium-post-nav-link prev"><div class="nav-label">Previous Week</div><div class="nav-title">{prev_post["week_number"]}: {prev_post["title"]}</div></a>'

        # Next post link
        if i == len(posts) - 1:
            next_post_link = '<a href="#" class="premium-post-nav-link next disabled"><div class="nav-label">Next Week</div><div class="nav-title">This is the last post</div></a>'
        else:
            next_post = posts[i + 1]
            next_post_link = f'<a href="{next_post["slug"]}.html" class="premium-post-nav-link next"><div class="nav-label">Next Week</div><div class="nav-title">{next_post["week_number"]}: {next_post["title"]}</div></a>'

        # Format the template with post data
        formatted_html = html_template.format(
            title=post.get('title', ''),
            excerpt=post.get('excerpt', ''),
            week_number=post.get('week_number', ''),
            slug=post.get('slug', ''),
            date=post.get('date', ''),
            read_time=post.get('read_time', ''),
            full_content=post.get('full_content', ''),
            prev_post_link=prev_post_link,
            next_post_link=next_post_link
        )

        # Write the formatted HTML to a file
        file_path = os.path.join('blog', f"{post['slug']}.html")
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(formatted_html)
            print(f"Successfully created {file_path}")
        except IOError as e:
            print(f"Error writing to file {file_path}: {e}")

if __name__ == '__main__':
    create_blog_post_pages()
