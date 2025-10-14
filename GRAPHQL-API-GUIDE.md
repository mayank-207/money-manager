# GraphQL API Guide

## Overview

This project has been converted from REST APIs to **GraphQL only**. All functionality is now available through a single GraphQL endpoint at `/graphql`.

## Server Setup

The server uses:
- **Apollo Server Express** for GraphQL
- **PostgreSQL** for database
- **JWT** for authentication
- **bcrypt** for password hashing

## GraphQL Endpoint

- **URL**: `http://localhost:4000/graphql`
- **Playground**: Available in development mode for testing queries

## Authentication

### Types

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  createdAt: Date!
}

type AuthPayload {
  user: User!
  token: String!
  message: String!
}
```

### Mutations

```graphql
# Register a new user
mutation Register {
  register(name: "John Doe", email: "john@example.com", password: "password123") {
    user {
      id
      name
      email
      createdAt
    }
    token
    message
  }
}

# Login
mutation Login {
  login(email: "john@example.com", password: "password123") {
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

### Queries

```graphql
# Get current user (requires Authorization header)
query Me {
  me {
    id
    name
    email
    createdAt
  }
}
```

## Participants Management

### Queries

```graphql
# Get all participants
query GetParticipants {
  participants {
    id
    name
    email
    mobile
  }
}

# Get single participant
query GetParticipant {
  participant(id: "1") {
    id
    name
    email
    mobile
  }
}
```

### Mutations

```graphql
# Create participant
mutation CreateParticipant {
  createParticipant(name: "Alice", email: "alice@example.com", mobile: "1234567890") {
    id
    name
    email
    mobile
  }
}

# Update participant
mutation UpdateParticipant {
  updateParticipant(id: "1", name: "Alice Updated") {
    id
    name
    email
    mobile
  }
}

# Delete participant
mutation DeleteParticipant {
  deleteParticipant(id: "1")
}
```

## Groups Management

### Queries

```graphql
# Get all groups
query GetGroups {
  groups {
    id
    name
    description
    members {
      id
      name
      email
    }
  }
}

# Get single group
query GetGroup {
  group(id: "1") {
    id
    name
    description
    members {
      id
      name
      email
    }
  }
}
```

### Mutations

```graphql
# Create group
mutation CreateGroup {
  createGroup(name: "Trip to Bali", description: "Vacation expenses") {
    id
    name
    description
    members {
      id
      name
    }
  }
}

# Update group
mutation UpdateGroup {
  updateGroup(id: "1", name: "Updated Trip Name") {
    id
    name
    description
    members {
      id
      name
    }
  }
}

# Add participant to group
mutation AddParticipantToGroup {
  addParticipantToGroup(groupId: "1", participantId: "2") {
    id
    name
    members {
      id
      name
    }
  }
}

# Remove participant from group
mutation RemoveParticipantFromGroup {
  removeParticipantFromGroup(groupId: "1", participantId: "2") {
    id
    name
    members {
      id
      name
    }
  }
}

# Delete group
mutation DeleteGroup {
  deleteGroup(id: "1")
}
```

## Expenses Management

### Queries

```graphql
# Get all expenses with filters
query GetExpenses {
  expenses(groupId: "1", from: "2024-01-01", to: "2024-12-31") {
    id
    groupId
    paidBy
    amount
    category
    description
    expenseDate
    type
    splits {
      participant {
        id
        name
      }
      amount
      settled
    }
  }
}

# Get single expense
query GetExpense {
  expense(id: "1") {
    id
    amount
    category
    description
    expenseDate
    splits {
      participant {
        name
      }
      amount
      settled
    }
  }
}
```

### Mutations

```graphql
# Create expense
mutation CreateExpense {
  createExpense(input: {
    groupId: "1"
    paidBy: "1"
    amount: 100.50
    category: "Food"
    description: "Dinner at restaurant"
    expenseDate: "2024-01-15"
    type: expense
    splits: [
      { participantId: "1", amount: 50.25 }
      { participantId: "2", amount: 50.25 }
    ]
  }) {
    id
    amount
    category
    splits {
      participant {
        name
      }
      amount
    }
  }
}

# Update expense
mutation UpdateExpense {
  updateExpense(id: "1", input: {
    amount: 120.00
    category: "Food"
    description: "Updated dinner expense"
    expenseDate: "2024-01-15"
    type: expense
    splits: [
      { participantId: "1", amount: 60.00 }
      { participantId: "2", amount: 60.00 }
    ]
  }) {
    id
    amount
    category
  }
}

# Delete expense
mutation DeleteExpense {
  deleteExpense(id: "1")
}

# Settle a split
mutation SettleSplit {
  settleSplit(expenseId: "1", participantId: "2") {
    id
    splits {
      participant {
        name
      }
      amount
      settled
    }
  }
}
```

## Reports and Analytics

### Queries

```graphql
# Get report summary
query GetReportSummary {
  reportSummary(groupId: "1", from: "2024-01-01", to: "2024-12-31") {
    totalIncome
    totalExpense
    balance
  }
}

# Get analytics data
query GetAnalytics {
  analytics(groupId: "1", from: "2024-01-01", to: "2024-12-31") {
    categoryBreakdown {
      category
      amount
      percentage
    }
    monthlyTrends {
      month
      income
      expense
      balance
    }
    topExpenseCategories {
      category
      amount
      percentage
    }
  }
}
```

## Authorization

All queries and mutations (except `register` and `login`) require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

GraphQL errors are returned in the standard GraphQL error format:

```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

## Development

### Starting the Server

```bash
cd server
npm run dev
```

The GraphQL Playground will be available at `http://localhost:4000/graphql` for testing queries and mutations.

### Database Initialization

The database tables are automatically created when the server starts. Make sure PostgreSQL is running and the connection details are correct in your `.env` file.

## Migration from REST

If you were previously using REST endpoints, here's the mapping:

| REST Endpoint | GraphQL Equivalent |
|--------------|-------------------|
| `POST /api/auth/register` | `mutation { register(...) }` |
| `POST /api/auth/login` | `mutation { login(...) }` |
| `GET /api/auth/profile` | `query { me }` |
| `GET /api/participants` | `query { participants }` |
| `POST /api/participants` | `mutation { createParticipant(...) }` |
| `PUT /api/participants/:id` | `mutation { updateParticipant(...) }` |
| `DELETE /api/participants/:id` | `mutation { deleteParticipant(...) }` |
| `GET /api/groups` | `query { groups }` |
| `POST /api/groups` | `mutation { createGroup(...) }` |
| `GET /api/expenses` | `query { expenses }` |
| `POST /api/expenses` | `mutation { createExpense(...) }` |
| `GET /api/reports/summary` | `query { reportSummary }` |
| `GET /api/analytics/trends` | `query { analytics }` |

## Benefits of GraphQL

1. **Single Endpoint**: All functionality through `/graphql`
2. **Flexible Queries**: Request only the data you need
3. **Type Safety**: Built-in schema validation
4. **Real-time**: Easy to add subscriptions later
5. **Documentation**: Self-documenting API through introspection
6. **Developer Experience**: GraphQL Playground for testing