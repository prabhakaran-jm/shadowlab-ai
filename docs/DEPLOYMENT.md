# Deploying ShadowLab on DigitalOcean App Platform

This guide walks you through deploying ShadowLab (frontend + backend) on [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/).

## Prerequisites

- A [DigitalOcean account](https://cloud.digitalocean.com/)
- ShadowLab code in a **public** GitHub repository (e.g. `YOUR_GITHUB_OWNER/shadowlab-ai`)
- **GitHub connected to DigitalOcean** (required for deploy-from-repo): Go to [Connect GitHub to App Platform](https://cloud.digitalocean.com/apps/github/install), sign in with the GitHub account that owns or has access to the repo, and authorize DigitalOcean. If you see "GitHub user not authenticated" when using `doctl apps create`, complete this step first. If you see **"Git branch not found"**, set `branch` in `.do/app.yaml` to your repo’s default branch (e.g. `master` instead of `main`).
- (Optional) A [DigitalOcean Gradient™ AI](https://docs.digitalocean.com/products/gradient-ai-platform/) Model Access Key for Serverless Inference (for AI-generated attacks and vulnerability analysis)

## Option A: Deploy from the Control Panel (recommended)

### 1. Create the app from GitHub

1. Go to [Apps](https://cloud.digitalocean.com/apps) and click **Create App**.
2. Choose **GitHub** as the source and authorize DigitalOcean if needed.
3. Select your **repository** and **branch** (e.g. `main`). Enable **Autodeploy** if you want deploys on every push.
4. Click **Next**. You will add two components (backend and frontend) in the next steps.

### 2. Add the backend component

1. Click **Add Resource** → **Service** (or **Edit** next to the auto-detected component).
2. Set **Source Directory** to `backend`.
3. **Build Command:** `pip install -r requirements.txt`
4. **Run Command:** `sh run.sh`
5. **HTTP Port:** `8080`
6. **Health Check Path:** `/health`
7. Add **Environment Variables** (Settings → App-Level or Component-Level):
   - `CORS_ORIGINS` = (leave empty for now; set after you have the frontend URL)
   - `GRADIENT_MODEL_ACCESS_KEY` = (optional) Your [Gradient AI Model Access Key](https://cloud.digitalocean.com/gradient-ai-platform/serverless-inference) (mark as **Encrypt**)
   - `GRADIENT_API_URL` = `https://inference.do-ai.run` (optional; this is the default)
8. Save and go back to add the frontend.

### 3. Add the frontend component

1. Click **Add Resource** → **Service** again.
2. Set **Source Directory** to `frontend`.
3. **Build Command:** `npm ci && npm run build`
4. **Run Command:** `npm start`
5. **HTTP Port:** `8080`
6. Add **Environment Variable**:
   - `NEXT_PUBLIC_API_URL` = (leave empty for now; set after you have the backend URL)
7. Save.

### 4. Deploy and wire URLs

1. Choose **Region** and **Plan**, then click **Create Resources**.
2. Wait for both components to build and deploy. You get **one** Live URL for the app (e.g. `https://shadowlab-xxxx.ondigitalocean.app`). The frontend is at `/` and the backend at `/api` (see `.do/app.yaml` ingress).
3. **Set env vars** (then redeploy so the frontend rebuilds with the API URL):
   - **Backend** `CORS_ORIGINS` = your app Live URL (e.g. `https://shadowlab-xxxx.ondigitalocean.app`).
   - **Frontend** `NEXT_PUBLIC_API_URL` = your app Live URL + `/api` (e.g. `https://shadowlab-xxxx.ondigitalocean.app/api`). **Redeploy the frontend** after changing (build required).
4. Open the app Live URL in your browser. You should see the ShadowLab dashboard; scans call the backend at `/api`.

## Option B: Deploy from the App Spec (doctl or API)

If you use [doctl](https://docs.digitalocean.com/reference/doctl/) or the API:

1. **Authenticate doctl** (one-time): Create a [Personal Access Token](https://cloud.digitalocean.com/account/api/tokens) (read + write), then run:
   ```bash
   doctl auth init
   ```
   Paste the token when prompted.

2. **Edit `.do/app.yaml`:**
   - Replace `YOUR_GITHUB_OWNER` with your GitHub username or org in both `github.repo` fields.
   - (Optional) Adjust `region` or instance sizes.

3. **Connect GitHub to DigitalOcean** (if not done yet): Visit [apps/github/install](https://cloud.digitalocean.com/apps/github/install) and authorize with the GitHub account that owns the repo. Otherwise `doctl apps create` may fail with "GitHub user not authenticated".

4. **Create the app:**
   ```bash
   doctl apps create --spec .do/app.yaml
   ```

5. **Set env vars after first deploy:** Once the first deployment finishes (or from **Settings** → **App-Level** or per-component env vars):
   - **Backend** `CORS_ORIGINS` = your app’s Live URL (e.g. `https://shadowlab-xxxx.ondigitalocean.app`).
   - **Frontend** `NEXT_PUBLIC_API_URL` = your app’s Live URL + `/api` (e.g. `https://shadowlab-xxxx.ondigitalocean.app/api`). Then **Redeploy** the frontend so the build picks it up.

**Useful doctl commands after create:** `doctl apps list` (list apps), `doctl apps get <app-id>` (details + Live URL), `doctl apps list-deployments <app-id>` (deployment status).

## Environment variables reference

| Variable | Component | Required | Description |
|----------|-----------|----------|-------------|
| `CORS_ORIGINS` | Backend | Yes (for prod) | Comma-separated frontend origins (e.g. your frontend Live URL). |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes (for prod) | Backend API base URL (e.g. your backend Live URL). Must be set at **build** time. |
| `GRADIENT_MODEL_ACCESS_KEY` | Backend | Optional | Gradient AI Model Access Key for Serverless Inference. |
| `GRADIENT_API_URL` | Backend | Optional | Default: `https://inference.do-ai.run`. |
| `ALLOW_LOCALHOST_TARGET` | Backend | No | Set to `1` only if you need to scan localhost (e.g. local mock). Not needed on App Platform. |

## Custom domain (optional)

In the app’s **Settings** → **Domains**, add a custom domain and point your DNS to the given CNAME. Then set `CORS_ORIGINS` and `NEXT_PUBLIC_API_URL` to your custom URLs and redeploy as above.

## Troubleshooting

- **Backend "Non-Zero Exit Code" / container exits:** The backend uses `run.sh` which runs `python -m uvicorn` so the buildpack’s Python is used. If it still fails, check the deployment logs in the dashboard (Runtime Logs) for the real error (e.g. missing dependency, import error).
- **Git branch not found:** The branch in `.do/app.yaml` (e.g. `main`) must exist in your repo. If your default branch is `master`, change both `github.branch` entries in `.do/app.yaml` to `master` and run `doctl apps create` again (or create a `main` branch and push).
- **CORS errors in browser:** Ensure `CORS_ORIGINS` on the backend exactly matches the frontend origin (scheme + host, no trailing slash), and that you redeployed the backend after changing it.
- **Frontend calls wrong API:** Set `NEXT_PUBLIC_API_URL` to the backend Live URL and **redeploy** the frontend (new build required).
- **Gradient AI not used:** Add `GRADIENT_MODEL_ACCESS_KEY` (from Gradient AI → Serverless Inference → Model Access Keys) to the backend env and redeploy. See [docs/GRADIENT_SETUP.md](GRADIENT_SETUP.md).
