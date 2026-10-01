{
  "name": "cloud-ai-quiz",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch server.js",
    "build": "vite build",
    "start": "NODE_ENV=production node server.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "latest",
    "express": "^4.21.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.10"
  }
}