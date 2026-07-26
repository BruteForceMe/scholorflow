import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

export default function TaskModal({ task, onClose }) {
  const { state, dispatch } = useApp();
  const isEdit = !!task;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'todo');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [deadline, setDeadline] = useState(task?.deadline || '');
  const [tags, setTags] = useState(task?.tags?.join(', ') || '');
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      deadline,
      assignee: state.currentUser?.id,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      subtasks,
    };

    if (isEdit) {
      dispatch({ type: 'UPDATE_TASK', payload: { ...taskData, id: task.id } });
    } else {
      dispatch({ type: 'ADD_TASK', payload: taskData });
    }
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: uuidv4(), title: newSubtask.trim(), done: false }]);
    setNewSubtask('');
  };

  const removeSubtask = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Task' : 'Create New Task'}</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="auth-field">
              <label className="input-label">Task Title *</label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. Complete Assignment"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="auth-field">
              <label className="input-label">Description</label>
              <textarea
                className="input-field"
                placeholder="Describe the task..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="auth-field">
                <label className="input-label">Status</label>
                <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="auth-field">
                <label className="input-label">Priority</label>
                <select className="input-field" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🔵 Low</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="auth-field">
                <label className="input-label">Deadline</label>
                <input
                  className="input-field"
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label className="input-label">Tags (comma-separated)</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. math, homework"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                />
              </div>
            </div>

            {/* Subtasks */}
            <div className="auth-field">
              <label className="input-label">Subtasks</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Add a subtask..."
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <button type="button" className="btn btn-secondary btn-icon" onClick={addSubtask}>
                  <FiPlus />
                </button>
              </div>
              {subtasks.length > 0 && (
                <div className="subtask-list" style={{ marginTop: 8 }}>
                  {subtasks.map(s => (
                    <div key={s.id} className="subtask-item" style={{ justifyContent: 'space-between' }}>
                      <span>{s.title}</span>
                      <button type="button" onClick={() => removeSubtask(s.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
