# generate-hebrew-blog-posts.ps1

$dataFile = "hebrew-home/data/blog_posts.json"
$templateFile = "hebrew-home/post-template-hebrew.html"
$outputDir = "hebrew-home/blog"

# Ensure the output directory exists
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Read the template content
$templateContent = Get-Content $templateFile -Raw

# Read and parse the JSON data
$posts = Get-Content $dataFile -Raw | ConvertFrom-Json

# Loop through each post and create a file
foreach ($post in $posts) {
    $slug = $post.slug
    if ($slug) {
        $outputFile = Join-Path $outputDir "$slug.html"
        # Create the file with the template content
        Set-Content -Path $outputFile -Value $templateContent
        Write-Host "Created file: $outputFile"
    } else {
        Write-Host "Skipping post due to missing slug."
    }
}

Write-Host "All Hebrew blog post files have been generated."
