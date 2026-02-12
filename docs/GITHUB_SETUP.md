# GitHub Repository Setup Guide

Follow these steps to connect your local repository to GitHub:

## 1. Create GitHub Repository

### Option A: Via GitHub Website (Recommended)
1. Go to https://github.com/new
2. Repository name: `campus-grab` (or your preferred name)
3. Description: "Campus food ordering PWA with concurrent order handling"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Option B: Via GitHub CLI
```bash
gh repo create campus-grab --public --description "Campus food ordering PWA"
```

## 2. Connect Local Repository to GitHub

Copy the commands from GitHub's "...or push an existing repository" section, or use these:

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/campus-grab.git

# Or if using SSH:
git remote add origin git@github.com:YOUR_USERNAME/campus-grab.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## 3. Verify Connection

```bash
# Check remote URL
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/campus-grab.git (fetch)
# origin  https://github.com/YOUR_USERNAME/campus-grab.git (push)
```

## 4. View Your Repository

Visit: `https://github.com/YOUR_USERNAME/campus-grab`

---

## Optional: Set Up GitHub Actions

Create `.github/workflows/test.yml` for automated testing on push:

```yaml
name: Load Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
```

---

## Git Workflow Tips

### Making Changes
```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "feat: Add new feature"

# Push to GitHub
git push
```

### Commit Message Conventions
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## Collaboration

### Invite Collaborators
1. Go to repository Settings → Collaborators
2. Click "Add people"
3. Enter GitHub usernames or emails

### Branching Strategy
```bash
# Create feature branch
git checkout -b feature/payment-integration

# Make changes and commit
git add .
git commit -m "feat: Add payment gateway"

# Push branch
git push -u origin feature/payment-integration

# Create Pull Request on GitHub
# After review, merge to main
```

---

## Troubleshooting

### Authentication Issues
If using HTTPS and prompted for username/password:
```bash
# Use Personal Access Token (PAT) instead of password
# Create PAT: https://github.com/settings/tokens
```

### Permission Denied (SSH)
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: https://github.com/settings/keys
```

---

**Next Steps**: After pushing to GitHub, consider:
- Adding a repository description
- Setting up branch protection rules
- Enabling GitHub Issues for bug tracking
- Adding a LICENSE file
- Creating a CONTRIBUTING.md guide
