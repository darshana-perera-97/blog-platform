# Sample Blog Page

This is a sample blog page that displays **published (public) blog posts** from a specific user. It's designed to showcase how the blog platform can be used to create public-facing blog pages.

## Features

- **Published Posts Only**: Only shows posts that are marked as public (`isPublic: true`)
- **User-Specific**: Displays posts from a single configured user
- **SEO Optimized**: Includes meta tags and structured data for search engines
- **Responsive Design**: Works on desktop and mobile devices
- **Clean UI**: Modern, clean interface using Bootstrap

## Configuration

### User Configuration

Edit `src/config.js` to change which user's published posts to display:

```javascript
user: {
  id: 1, // User ID to display published blogs for
  username: 'admin', // Username for display purposes
  email: 'admin@example.com' // Email for display purposes
}
```

### Display Settings

You can customize the appearance and behavior:

```javascript
display: {
  title: 'Sample Blog Page',
  subtitle: 'A showcase of published blog posts',
  showAuthor: true,
  showDate: true,
  showMetaDescription: true,
  postsPerPage: 6
}
```

### Backend URL

Make sure the backend URL points to your running blog platform:

```javascript
backendUrl: 'http://localhost:3033/api'
```

## How It Works

1. **API Calls**: The page calls the backend API to fetch all public posts
2. **Filtering**: Frontend filters posts to show only:
   - Posts from the configured user (`authorId` matches)
   - Posts that are published (`isPublic: true`)
3. **Access Control**: Individual post pages also verify the post belongs to the configured user and is published
4. **SEO**: Each page includes proper meta tags and structured data

## Security

- Only published posts are displayed
- Private posts are completely hidden
- Direct access to unpublished posts is blocked
- No authentication required (public-facing page)

## Usage

1. **Configure the user** in `src/config.js`
2. **Ensure the backend is running** at the configured URL
3. **Make sure the user has published posts** (posts with `isPublic: true`)
4. **Start the sample blog page**:
   ```bash
   npm install
   npm start
   ```

## Example Use Cases

- **Personal Blog**: Show your own published posts
- **Company Blog**: Show posts from a company account
- **Portfolio**: Display published articles as part of a portfolio
- **Content Showcase**: Highlight specific published content

## Dependencies

- React
- React Router
- Bootstrap
- Axios
- React Helmet Async (for SEO)

## Backend Requirements

The backend must support:
- `GET /api/posts` - Returns public posts
- `GET /api/posts/:id` - Returns a specific post (if public)
- Posts with `isPublic: true` field
- Posts with `authorId` field to identify the author
