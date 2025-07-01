// Configuration for file storage
// Change this to switch between local public folder and Cloudflare R2

// For local development (public folder)
// export const FILE_BASE_URL = '';

// For Cloudflare R2 - Public Development URL
export const FILE_BASE_URL = 'https://pub-156d322e433045019ece7bfd184c97ee.r2.dev';

// For Cloudflare R2 - try different URL formats
// Option 1: Direct R2 endpoint (might not work without proper configuration)
// export const FILE_BASE_URL = 'https://769bbb6c411205a2fb1bb0ec59c95ad8.r2.cloudflarestorage.com/present-progressive';

// Option 2: Custom domain (if you have one set up)
// export const FILE_BASE_URL = 'https://your-custom-domain.com';

// Option 3: R2 with account ID format
// export const FILE_BASE_URL = 'https://769bbb6c411205a2fb1bb0ec59c95ad8.r2.cloudflarestorage.com';

// Helper function to get full file URL
export const getFileUrl = (path: string): string => {
  // If no base URL is set, return the path as-is (for local files)
  if (!FILE_BASE_URL) {
    return path;
  }
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${FILE_BASE_URL}/${cleanPath}`;
}; 