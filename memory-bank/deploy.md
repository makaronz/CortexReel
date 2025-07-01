# Environments, Pipelines, & Secrets Strategy

This document outlines the deployment strategy for CortexReel, including environment definitions, CI/CD pipelines, and the critical path for secrets management.

## 1. Environments

### a. Local Development
- **Current State (Frontend Only):**
  - **Command:** `npm run dev`
  - **Description:** Runs the Vite development server for the React SPA. Provides hot-reloading and direct access to browser developer tools. Requires a local `.env` file with `VITE_GEMINI_API_KEY`.
- **Future State (Full Stack via Docker):**
  - **Command:** `docker-compose up`
  - **Description:** Will launch the entire ecosystem of services as defined in `memory-bank/techContext.md`. This provides a consistent, production-like environment for local development and testing, including the API, worker, and databases.

### b. Staging (Planned)
- **Purpose:** A production-replica environment for E2E testing, stakeholder reviews, and validation before production deployment.
- **Deployment Target:**
  - **Frontend:** Vercel or Netlify for seamless SPA deployment.
  - **Backend:** A container orchestration service like AWS Fargate or Google Cloud Run for the Dockerized backend services.
- **Trigger:** Automatic deployment on every merge to the `develop` or `staging` branch.

### c. Production (Planned)
- **Purpose:** The live, public-facing application for end-users.
- **Deployment Target:** Same as Staging, but with scaled-up resources, enhanced monitoring, logging, and alerting.
- **Trigger:** Manual promotion from Staging or automatic deployment on every merge to the `main` branch, contingent on all Staging tests passing.

## 2. CI/CD Pipelines (GitHub Actions)

- **Current State:** No formal CI/CD pipeline exists.
- **Future `ci.yml` Workflow:** A comprehensive pipeline will be established using GitHub Actions to automate testing and deployment.

  ```yaml
  name: CortexReel CI/CD

  on:
    push:
      branches: [ main, develop ]
    pull_request:
      branches: [ main, develop ]

  jobs:
    test_and_lint:
      name: Test & Lint
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'npm'
        - run: npm install
        - run: npm run type-check # TypeScript validation
        - run: npm run lint # ESLint
        - run: npm test -- --coverage # Unit & Integration tests

    build:
      name: Build Docker Images
      needs: test_and_lint
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        # ... steps to build and push Docker images to a registry (e.g., GHCR)

    deploy_staging:
      name: Deploy to Staging
      needs: build
      if: github.ref == 'refs/heads/develop'
      runs-on: ubuntu-latest
      steps:
        # ... steps to deploy the new images to the Staging environment

    deploy_production:
      name: Deploy to Production
      needs: build # and potentially successful staging E2E tests
      if: github.ref == 'refs/heads/main'
      environment: production # Requires manual approval if configured
      runs-on: ubuntu-latest
      steps:
        # ... steps to deploy the new images to the Production environment
  ```

## 3. Secrets Management Strategy

### 🚨 CRITICAL: Current Security Vulnerability
- **Current Method (Highly Insecure):** The `VITE_GEMINI_API_KEY` is stored in a local `.env` file and is directly exposed to the client-side. The key is included in the bundled JavaScript, making it easily discoverable by anyone using the application. **This architecture must not be deployed to a public environment.**

### Future Secure Strategy
The entire secrets management strategy will be overhauled during the backend implementation phase.

1.  **Backend as Secure Proxy:**
    - The **frontend will have no knowledge of any API keys**. All calls to the Gemini API will be routed through our own backend.
    - The backend API will be the single point of contact with external services.

2.  **Server-Side Environment Variables:**
    - The `GEMINI_API_KEY` will be stored **exclusively** as a secure environment variable on the server hosting the backend (e.g., in the Docker container running on AWS Fargate). It will never be exposed to the client.

3.  **Cloud-Native Secrets Management:**
    - For Staging and Production environments, secrets will be managed using the cloud provider's native solution (e.g., AWS Secrets Manager, Google Secret Manager, or GitHub Actions Encrypted Secrets).
    - These tools provide secure storage, access control (IAM), and key rotation capabilities.

4.  **Local Development:**
    - The `.env` file will continue to be used for the `docker-compose` setup to inject secrets into the backend `api` and `worker` services.
    - The `.env` file **must** be included in `.gitignore` and will never be committed to the repository. 