# CortexReel Background Agent Configuration

This configuration sets up a comprehensive development environment for the CortexReel screenplay analysis platform using Cursor's Background Agents.

## Setup Requirements

1. **Privacy Mode**: Must be disabled to use background agents
2. **GitHub Connection**: Grant read-write privileges to your repo
3. **Max Mode**: Only Max Mode-compatible models are available

## Configuration Details

### Install Command
```bash
npm install --legacy-peer-deps
```
- Installs all dependencies with legacy peer dependency resolution
- Handles React 18 compatibility issues

### Development Terminals

#### 1. Dev Server
- **Command**: `npm run dev`
- **Purpose**: Starts Vite development server on port 5173
- **Access**: http://localhost:5173

#### 2. Type Check
- **Command**: `npm run type-check -- --watch`
- **Purpose**: Continuous TypeScript type checking
- **Monitors**: All .ts/.tsx files for type errors

#### 3. Linter
- **Command**: `npm run lint -- --watch`
- **Purpose**: ESLint monitoring for code quality
- **Scope**: All source files in src/ directory

#### 4. Build Monitor
- **Command**: `npm run build -- --watch`
- **Purpose**: Continuous production build monitoring
- **Output**: dist/ directory

## Usage Instructions

1. Open Cursor
2. Press `Cmd + E` (or `Ctrl + E`) to open background agent control panel
3. Create new agent with this environment
4. Agent will automatically:
   - Clone your repo to isolated machine
   - Run install command
   - Start all terminal processes
   - Provide full development environment

## Security Considerations

- Code runs in Cursor's AWS infrastructure
- GitHub read/write access required
- Environment variables stored encrypted (KMS)
- Auto-execution of commands (potential prompt injection risks)

## Environment Variables

Create `.env.local` file with:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

## Troubleshooting

- If dependencies fail: Check Node.js version compatibility
- If dev server doesn't start: Ensure port 5173 is available
- If TypeScript errors: Run `npm run type-check` locally first
- If build fails: Check for syntax errors in components

## Agent Capabilities

The background agent can:
- Edit React components and TypeScript files
- Run tests and debugging commands
- Install new packages
- Modify configuration files
- Access development tools and browser testing
- Push changes to GitHub branches 