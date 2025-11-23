# Secure Game API Testing Guide

Quick reference for testing the secure game endpoints.

## Prerequisites

1. Dev server running: `npm run dev`
2. JWT_SECRET configured in `.env.local`
3. (Optional) Be logged in to test authenticated gameplay

## Test Flow

### 1. Start a New Game

```bash
curl -X POST http://localhost:3000/api/game/start \
  -H "Content-Type: application/json" \
  -d '{"mode":"classic"}' \
  | python3 -m json.tool
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://raw.githubusercontent.com/.../pokemon/519.png",
  "gameToken": "eyJhbGciOiJIUzI1NiJ9...",
  "pokemonId": 519
}
```

**Note:** The Pokemon name is NOT included! It's encrypted in the JWT token.

### 2. Submit a Guess (Guest User)

```bash
curl -X POST http://localhost:3000/api/game/guess \
  -H "Content-Type: application/json" \
  -d '{
    "guess": "pidove",
    "gameToken": "eyJhbGciOiJIUzI1NiJ9...",
    "currentStreak": 0
  }' \
  | python3 -m json.tool
```

**Response (Guest):**
```json
{
  "success": true,
  "correct": true,
  "correctAnswer": "pidove",
  "newStreak": 1,
  "authenticated": false
}
```

### 3. Submit a Guess (Authenticated User)

```bash
curl -X POST http://localhost:3000/api/game/guess \
  -H "Content-Type: application/json" \
  -d '{
    "guess": "pidove",
    "gameToken": "eyJhbGciOiJIUzI1NiJ9..."
  }' \
  -b cookies.txt \
  | python3 -m json.tool
```

**Response (Authenticated):**
```json
{
  "success": true,
  "correct": true,
  "correctAnswer": "pidove",
  "newStreak": 1,
  "bestStreak": 1,
  "authenticated": true
}
```

**Note:** Stats are automatically saved to the database!

## Security Features

### ✅ What's Protected

1. **Pokemon Name Hidden**: Not sent to client, only in signed JWT
2. **JWT Signature**: Token can't be tampered with
3. **Token Expiration**: Game tokens expire in 10 minutes
4. **Server-Side Validation**: Answer checking happens on server
5. **Database Persistence**: Authenticated users' stats saved securely

### ❌ What Attackers Can't Do

- Inspect network tab to find the answer
- Modify the game token to cheat
- Use expired tokens
- Fake their streak (for authenticated users)

## Complete Game Flow Example

```bash
# 1. Login first (to save stats)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"ash@pokemon.com","password":"pikachu123"}' \
  -c cookies.txt

# 2. Start game
GAME=$(curl -s -X POST http://localhost:3000/api/game/start \
  -H "Content-Type: application/json" \
  -d '{"mode":"classic"}')

TOKEN=$(echo $GAME | python3 -c "import sys, json; print(json.load(sys.stdin)['gameToken'])")
IMAGE=$(echo $GAME | python3 -c "import sys, json; print(json.load(sys.stdin)['imageUrl'])")

echo "Image: $IMAGE"
echo "Token: $TOKEN"

# 3. Make a guess
curl -X POST http://localhost:3000/api/game/guess \
  -H "Content-Type: application/json" \
  -d "{\"guess\":\"pikachu\",\"gameToken\":\"$TOKEN\"}" \
  -b cookies.txt \
  | python3 -m json.tool

# 4. Check your stats
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt \
  | python3 -m json.tool
```

## Error Cases

### Invalid Token
```bash
curl -X POST http://localhost:3000/api/game/guess \
  -H "Content-Type: application/json" \
  -d '{"guess":"pikachu","gameToken":"invalid-token"}'
```

**Response:** `401 Unauthorized` - "Invalid or expired game token"

### Expired Token (after 10 minutes)
```bash
# Use old token after 10+ minutes
curl -X POST http://localhost:3000/api/game/guess \
  -H "Content-Type: application/json" \
  -d '{"guess":"pikachu","gameToken":"<old-token>"}'
```

**Response:** `401 Unauthorized` - "Invalid or expired game token"

### Wrong Answer
```bash
curl -X POST http://localhost:3000/api/game/guess \
  -H "Content-Type: application/json" \
  -d '{"guess":"wrongname","gameToken":"<valid-token>"}'
```

**Response:**
```json
{
  "success": true,
  "correct": false,
  "correctAnswer": "pidove",
  "newStreak": 0,
  "authenticated": false
}
```

## Integration with Frontend

### React/Next.js Example

```typescript
// Start a new game
const startGame = async () => {
  const response = await fetch('/api/game/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'classic' })
  });
  const data = await response.json();
  
  setImageUrl(data.imageUrl);
  setGameToken(data.gameToken);
};

// Submit a guess
const submitGuess = async (guess: string) => {
  const response = await fetch('/api/game/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guess,
      gameToken,
      currentStreak // Only needed for guest users
    })
  });
  const data = await response.json();
  
  if (data.correct) {
    setStreak(data.newStreak);
  } else {
    setStreak(0);
  }
};
```

## Browser Testing

```javascript
// Start game
const game = await fetch('/api/game/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mode: 'classic' })
}).then(r => r.json());

console.log('Image:', game.imageUrl);
console.log('Token:', game.gameToken);

// Submit guess
const result = await fetch('/api/game/guess', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guess: 'pikachu',
    gameToken: game.gameToken
  })
}).then(r => r.json());

console.log('Correct:', result.correct);
console.log('Answer:', result.correctAnswer);
console.log('Streak:', result.newStreak);
```
