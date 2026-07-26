import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FiX, FiShare2 } from 'react-icons/fi';

export default function NoteModal({ note, onClose }) {
  const { state, dispatch } = useApp();
  const isEdit = !!note;

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      author: state.currentUser?.id,
      sharedWith: note?.sharedWith || [],
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (isEdit) {
      dispatch({ type: 'UPDATE_NOTE', payload: { ...noteData, id: note.id } });
    } else {
      dispatch({ type: 'ADD_NOTE', payload: noteData });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Note' : 'Create New Note'}</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="auth-field">
              <label className="input-label">Title *</label>
              <input
                className="input-field"
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="auth-field">
              <label className="input-label">Content (Markdown supported)</label>
              <textarea
                className="input-field"
                placeholder="Write your notes here... Markdown is supported!"
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ minHeight: 200, fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>

            <div className="auth-field">
              <label className="input-label">Tags (comma-separated)</label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. algorithms, study"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
