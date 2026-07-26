import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FiPlus, FiUsers, FiMessageCircle, FiArrowLeft, FiSend, FiX } from 'react-icons/fi';

export default function WorkspacesPage() {
  const { state, dispatch } = useApp();
  const [activeWs, setActiveWs] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#00b4d8');
  const [msgText, setMsgText] = useState('');
  const chatEndRef = useRef(null);

  const getUserName = (id) => state.users.find(u => u.id === id)?.name || 'Unknown';
  const getUserAvatar = (id) => state.users.find(u => u.id === id)?.avatar || '🧑‍🎓';

  const workspace = state.workspaces.find(w => w.id === activeWs);
  const wsMessages = state.messages.filter(m => m.workspaceId === activeWs);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [wsMessages.length]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    dispatch({
      type: 'ADD_WORKSPACE',
      payload: {
        name: newName.trim(),
        description: newDesc.trim(),
        members: [state.currentUser?.id],
        owner: state.currentUser?.id,
        color: newColor,
      },
    });
    setNewName('');
    setNewDesc('');
    setShowCreate(false);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    dispatch({
      type: 'SEND_MESSAGE',
      payload: {
        workspaceId: activeWs,
        userId: state.currentUser?.id,
        text: msgText.trim(),
      },
    });
    setMsgText('');
  };

  // Show workspace detail/chat
  if (workspace) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn btn-ghost" onClick={() => setActiveWs(null)}>
            <FiArrowLeft /> Back
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: workspace.color,
                  display: 'inline-block',
                }}
              />
              {workspace.name}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{workspace.description}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          {/* Chat */}
          <div className="chat-container">
            <div className="chat-header">
              <FiMessageCircle />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Group Chat</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                — {wsMessages.length} messages
              </span>
            </div>

            <div className="chat-messages">
              {wsMessages.length === 0 ? (
                <div className="empty-state" style={{ padding: 40 }}>
                  <div className="empty-state-icon">💬</div>
                  <div className="empty-state-title">No messages yet</div>
                  <div className="empty-state-desc">Start a conversation with your team!</div>
                </div>
              ) : (
                wsMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.userId === state.currentUser?.id ? 'own' : ''}`}
                  >
                    <div className="chat-message-avatar">{getUserAvatar(msg.userId)}</div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600 }}>
                        {getUserName(msg.userId)}
                      </div>
                      <div className="chat-message-bubble">{msg.text}</div>
                      <div className="chat-message-time">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
              <input
                className="chat-input"
                placeholder="Type a message..."
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
                <FiSend />
              </button>
            </form>
          </div>

          {/* Members Panel */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiUsers size={15} /> Members ({workspace.members.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {workspace.members.map(memberId => (
                <div key={memberId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: '0.9rem' }}>
                    {getUserAvatar(memberId)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{getUserName(memberId)}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {memberId === workspace.owner ? '👑 Owner' : 'Member'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Workspaces list
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Workspaces 👥</h1>
        <p>Collaborate with your study groups and project teams</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {state.workspaces.length} workspace{state.workspaces.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <FiPlus /> New Workspace
          </button>
        </div>
      </div>

      <div className="workspace-grid">
        {state.workspaces.map(ws => (
          <div key={ws.id} className="workspace-card" onClick={() => setActiveWs(ws.id)}>
            <div className="workspace-card-accent" style={{ background: ws.color }} />
            <div className="workspace-card-title">{ws.name}</div>
            <div className="workspace-card-desc">{ws.description}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="workspace-members">
                {ws.members.slice(0, 4).map(memberId => (
                  <div key={memberId} className="workspace-member-avatar">
                    {getUserAvatar(memberId)}
                  </div>
                ))}
                {ws.members.length > 4 && (
                  <div className="workspace-member-avatar" style={{ fontSize: '0.65rem', background: 'var(--bg-card-hover)' }}>
                    +{ws.members.length - 4}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {ws.members.length} member{ws.members.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Workspace Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Workspace</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="auth-field">
                  <label className="input-label">Workspace Name *</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="e.g. CS Study Group"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="auth-field">
                  <label className="input-label">Description</label>
                  <textarea
                    className="input-field"
                    placeholder="What is this workspace for?"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label className="input-label">Accent Color</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['#00b4d8', '#ef476f', '#06d6a0', '#ffbe0b', '#118ab2', '#f72585'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: c,
                          border: newColor === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Workspace</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
