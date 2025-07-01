import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const sourceDir = './node_modules/@mediapipe/face_mesh';
const publicTargetDir = './public/mediapipe';
const distTargetDir = './dist/mediapipe';

// Create target directories if they don't exist
try {
  mkdirSync(publicTargetDir, { recursive: true });
  mkdirSync(distTargetDir, { recursive: true });
} catch (error) {
  console.log('Target directories already exist or could not be created');
}

// Copy files recursively
function copyDirectory(src, dest) {
  const entries = readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

try {
  // Copy to public directory (for development)
  copyDirectory(sourceDir, publicTargetDir);
  console.log('MediaPipe files copied to public directory successfully');
  
  // Copy to dist directory (for production deployment)
  copyDirectory(sourceDir, distTargetDir);
  console.log('MediaPipe files copied to dist directory successfully');
} catch (error) {
  console.error('Error copying MediaPipe files:', error);
} 