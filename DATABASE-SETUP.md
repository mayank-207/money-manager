# Database Setup Guide for Money Manager

## 🔧 **Fixed Issue**: Database Integration

Your API routes have been updated to use **PostgreSQL database** instead of in-memory storage. Now all data will persist in the database!

## 📋 **Prerequisites**

### 1. Install PostgreSQL
If you don't have PostgreSQL installed:

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or use chocolatey: `choco install postgresql`

**Alternative - Use Docker:**
```bash
docker run --name postgres-money-manager -e POSTGRES_PASSWORD=123456 -p 5433:5432 -d postgres:13
```

### 2. Create Database
Connect to PostgreSQL and create the database:

```sql
-- Connect to PostgreSQL (default user: postgres)
-- Create database
CREATE DATABASE expense_tracker;
```

Or using command line:
```bash
createdb -U postgres expense_tracker
```

## 🚀 **Setup Steps**

### Step 1: Environment Configuration
Your `.env` file is already configured:
```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=passwd
```

**Update these values if your PostgreSQL setup is different!**

### Step 2: Start Your Server
```bash
cd d:\FinTracker\money-manager\server
npm run dev
```

The server will automatically:
- ✅ Connect to PostgreSQL
- ✅ Create all required tables
- ✅ Start listening on port 4000

### Step 3: Test Database Connection
Look for these messages in your console:
```
🔄 Initializing database tables...
✅ Database tables initialized successfully
🚀 Server running on http://localhost:4000
```

## 📊 **Database Schema**

Your database now has these tables:

### **participants**
- `id` (Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `mobile` (VARCHAR)
- `created_at` (Timestamp)

### **groups**
- `id` (Primary Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `created_at` (Timestamp)

### **group_members** (Junction Table)
- `id` (Primary Key)
- `group_id` (Foreign Key → groups)
- `participant_id` (Foreign Key → participants)
- `joined_at` (Timestamp)

### **expenses**
- `id` (Primary Key)
- `group_id` (Foreign Key → groups)
- `paid_by` (Foreign Key → participants)
- `amount` (DECIMAL)
- `category` (VARCHAR)
- `description` (TEXT)
- `expense_date` (DATE)
- `type` (VARCHAR: 'income' or 'expense')
- `created_at` (Timestamp)

### **expense_splits**
- `id` (Primary Key)
- `expense_id` (Foreign Key → expenses)
- `participant_id` (Foreign Key → participants)
- `amount` (DECIMAL)
- `settled` (BOOLEAN)
- `settled_at` (Timestamp)

## 🧪 **Testing with Postman**

### Updated Testing Flow:

#### 1. **Create Participants First**
```json
POST /api/participants
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+1234567890"
}
```
**Response**: Participant with ID (e.g., `id: 1`)

#### 2. **Create Groups with Members**
```json
POST /api/groups
{
  "name": "Weekend Trip",
  "description": "Group for weekend trip expenses",
  "memberIds": [1, 2]  // Use actual participant IDs
}
```

#### 3. **Create Expenses**
```json
POST /api/expenses
{
  "amount": 25.50,
  "description": "Lunch at restaurant",
  "category": "Food",
  "groupId": 1,        // Use actual group ID
  "paidBy": 1,         // Use actual participant ID
  "splitBetween": [1, 2], // Use actual participant IDs
  "date": "2024-10-13",
  "type": "expense"
}
```

#### 4. **Get Reports with Real Data**
```json
GET /api/reports/summary
// Returns actual calculations from database
{
  "totalIncome": 100.00,
  "totalExpense": 75.50,
  "balance": 24.50,
  "expensesByCategory": [...],
  "monthlyTrends": [...]
}
```

## ✨ **New Features**

### Enhanced API Responses
- **Participants**: Include creation timestamps
- **Groups**: Include member details in response
- **Expenses**: Include payer info, group name, and split details
- **Reports**: Real calculations from database
- **Analytics**: Actual trends based on your data

### Error Handling
- Validation for required fields
- Unique email constraint for participants
- Transaction support for complex operations
- Proper HTTP status codes

### Database Transactions
- Group creation with members uses transactions
- Expense creation with splits uses transactions
- Rollback on errors ensures data consistency

## 🔍 **Troubleshooting**

### Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:5433
```
**Solution**: Check if PostgreSQL is running on port 5433

### Database Not Found
```
Error: database "expense_tracker" does not exist
```
**Solution**: Create the database manually:
```sql
CREATE DATABASE expense_tracker;
```

### Permission Denied
```
Error: permission denied for table participants
```
**Solution**: Check database user permissions

### Port Already in Use
```
Error: listen EADDRINUSE :::4000
```
**Solution**: Kill existing process or change PORT in .env

## 🎯 **What's Different Now**

| Before | After |
|--------|-------|
| ❌ In-memory arrays | ✅ PostgreSQL database |
| ❌ Data lost on restart | ✅ Persistent storage |
| ❌ No relationships | ✅ Proper foreign keys |
| ❌ No validation | ✅ Database constraints |
| ❌ No transactions | ✅ ACID compliance |
| ❌ Fake IDs | ✅ Auto-increment IDs |

## 🚀 **Next Steps**

1. **Test all endpoints** with the updated Postman collection
2. **Add more participants** and groups
3. **Create expenses** and see them persist
4. **Check reports** with real data
5. **Explore analytics** trends

Your Money Manager API now has a proper database backend! 🎉