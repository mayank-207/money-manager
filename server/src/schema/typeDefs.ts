import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date

  enum TransactionType {
    income
    expense
  }

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

  type Participant {
    id: ID!
    name: String!
    email: String!
    mobile: String
  }

  type Group {
    id: ID!
    name: String!
    description: String
    members: [Participant!]!
  }

  type ExpenseSplit {
    participant: Participant!
    amount: Float!
    settled: Boolean!
  }

  type Expense {
    id: ID!
    groupId: ID
    paidBy: ID!
    amount: Float!
    category: String!
    description: String
    expenseDate: Date!
    type: TransactionType!
    splits: [ExpenseSplit!]!
  }

  type ReportSummary {
    totalIncome: Float!
    totalExpense: Float!
    balance: Float!
  }

  type CategoryData {
    category: String!
    amount: Float!
    percentage: Float!
  }

  type MonthlyData {
    month: String!
    income: Float!
    expense: Float!
    balance: Float!
  }

  type AnalyticsData {
    categoryBreakdown: [CategoryData!]!
    monthlyTrends: [MonthlyData!]!
    topExpenseCategories: [CategoryData!]!
  }

  type Query {
    # Authentication
    me: User

    # Participants
    participants: [Participant!]!
    participant(id: ID!): Participant

    # Groups
    groups: [Group!]!
    group(id: ID!): Group

    # Expenses
    expenses(groupId: ID, participantId: ID, from: Date, to: Date): [Expense!]!
    expense(id: ID!): Expense

    # Reports
    reportSummary(groupId: ID, participantId: ID, from: Date, to: Date): ReportSummary!
    
    # Analytics
    analytics(groupId: ID, participantId: ID, from: Date, to: Date): AnalyticsData!
  }

  input ExpenseSplitInput {
    participantId: ID!
    amount: Float!
  }

  input ExpenseInput {
    groupId: ID
    paidBy: ID!
    amount: Float!
    category: String!
    description: String
    expenseDate: Date!
    type: TransactionType!
    splits: [ExpenseSplitInput!]!
  }

  type Mutation {
    # Authentication
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Participants
    createParticipant(name: String!, email: String!, mobile: String): Participant!
    updateParticipant(id: ID!, name: String, email: String, mobile: String): Participant!
    deleteParticipant(id: ID!): Boolean!

    # Groups
    createGroup(name: String!, description: String): Group!
    updateGroup(id: ID!, name: String, description: String): Group!
    deleteGroup(id: ID!): Boolean!
    addParticipantToGroup(groupId: ID!, participantId: ID!): Group!
    removeParticipantFromGroup(groupId: ID!, participantId: ID!): Group!

    # Expenses
    createExpense(input: ExpenseInput!): Expense!
    updateExpense(id: ID!, input: ExpenseInput!): Expense!
    deleteExpense(id: ID!): Boolean!
    settleSplit(expenseId: ID!, participantId: ID!): Expense!
  }
`;


