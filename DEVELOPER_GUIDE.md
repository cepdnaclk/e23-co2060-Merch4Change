# Developer Guide

## Coding Standards

- Use camelCase for variables
- Use PascalCase for React components
- Keep components small and reusable

Example:
UserProfile.jsx
ProductCard.jsx

## Git Workflow

1. Create a branch
git checkout -b feature/profile-page

2. Commit changes
git commit -m "Add profile page layout"

3. Push branch
git push origin feature/profile-page

4. Create Pull Request

## File Naming Rules

Components:
PascalCase

Example:
Sidebar.jsx
UserCard.jsx

CSS Files:
Same name as component

Example:
Sidebar.css

## Environment Variables

Create a `.env` file in the root folder.

Example:

REACT_APP_API_URL=http://localhost:5000

## Adding a New Page

Steps:

1. Create file inside `/pages`
2. Create CSS file
3. Add route in `App.jsx`

Example:

pages/
   Profile.jsx
   Profile.css