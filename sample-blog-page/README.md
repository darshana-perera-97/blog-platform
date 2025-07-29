# Sample Blog Page

A clean, minimalistic React.js application for viewing blog posts from a specific user. This is a read-only blog viewer that connects to the main blog platform backend.

## Features

- 📝 **User-specific blog viewing** - View posts from a configured user
- 🎨 **Clean, minimalistic design** - Modern UI with excellent readability
- 📱 **Responsive layout** - Works on desktop, tablet, and mobile
- ⚙️ **Easy configuration** - Change user and backend settings in config file
- 🔍 **Post detail view** - Full post reading experience
- 🏷️ **Post metadata** - Shows author, dates, and AI generation info

## Quick Start

### Prerequisites

1. **Backend Server**: Make sure the main blog platform backend is running on `http://localhost:3033`
2. **Node.js**: Version 14 or higher
3. **npm**: For package management

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure the application:**
   Edit `src/config.js` to set your desired user and backend URL.

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Configuration

Edit `src/config.js` to customize the application:

```javascript
const config = {
  // Backend API URL
  backendUrl: 'http://localhost:3033/api',
  
  // User configuration - change this to view different user's blogs
  user: {
    id: 1, // User ID to display blogs for
    username: 'admin', // Username for display purposes
    email: 'admin@example.com' // Email for display purposes
  },
  
  // Display settings
  display: {
    title: 'Sample Blog Page',
    subtitle: 'A showcase of blog posts',
    showAuthor: true,
    showDate: true,
    showMetaDescription: true,
    postsPerPage: 6
  },
  
  // Styling
  theme: {
    primaryColor: '#2563eb',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    cardBackground: '#ffffff'
  }
};
```

### Configuration Options

#### Backend URL
- **backendUrl**: The URL of your blog platform backend API
- Default: `http://localhost:3033/api`

#### User Selection
- **user.id**: The user ID whose posts you want to display
- **user.username**: Display name for the user
- **user.email**: Email address for display purposes

#### Display Settings
- **display.title**: Main page title
- **display.subtitle**: Subtitle shown below the title
- **showAuthor**: Show author information
- **showDate**: Show publication dates
- **showMetaDescription**: Show post summaries
- **postsPerPage**: Number of posts to display per page

## Available Users

Based on the main blog platform, you can configure these users:

### Admin User
```javascript
user: {
  id: 1,
  username: 'admin',
  email: 'admin@example.com'
}
```

### DS User
```javascript
user: {
  id: 2,
  username: 'ds',
  email: 'darshana.saluka.pc@gmail.com'
}
```

### DS2 User
```javascript
user: {
  id: 3,
  username: 'ds2',
  email: 'ds2@example.com'
}
```

## Project Structure

```
sample-blog-page/
├── public/
├── src/
│   ├── components/
│   │   ├── BlogList.js      # Main blog listing page
│   │   └── PostDetail.js    # Individual post view
│   ├── services/
│   │   └── api.js          # API service functions
│   ├── config.js           # Configuration file
│   ├── App.js              # Main application component
│   ├── App.css             # Styles
│   └── index.js            # Entry point
├── package.json
└── README.md
```

## API Endpoints

The application uses these backend endpoints:

- `GET /api/posts` - Get all posts (filtered by user in frontend)
- `GET /api/posts/:id` - Get specific post by ID

## Styling

The application uses a clean, minimalistic design with:

- **Color Scheme**: Blue primary with light gray backgrounds
- **Typography**: System fonts for optimal readability
- **Layout**: Card-based design with subtle shadows
- **Responsive**: Mobile-first approach

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Customization

#### Changing Colors
Edit the CSS variables in `src/App.css`:

```css
:root {
  --primary-color: #2563eb;
  --light-bg: #f8fafc;
  --text-primary: #1e293b;
  /* ... other variables */
}
```

#### Adding Features
- Add new components in `src/components/`
- Extend API services in `src/services/api.js`
- Update routing in `src/App.js`

## Troubleshooting

### Common Issues

1. **"Failed to load blog posts"**
   - Check if the backend server is running
   - Verify the backend URL in `config.js`
   - Ensure the user ID exists in the backend

2. **"Post not found or access denied"**
   - Verify the user ID in `config.js`
   - Check if the post belongs to the configured user
   - Ensure the post exists in the backend

3. **CORS Issues**
   - Make sure the backend has CORS enabled
   - Check if the backend URL is correct

### Debug Mode

Enable console logging by checking the browser's developer tools for detailed error messages.

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized static files.

### Deploy Options

- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **GitHub Pages**: Use `gh-pages` package
- **AWS S3**: Upload `build` folder to S3 bucket

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the blog platform ecosystem and follows the same licensing terms.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the configuration options
3. Ensure the backend is properly set up
4. Check browser console for error messages
