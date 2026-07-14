# Code Review Rules

## General
- Use 'use strict' in all JS files
- Prefer const/let, never var
- Use descriptive variable names
- Handle errors explicitly

## Node.js / Express
- Validate input at controller level
- Use middleware for cross-cutting concerns
- Never expose internal errors to client
- Use httpOnly cookies for auth tokens

## Frontend
- Use IIFE pattern for module isolation
- Escape user content before DOM insertion
- Use event delegation for dynamic elements
- Prefer CSS custom properties over hardcoded values

## Security
- Never commit .env or secrets
- Hash passwords with bcrypt
- Validate and sanitize all user input
- Use CORS whitelist in production
