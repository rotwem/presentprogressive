# Cloudflare R2 Integration

This app has been configured to load media files from Cloudflare R2 instead of the local `public` folder.

## Configuration

The file storage configuration is centralized in `src/config.ts`:

```typescript
// For local development (public folder)
// export const FILE_BASE_URL = '';

// For Cloudflare R2 - Public Development URL
export const FILE_BASE_URL = 'https://pub-156d322e433045019ece7bfd184c97ee.r2.dev';
```

## How to Switch Between Local and R2

### To use Cloudflare R2 (current setup):
- Keep the current configuration in `src/config.ts`
- All files will be loaded from: `https://pub-156d322e433045019ece7bfd184c97ee.r2.dev`

### To use local public folder:
- Comment out the R2 URL and uncomment the empty string in `src/config.ts`:
```typescript
// For local development (public folder)
export const FILE_BASE_URL = '';

// For Cloudflare R2 - Public Development URL
// export const FILE_BASE_URL = 'https://pub-156d322e433045019ece7bfd184c97ee.r2.dev';
```

## Files Updated

The following components have been updated to use the `getFileUrl()` helper function:

- `src/MorningStage.tsx` - Video and audio files
- `src/NightimeStage.tsx` - Images, video, and audio files  
- `src/TestStage.tsx` - Video and audio files
- `src/MazeStage.tsx` - Video and audio files
- `src/OutroStage.tsx` - Video files

## File Types Supported

The following file types are now loaded from R2:
- **Videos**: `.mp4` files (morning_full01.mp4, nigitime_comp01.mp4, credits.mp4, q_vids/*.mp4, chase_vid/*.mp4)
- **Audio**: `.mp3` files (circles.mp3, thunder-307513.mp3, maze_sound.mp3, noises/*.mp3, etc.)
- **Images**: `.png`, `.jpg`, `.jpeg`, `.gif` files (nightime_png/*, chase_img/*, etc.)

## Benefits

1. **Reduced bundle size**: Media files are no longer included in the app bundle
2. **Better performance**: Files are served from Cloudflare's global CDN
3. **Scalability**: No need to upload large media files with each deployment
4. **Cost effective**: R2 storage is typically cheaper than serving files through your app server

## Testing

To test that files are loading correctly from R2:
1. Open the browser's developer tools
2. Go to the Network tab
3. Navigate through the app stages
4. Verify that media files are being loaded from the R2 URLs

## Troubleshooting

If files fail to load:
1. Check that the R2 URL is correct in `src/config.ts`
2. Verify that all files have been uploaded to the R2 bucket
3. Check the browser's console for any CORS errors
4. Ensure the R2 bucket has Public Development URL enabled in Cloudflare dashboard 