import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  sampleUsers,
  sampleTasks,
  sampleNotes,
  sampleWorkspaces,
  sampleProductivityData,
  sampleMessages,
} from '../utils/sampleData';

const AppContext = createContext();

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  users: sampleUsers,
  tasks: sampleTasks,
  notes: sampleNotes,
  workspaces: sampleWorkspaces,
  productivityData: sampleProductivityData,
  messages: sampleMessages,
  viewMode: 'kanban', // 'kanban' | 'list'
  theme: 'dark',
  activeWorkspace: null,
};

function loadState() {
  try {
    const saved = localStorage.getItem('scholorflow_state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return initialState;
}

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false };
    case 'SIGNUP': {
      const newUser = {
        id: `user-${uuidv4().slice(0, 8)}`,
        name: action.payload.name,
        email: action.payload.email,
        password: action.payload.password,
        avatar: '🧑‍🎓',
        role: 'member',
      };
      return {
        ...state,
        users: [...state.users, newUser],
        currentUser: newUser,
        isAuthenticated: true,
      };
    }
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, { ...action.payload, id: uuidv4(), createdAt: new Date().toISOString() }] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => (t.id === action.payload.id ? { ...t, ...action.payload } : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId ? { ...t, status: action.payload.newStatus } : t
        ),
      };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, { ...action.payload, id: uuidv4(), createdAt: new Date().toISOString() }] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n => (n.id === action.payload.id ? { ...n, ...action.payload } : n)),
      };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };
    case 'ADD_WORKSPACE':
      return {
        ...state,
        workspaces: [...state.workspaces, { ...action.payload, id: `ws-${uuidv4().slice(0, 8)}`, createdAt: new Date().toISOString() }],
      };
    case 'SET_ACTIVE_WORKSPACE':
      return { ...state, activeWorkspace: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { id: uuidv4(), ...action.payload, timestamp: new Date().toISOString() }],
      };
    case 'TOGGLE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id === action.payload.taskId) {
            return {
              ...t,
              subtasks: t.subtasks.map(s =>
                s.id === action.payload.subtaskId ? { ...s, done: !s.done } : s
              ),
            };
          }
          return t;
        }),
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);

  useEffect(() => {
    localStorage.setItem('scholorflow_state', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export default AppContext;
