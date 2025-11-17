<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Womba UI

Modern React-based web interface for the Womba AI Test Generation Platform.

## Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **Womba API Server** running (see [Womba repository](https://github.com/plainid/womba))

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Womba API URL** (see [API Configuration](#api-configuration) below)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## API Configuration

**⚠️ IMPORTANT:** You must configure the Womba API server URL before using the UI.

### Why `VITE_API_BASE_URL`?

**This is a Vite framework requirement, not our choice!**

Vite requires all client-side environment variables to be prefixed with `VITE_` for security reasons. This prevents accidentally exposing server secrets to the browser. It's a Vite convention - we can't change it.

### Method 1: Environment Variable (Recommended)

Create a `.env.local` file in the root directory:

```bash
# .env.local
# ⚠️ MUST be prefixed with VITE_ (Vite framework requirement)
VITE_API_BASE_URL=http://localhost:8000
```

**Configuration Options:**

**1. Local Docker (Development):**
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000
```
The Docker container exposes port 8000 to your host machine.

**2. Cloud/Remote Womba API (Production):**
```bash
# .env.local
VITE_API_BASE_URL=https://womba.yourcompany.com
# OR
VITE_API_BASE_URL=https://womba.onrender.com
# OR
VITE_API_BASE_URL=https://womba-api.example.com
```
**YES! You can connect to ANY remote Womba API server!** Just set the full URL.

**3. Docker network (from another container):**
```bash
VITE_API_BASE_URL=http://womba-server:8000
```

### Method 2: Default Fallback

If no `.env.local` file exists, the UI defaults to `http://localhost:8000`.

**Where it's used:** The API URL is configured in `services/testCaseService.ts`:
```typescript
// Vite automatically exposes VITE_* env vars to client code
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

### Verify API Connection

1. **Check API is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check API URL in browser console:**
   - Open DevTools (F12)
   - Look for: `API Base URL: http://localhost:8000`

3. **Test connection in UI:**
   - The UI shows connection status in the header
   - If offline, verify the API URL configuration

## Development

### Available Scripts

- **`npm run dev`** - Start development server (port 3000)
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build

### Development Server

The dev server runs on `http://localhost:3000` by default.

**Hot Module Replacement (HMR)** is enabled - changes reload automatically.

### Project Structure

```
womba-ui/
├── components/          # React components
│   ├── Header.tsx
│   ├── TestPlanPage.tsx
│   ├── RagManagementPage.tsx
│   └── ...
├── services/           # API service layer
│   ├── testCaseService.ts  # Main API client
│   └── promptService.ts
├── contexts/           # React contexts
├── index.tsx          # Entry point
├── vite.config.ts     # Vite configuration
└── .env.local         # API configuration (create this)
```

## Connecting to Womba API

### Step 1: Start Womba API Server in Docker

```bash
cd /path/to/womba
docker-compose up -d
```

**Verify it's running:**
```bash
docker ps | grep womba
curl http://localhost:8000/health
```

The Docker container exposes the API on **port 8000** which maps to `http://localhost:8000` on your host machine.

### Step 2: Configure UI to Connect to Womba API

Create `.env.local` in the womba-ui directory:

**For Local Docker:**
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000
```

**For Remote/Cloud API:**
```bash
# .env.local
VITE_API_BASE_URL=https://womba-api.yourcompany.com
# OR
VITE_API_BASE_URL=https://womba.onrender.com
```

**Why `localhost:8000` for Docker?**
- Docker maps container port 8000 → host port 8000
- Your browser runs on the host, so use `localhost:8000`
- The UI (running on host) connects to Docker API via `localhost:8000`

**For Cloud:**
- Use the full HTTPS URL of your deployed Womba API
- Make sure CORS is enabled on the Womba API for your UI domain

### Step 3: Start UI

```bash
npm run dev
```

### Step 4: Verify Connection

1. Open `http://localhost:3000`
2. Check header for "API Connected" status
3. Try generating a test plan

## Troubleshooting

### UI Shows "API Offline"

**Problem:** UI cannot connect to Womba API running in Docker

**Solutions:**
1. **Verify Docker container is running:**
   ```bash
   docker ps | grep womba
   # Should show womba-server container
   ```

2. **Verify API is accessible from host:**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy","environment":"production"}
   ```

3. **Check API URL in `.env.local`:**
   ```bash
   # For local Docker:
   VITE_API_BASE_URL=http://localhost:8000
   
   # For remote/cloud API:
   VITE_API_BASE_URL=https://womba-api.yourcompany.com
   ```

4. **Check browser console:**
   - Open DevTools (F12) → Console
   - Look for: `API Base URL: http://localhost:8000`
   - Check for CORS errors or network errors

5. **Verify Docker port mapping:**
   ```bash
   docker ps
   # Should show: 0.0.0.0:8000->8000/tcp
   ```

6. **If still not working, restart Docker:**
   ```bash
   docker-compose restart womba
   ```

### API Calls Return 404

**Problem:** API endpoints not found

**Solutions:**
1. **Verify API routes:**
   - Check Womba API is running latest version
   - Verify routes in `src/api/main.py`

2. **Check API prefix:**
   - Should be `/api/v1/`
   - Verify in `services/testCaseService.ts`

### Port Already in Use

**Problem:** Port 3000 is already in use

**Solution:**
```bash
# Change port in vite.config.ts
server: {
  port: 3001,  // Use different port
}
```

## Production Build & Cloud Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Deploy to Cloud

The `dist/` folder contains static files that can be deployed to:
- **Netlify**
- **Vercel**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- **Any static hosting**

### Configure Remote Womba API

**When deploying UI to cloud, connect to your remote Womba API:**

**Option 1: Build-time configuration**
```bash
# Set environment variable before building
export VITE_API_BASE_URL=https://womba-api.yourcompany.com
npm run build
```

**Option 2: Hosting platform environment variables**

**Netlify:**
1. Go to Site Settings → Environment Variables
2. Add: `VITE_API_BASE_URL` = `https://womba-api.yourcompany.com`
3. Redeploy

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add: `VITE_API_BASE_URL` = `https://womba-api.yourcompany.com`
3. Redeploy

**GitHub Pages / Static Hosting:**
```bash
# Build with API URL
VITE_API_BASE_URL=https://womba-api.yourcompany.com npm run build
# Then deploy dist/ folder
```

### Example: UI on Vercel, API on Render

```bash
# .env.local (for local dev)
VITE_API_BASE_URL=http://localhost:8000

# Vercel Environment Variable (for production)
VITE_API_BASE_URL=https://womba.onrender.com
```

**The UI will automatically use the correct API URL based on where it's deployed!**

## API Endpoints Used

The UI connects to these Womba API endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/stats` | GET | Dashboard statistics |
| `/api/v1/history` | GET | Generation history |
| `/api/v1/test-plans/generate` | POST | Generate test plan |
| `/api/v1/rag/stats` | GET | RAG statistics |
| `/api/v1/rag/index` | POST | Index story |
| `/api/v1/rag/search` | POST | Search RAG |
| `/api/v1/config` | GET/POST | Configuration |

See [API Integration Guide](API_INTEGRATION_GUIDE.md) for complete details.

## Environment Variables

| Variable | Description | Default | Why `VITE_` prefix? |
|----------|-------------|---------|---------------------|
| `VITE_API_BASE_URL` | Womba API server URL | `http://localhost:8000` | **Vite framework requirement** - all client-side env vars must start with `VITE_` for security |

**Important:** The `VITE_` prefix is **required by Vite**, not optional. This prevents accidentally exposing server secrets to browser code.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Womba API
5. Submit a pull request

## Related Repositories

- **[Womba API](https://github.com/plainid/womba)** - Backend API server
- See [API Integration Guide](API_INTEGRATION_GUIDE.md) for integration details

## License

MIT
