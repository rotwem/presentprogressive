import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const sourceDir = './node_modules/@mediapipe/face_mesh';
const targetDir = './public/mediapipe';

// Create target directory if it doesn't exist
try {
  mkdirSync(targetDir, { recursive: true });
} catch (error) {
  console.log('Target directory already exists or could not be created');
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
  copyDirectory(sourceDir, targetDir);
  console.log('MediaPipe files copied successfully');
} catch (error) {
  console.error('Error copying MediaPipe files:', error);
} 