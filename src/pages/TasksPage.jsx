import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import TaskModal from '../components/TaskModal';
import { FiPlus, FiGrid, FiList, FiClock, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';

const columns = [
  { key: 'todo', label: 'To Do', dot: 'todo' },
  { key: 'inprogress', label: 'In Progress', dot: 'inprogress' },
  { key: 'done', label: 'Done', dot: 'done' },
];

export default function TasksPage() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all');

  const myTasks = state.tasks.filter(t => {
    if (filter === 'all') return true;
    return t.priority === filter;
  });

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const handleStatusChange = (taskId, newStatus) => {
    dispatch({ type: 'MOVE_TASK', payload: { taskId, newStatus } });
  };

  const getDeadlineClass = (deadline) => {
    if (!deadline) return '';
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 1) return 'urgent';
    if (daysLeft <= 3) return 'soon';
    return '';
  };

  const getSubtaskProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const done = subtasks.filter(s => s.done).length;
    return Math.round((done / subtasks.length) * 100);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Task Board ✅</h1>
        <p>Organize, prioritize, and track your academic work</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${state.viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'kanban' })}
            >
              <FiGrid size={14} /> Kanban
            </button>
            <button
              className={`view-toggle-btn ${state.viewMode === 'list' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
            >
              <FiList size={14} /> List
            </button>
          </div>

          <select
            className="input-field"
            style={{ width: 'auto', padding: '6px 30px 6px 12px', fontSize: '0.82rem' }}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🔵 Low</option>
          </select>
        </div>

        <div className="toolbar-right">
          <button
            className="btn btn-primary"
            onClick={() => { setEditTask(null); setShowModal(true); }}
          >
            <FiPlus /> New Task
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {state.viewMode === 'kanban' && (
        <div className="kanban-board">
          {columns.map(col => {
            const colTasks = myTasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <span className={`kanban-dot ${col.dot}`} />
                    {col.label}
                  </div>
                  <span className="kanban-count">{colTasks.length}</span>
                </div>

                <div className="kanban-cards">
                  {colTasks.map(task => (
                    <div key={task.id} className="kanban-card" onClick={() => { setEditTask(task); setShowModal(true); }}>
                      <div className="kanban-card-header">
                        <div className="kanban-card-title">{task.title}</div>
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      </div>
                      {task.description && (
                        <div className="kanban-card-desc">{task.description}</div>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <div className="kanban-card-tags">
                          {task.tags.map(tag => (
                            <span key={tag} className="badge badge-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="kanban-card-progress">
                          <div
                            className="kanban-card-progress-bar"
                            style={{ width: `${getSubtaskProgress(task.subtasks)}%` }}
                          />
                        </div>
                      )}
                      <div className="kanban-card-footer" style={{ marginTop: 10 }}>
                        {task.deadline && (
                          <span className={`kanban-card-deadline ${getDeadlineClass(task.deadline)}`}>
                            <FiClock size={12} />
                            {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <div style={{ display: 'flex', gap: 4 }}>
                          {col.key !== 'done' && (
                            <button
                              className="btn-icon btn-ghost"
                              style={{ width: 26, height: 26 }}
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, col.key === 'todo' ? 'inprogress' : 'done'); }}
                              title="Move forward"
                            >
                              <FiCheck size={13} />
                            </button>
                          )}
                          <button
                            className="btn-icon btn-ghost"
                            style={{ width: 26, height: 26, color: 'var(--danger)' }}
                            onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                            title="Delete"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="kanban-add-btn"
                  onClick={() => {
                    setEditTask(null);
                    setShowModal(true);
                  }}
                >
                  <FiPlus size={14} /> Add Task
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {state.viewMode === 'list' && (
        <div className="list-view">
          {myTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No tasks yet</div>
              <div className="empty-state-desc">Create your first task to get started!</div>
              <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
                <FiPlus /> Create Task
              </button>
            </div>
          ) : (
            myTasks.map(task => (
              <div key={task.id} className="list-item" onClick={() => { setEditTask(task); setShowModal(true); }}>
                <div
                  className={`list-item-check ${task.status === 'done' ? 'checked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(task.id, task.status === 'done' ? 'todo' : 'done');
                  }}
                >
                  {task.status === 'done' && <FiCheck size={13} />}
                </div>
                <div className="list-item-content">
                  <div className={`list-item-title ${task.status === 'done' ? 'done' : ''}`}>
                    {task.title}
                  </div>
                  <div className="list-item-subtitle">{task.description}</div>
                </div>
                <div className="list-item-right">
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  {task.deadline && (
                    <span className={`kanban-card-deadline ${getDeadlineClass(task.deadline)}`}>
                      <FiClock size={12} />
                      {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  <button
                    className="btn-icon btn-ghost"
                    onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={editTask}
          onClose={() => { setShowModal(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}
