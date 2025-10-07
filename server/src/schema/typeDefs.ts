import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date

  enum TransactionType {
    income
    expense
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

  type Query {
    participants: [Participant!]!
    groups: [Group!]!
    expenses(groupId: ID, participantId: ID, from: Date, to: Date): [Expense!]!
    reportSummary(groupId: ID, participantId: ID, from: Date, to: Date): ReportSummary!
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
    createParticipant(name: String!, email: String!, mobile: String): Participant!
    createGroup(name: String!, description: String): Group!
    addParticipantToGroup(groupId: ID!, participantId: ID!): Group!
    createExpense(input: ExpenseInput!): Expense!
    settleSplit(expenseId: ID!, participantId: ID!): Expense!
  }
`;


