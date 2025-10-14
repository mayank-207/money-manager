# GraphQL Authorization Testing Guide

## The Issue

The authorization header was returning `undefined` because the Apollo Server context was not properly configured to pass the request object to the resolvers.

## ✅ **Fixed**

1. **Server Context Configuration**: Updated `index.ts` to pass the entire `req` object:
   ```typescript
   const server = new ApolloServer({ 
     typeDefs, 
     resolvers, 
     context: ({ req }) => ({ req })  // Now passes full request object
   });
   ```

2. **Resolver Access**: Now resolvers can access headers via `context.req.headers.authorization`

## How to Test Authorization

### 1. **Register a User First**
```graphql
mutation Register {
  register(name: "Test User", email: "test@example.com", password: "password123") {
    user {
      id
      name
      email
    }
    token
    message
  }
}
```

### 2. **Use the Token for Protected Queries**

Copy the `token` from the register response, then set it in the HTTP Headers section of GraphQL Playground:

**HTTP Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

### 3. **Test Protected Query**
```graphql
query Me {
  me {
    id
    name
    email
    createdAt
  }
}
```

### 4. **Test Protected Mutations**
```graphql
query GetParticipants {
  participants {
    id
    name
    email
  }
}
```

## Testing with curl

```bash
# First register
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(name: \"Test\", email: \"test@example.com\", password: \"password123\") { token user { id name } } }"
  }'

# Then use the token for protected queries
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { me { id name email } }"
  }'
```

## Common Issues

1. **Missing Bearer prefix**: Make sure the header is `Bearer <token>`, not just `<token>`
2. **Expired token**: Tokens expire after 7 days by default
3. **Wrong header name**: Use `Authorization`, not `authorization` (case matters in some clients)
4. **Malformed token**: Make sure the token is copied completely without extra spaces

## GraphQL Playground Setup

1. Start server: `npm run dev`
2. Go to: `http://localhost:4000/graphql`
3. In the bottom left, click "HTTP HEADERS"
4. Add:
   ```json
   {
     "Authorization": "Bearer <your-token-here>"
   }
   ```
5. Run your protected queries

The authorization should now work correctly!