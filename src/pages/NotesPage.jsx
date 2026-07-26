import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import NoteModal from '../components/NoteModal';
import { FiPlus, FiTrash2, FiEdit2, FiShare2, FiClock } from 'react-icons/fi';

export default function NotesPage() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_NOTE', payload: id });
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const getUserName = (userId) => {
    const user = state.users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  const getUserAvatar = (userId) => {
    const user = state.users.find(u => u.id === userId);
    return user?.avatar || '🧑‍🎓';
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Notes & Files 📝</h1>
        <p>Create, share, and organize your study notes</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {state.notes.length} note{state.notes.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="toolbar-right">
          <button
            className="btn btn-primary"
            onClick={() => { setEditNote(null); setShowModal(true); }}
          >
            <FiPlus /> New Note
          </button>
        </div>
      </div>

      {state.notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📒</div>
          <div className="empty-state-title">No notes yet</div>
          <div className="empty-state-desc">Create your first note to start organizing your study materials.</div>
          <button className="btn btn-primary" onClick={() => { setEditNote(null); setShowModal(true); }}>
            <FiPlus /> Create Note
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedNote ? '1fr 1.5fr' : '1fr', gap: 20 }}>
          <div className="notes-grid" style={selectedNote ? { gridTemplateColumns: '1fr' } : {}}>
            {state.notes.map(note => (
              <div
                key={note.id}
                className="note-card"
                style={selectedNote?.id === note.id ? { borderColor: 'var(--accent-primary)', boxShadow: 'var(--accent-glow)' } : {}}
                onClick={() => setSelectedNote(note)}
              >
                <div className="note-card-title">{note.title}</div>
                <div className="note-card-preview">
                  {note.content.replace(/[#*\-\n]/g, ' ').substring(0, 150)}...
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                    {note.tags.map(tag => (
                      <span key={tag} className="badge badge-tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="note-card-footer">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {getUserAvatar(note.author)} {getUserName(note.author)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiClock size={11} />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Note Detail Panel */}
          {selectedNote && (
            <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)', alignSelf: 'start', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.25rem' }}>{selectedNote.title}</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setEditNote(selectedNote); setShowModal(true); }}
                  >
                    <FiEdit2 size={13} /> Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(selectedNote.id)}
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {selectedNote.tags?.map(tag => (
                  <span key={tag} className="badge badge-tag">{tag}</span>
                ))}
              </div>

              {selectedNote.sharedWith?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <FiShare2 size={13} />
                  Shared with: {selectedNote.sharedWith.map(id => getUserName(id)).join(', ')}
                </div>
              )}

              <div
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: 20,
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-primary)',
                  color: 'var(--text-secondary)',
                }}
              >
                {selectedNote.content}
              </div>

              <div style={{ marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiClock size={11} />
                Created {new Date(selectedNote.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <NoteModal
          note={editNote}
          onClose={() => { setShowModal(false); setEditNote(null); }}
        />
      )}
    </div>
  );
}
