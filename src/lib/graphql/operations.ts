import { gql } from '@apollo/client';

// =====================
// AUTHENTICATION
// =====================

export const REGISTER_USER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      user {
        id
        name
        email
      }
      token
      message
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        name
        email
      }
      token
      message
    }
  }
`;

export const GET_ME = gql`
  query Me {
    me {
      id
      name
      email
      createdAt
    }
  }
`;

// =====================
// EXPENSES (Transactions)
// =====================

export const GET_EXPENSES = gql`
  query GetExpenses($groupId: ID, $participantId: ID, $from: Date, $to: Date) {
    expenses(groupId: $groupId, participantId: $participantId, from: $from, to: $to) {
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
          email
        }
        amount
        settled
      }
    }
  }
`;

export const GET_EXPENSE = gql`
  query GetExpense($id: ID!) {
    expense(id: $id) {
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
          email
        }
        amount
        settled
      }
    }
  }
`;

export const CREATE_EXPENSE = gql`
  mutation CreateExpense($input: ExpenseInput!) {
    createExpense(input: $input) {
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
          email
        }
        amount
        settled
      }
    }
  }
`;

export const UPDATE_EXPENSE = gql`
  mutation UpdateExpense($id: ID!, $input: ExpenseInput!) {
    updateExpense(id: $id, input: $input) {
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
          email
        }
        amount
        settled
      }
    }
  }
`;

export const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id)
  }
`;

export const SETTLE_SPLIT = gql`
  mutation SettleSplit($expenseId: ID!, $participantId: ID!) {
    settleSplit(expenseId: $expenseId, participantId: $participantId) {
      id
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
`;

// =====================
// PARTICIPANTS
// =====================

export const GET_PARTICIPANTS = gql`
  query GetParticipants {
    participants {
      id
      name
      email
      mobile
    }
  }
`;

export const GET_PARTICIPANT = gql`
  query GetParticipant($id: ID!) {
    participant(id: $id) {
      id
      name
      email
      mobile
    }
  }
`;

export const CREATE_PARTICIPANT = gql`
  mutation CreateParticipant($name: String!, $email: String!, $mobile: String) {
    createParticipant(name: $name, email: $email, mobile: $mobile) {
      id
      name
      email
      mobile
    }
  }
`;

export const UPDATE_PARTICIPANT = gql`
  mutation UpdateParticipant($id: ID!, $name: String, $email: String, $mobile: String) {
    updateParticipant(id: $id, name: $name, email: $email, mobile: $mobile) {
      id
      name
      email
      mobile
    }
  }
`;

export const DELETE_PARTICIPANT = gql`
  mutation DeleteParticipant($id: ID!) {
    deleteParticipant(id: $id)
  }
`;

// =====================
// GROUPS
// =====================

export const GET_GROUPS = gql`
  query GetGroups {
    groups {
      id
      name
      description
      members {
        id
        name
        email
        mobile
      }
    }
  }
`;

export const GET_GROUP = gql`
  query GetGroup($id: ID!) {
    group(id: $id) {
      id
      name
      description
      members {
        id
        name
        email
        mobile
      }
    }
  }
`;

export const CREATE_GROUP = gql`
  mutation CreateGroup($name: String!, $description: String) {
    createGroup(name: $name, description: $description) {
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
`;

export const UPDATE_GROUP = gql`
  mutation UpdateGroup($id: ID!, $name: String, $description: String) {
    updateGroup(id: $id, name: $name, description: $description) {
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
`;

export const DELETE_GROUP = gql`
  mutation DeleteGroup($id: ID!) {
    deleteGroup(id: $id)
  }
`;

export const ADD_PARTICIPANT_TO_GROUP = gql`
  mutation AddParticipantToGroup($groupId: ID!, $participantId: ID!) {
    addParticipantToGroup(groupId: $groupId, participantId: $participantId) {
      id
      name
      members {
        id
        name
        email
      }
    }
  }
`;

export const REMOVE_PARTICIPANT_FROM_GROUP = gql`
  mutation RemoveParticipantFromGroup($groupId: ID!, $participantId: ID!) {
    removeParticipantFromGroup(groupId: $groupId, participantId: $participantId) {
      id
      name
      members {
        id
        name
        email
      }
    }
  }
`;

// =====================
// REPORTS & ANALYTICS
// =====================

export const GET_REPORT_SUMMARY = gql`
  query GetReportSummary($groupId: ID, $participantId: ID, $from: Date, $to: Date) {
    reportSummary(groupId: $groupId, participantId: $participantId, from: $from, to: $to) {
      totalIncome
      totalExpense
      balance
    }
  }
`;

export const GET_ANALYTICS = gql`
  query GetAnalytics($groupId: ID, $participantId: ID, $from: Date, $to: Date) {
    analytics(groupId: $groupId, participantId: $participantId, from: $from, to: $to) {
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
`;
