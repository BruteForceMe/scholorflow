import { v4 as uuidv4 } from 'uuid';

export const sampleUsers = [
  {
    id: 'user-1',
    name: 'Garv Arora',
    email: 'garv@example.com',
    password: 'password123',
    avatar: '🧑‍💻',
    role: 'admin',
  },
  {
    id: 'user-2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password123',
    avatar: '👩‍🎓',
    role: 'member',
  },
  {
    id: 'user-3',
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    password: 'password123',
    avatar: '👨‍🔬',
    role: 'member',
  },
];

export const sampleTasks = [
  {
    id: uuidv4(),
    title: 'Complete Math Assignment',
    description: 'Solve chapter 5 integration problems — due Friday.',
    status: 'todo',
    priority: 'high',
    deadline: '2026-04-14',
    assignee: 'user-1',
    tags: ['math', 'homework'],
    createdAt: '2026-04-10T10:00:00Z',
    subtasks: [
      { id: uuidv4(), title: 'Problems 1-10', done: true },
      { id: uuidv4(), title: 'Problems 11-20', done: false },
    ],
  },
  {
    id: uuidv4(),
    title: 'Research Paper Draft',
    description: 'Write first draft for CS research paper on ML applications.',
    status: 'inprogress',
    priority: 'high',
    deadline: '2026-04-18',
    assignee: 'user-1',
    tags: ['research', 'cs'],
    createdAt: '2026-04-08T14:00:00Z',
    subtasks: [
      { id: uuidv4(), title: 'Literature review', done: true },
      { id: uuidv4(), title: 'Methodology section', done: true },
      { id: uuidv4(), title: 'Results & analysis', done: false },
    ],
  },
  {
    id: uuidv4(),
    title: 'Group Presentation Slides',
    description: 'Prepare slides for the Economics group presentation.',
    status: 'todo',
    priority: 'medium',
    deadline: '2026-04-16',
    assignee: 'user-2',
    tags: ['group', 'presentation'],
    createdAt: '2026-04-09T09:00:00Z',
    subtasks: [],
  },
  {
    id: uuidv4(),
    title: 'Physics Lab Report',
    description: 'Document findings from the optics experiment.',
    status: 'done',
    priority: 'medium',
    deadline: '2026-04-11',
    assignee: 'user-3',
    tags: ['physics', 'lab'],
    createdAt: '2026-04-05T16:00:00Z',
    subtasks: [
      { id: uuidv4(), title: 'Data tables', done: true },
      { id: uuidv4(), title: 'Conclusion', done: true },
    ],
  },
  {
    id: uuidv4(),
    title: 'Study for Algorithms Midterm',
    description: 'Review sorting, graph algorithms, and dynamic programming.',
    status: 'todo',
    priority: 'high',
    deadline: '2026-04-20',
    assignee: 'user-1',
    tags: ['exam', 'cs'],
    createdAt: '2026-04-11T08:00:00Z',
    subtasks: [
      { id: uuidv4(), title: 'Sorting algorithms', done: false },
      { id: uuidv4(), title: 'Graph traversal', done: false },
      { id: uuidv4(), title: 'DP problems', done: false },
    ],
  },
  {
    id: uuidv4(),
    title: 'Update Portfolio Website',
    description: 'Add recent projects and update resume section.',
    status: 'inprogress',
    priority: 'low',
    deadline: '2026-04-25',
    assignee: 'user-1',
    tags: ['personal', 'web'],
    createdAt: '2026-04-10T12:00:00Z',
    subtasks: [],
  },
];

export const sampleNotes = [
  {
    id: uuidv4(),
    title: 'Algorithms Cheat Sheet',
    content: '## Sorting\n- **Bubble Sort**: O(n²)\n- **Merge Sort**: O(n log n)\n- **Quick Sort**: O(n log n) avg\n\n## Graphs\n- BFS, DFS, Dijkstra\n\n## Dynamic Programming\n- Knapsack\n- LCS\n- Fibonacci',
    author: 'user-1',
    sharedWith: ['user-2', 'user-3'],
    createdAt: '2026-04-09T10:00:00Z',
    tags: ['cs', 'algorithms'],
  },
  {
    id: uuidv4(),
    title: 'Economics Group Notes',
    content: '## Supply & Demand\n- Law of demand: inverse relationship\n- Price elasticity formula\n\n## Market Structures\n- Perfect competition\n- Monopoly\n- Oligopoly',
    author: 'user-2',
    sharedWith: ['user-1'],
    createdAt: '2026-04-08T14:00:00Z',
    tags: ['economics', 'group'],
  },
];

export const sampleWorkspaces = [
  {
    id: 'ws-1',
    name: 'CS Study Group',
    description: 'Computer Science study collaboration',
    members: ['user-1', 'user-2', 'user-3'],
    owner: 'user-1',
    color: '#6C63FF',
    createdAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'ws-2',
    name: 'Economics Project',
    description: 'Group project for Econ 201',
    members: ['user-1', 'user-2'],
    owner: 'user-2',
    color: '#FF6584',
    createdAt: '2026-04-05T10:00:00Z',
  },
];

export const sampleProductivityData = [
  { day: 'Mon', tasksCompleted: 3, hoursStudied: 4.5, focusScore: 78 },
  { day: 'Tue', tasksCompleted: 5, hoursStudied: 6.0, focusScore: 85 },
  { day: 'Wed', tasksCompleted: 2, hoursStudied: 3.0, focusScore: 62 },
  { day: 'Thu', tasksCompleted: 4, hoursStudied: 5.5, focusScore: 80 },
  { day: 'Fri', tasksCompleted: 6, hoursStudied: 7.0, focusScore: 92 },
  { day: 'Sat', tasksCompleted: 1, hoursStudied: 2.0, focusScore: 45 },
  { day: 'Sun', tasksCompleted: 3, hoursStudied: 4.0, focusScore: 70 },
];

export const sampleMessages = [
  {
    id: uuidv4(),
    workspaceId: 'ws-1',
    userId: 'user-2',
    text: 'Hey! Has anyone started the algorithms assignment?',
    timestamp: '2026-04-11T14:00:00Z',
  },
  {
    id: uuidv4(),
    workspaceId: 'ws-1',
    userId: 'user-3',
    text: 'I finished problems 1-5. The graph ones are tricky!',
    timestamp: '2026-04-11T14:05:00Z',
  },
  {
    id: uuidv4(),
    workspaceId: 'ws-1',
    userId: 'user-1',
    text: 'Let\'s meet tomorrow at the library to work on it together? 📚',
    timestamp: '2026-04-11T14:10:00Z',
  },
];
