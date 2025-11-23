# Authentication API Testing Guide

Quick reference for testing the authentication endpoints.

## Prerequisites

1. Make sure your dev server is running: `npm run dev`
2. Ensure you have the `JWT_SECRET` in `.env.local`:
   ```
   JWT_SECRET=Mfx18JbOkSXYUBp1H0LnGV2+QK4q5OAvlKZ5TWI5PNE=
   ```

## Test Commands

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ash_ketchum",
    "email": "ash@pokemon.com",
    "password": "pikachu123"
  }' \
  -c cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "some-uuid",
    "username": "ash_ketchum",
    "email": "ash@pokemon.com",
    "trainer_id": 234567
  }
}
```

### 2. Login with Username

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "ash_ketchum",
    "password": "pikachu123"
  }' \
  -c cookies.txt
```

### 3. Login with Email

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "ash@pokemon.com",
    "password": "pikachu123"
  }' \
  -c cookies.txt
```

### 4. Get Current User Profile

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "some-uuid",
    "username": "ash_ketchum",
    "email": "ash@pokemon.com",
    "trainer_id": 234567,
    "created_at": "2025-11-23T03:26:25.694Z"
  },
  "stats": []
}
```

### 5. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt -c cookies.txt
```

## Test Error Cases

### Duplicate Username

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ash_ketchum",
    "email": "different@email.com",
    "password": "password123"
  }'
```

**Expected:** `409 Conflict` - "Username already exists"

### Invalid Password (Too Short)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "misty",
    "email": "misty@pokemon.com",
    "password": "123"
  }'
```

**Expected:** `400 Bad Request` - "Password must be at least 8 characters"

### Wrong Password

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "ash@pokemon.com",
    "password": "wrongpassword"
  }'
```

**Expected:** `401 Unauthorized` - "Invalid credentials"

### Access Protected Route Without Authentication

```bash
curl -X GET http://localhost:3000/api/auth/me
```

**Expected:** `401 Unauthorized` - "Unauthorized"

## Browser Testing

You can also test in the browser console:

### Register
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'ash_ketchum',
    email: 'ash@pokemon.com',
    password: 'pikachu123'
  })
});
const data = await response.json();
console.log(data);
```

### Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'ash@pokemon.com',
    password: 'pikachu123'
  })
});
const data = await response.json();
console.log(data);
```

### Get Profile
```javascript
const response = await fetch('/api/auth/me');
const data = await response.json();
console.log(data);
```

### Logout
```javascript
const response = await fetch('/api/auth/logout', {
  method: 'POST'
});
const data = await response.json();
console.log(data);
```

## Notes

- Cookies are automatically handled by the browser
- Use `-c cookies.txt` to save cookies and `-b cookies.txt` to send them in curl
- The authentication cookie is HTTP-only and will last for 7 days
- All passwords are hashed with bcrypt before storage
