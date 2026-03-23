import React, { useEffect, useState } from 'react';
import { authApi, trainerApi } from '../services/apiService';
import toast from 'react-hot-toast';

export default function TrainerMembers({ currentUser }) {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveBlocks, setLeaveBlocks] = useState([]);

  const loadMembers = async () => {
    try {
      const response = await authApi.getMembers();
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load members.');
    }
  };

  const loadLeaveBlocks = async () => {
    try {
      const response = await trainerApi.getMyLeaveBlocks();
      setLeaveBlocks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load leave blocks.');
    }
  };

  useEffect(() => {
    loadMembers();
    loadLeaveBlocks();
  }, []);

  const handleAddMember = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authApi.addMember({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setName('');
      setEmail('');
      setPassword('');
      setMessage('Member added successfully.');
      toast.success('Member added successfully.');
      await loadMembers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to add member.';
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await authApi.removeMember(memberId);
      setMessage('Member removed successfully.');
      toast.success('Member removed successfully.');
      await loadMembers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to remove member.';
      setMessage(msg);
      toast.error(msg);
    }
  };

  const handleAddLeaveBlock = async (event) => {
    event.preventDefault();
    if (!leaveDate) {
      toast.error('Select a leave date first.');
      return;
    }

    try {
      await trainerApi.addLeaveBlock({ date: leaveDate, reason: leaveReason.trim() });
      setLeaveDate('');
      setLeaveReason('');
      toast.success('Leave block added. Members cannot book that day.');
      await loadLeaveBlocks();
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to add leave block.';
      toast.error(msg);
      setMessage(msg);
    }
  };

  const handleRemoveLeaveBlock = async (id) => {
    try {
      await trainerApi.removeLeaveBlock(id);
      toast.success('Leave block removed.');
      await loadLeaveBlocks();
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to remove leave block.';
      toast.error(msg);
      setMessage(msg);
    }
  };

  return (
    <div className="page-shell">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="fade-up">
          <p className="eyebrow">TRAINER CONTROL</p>
          <h1 className="page-title">Member Management</h1>
          <p className="page-subtitle">Add new members and keep your roster clean.</p>
        </div>

        {message && <div className="status-banner">{message}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="neo-card lg:col-span-1 slide-up-delay">
            <h2 className="section-title">Add Member</h2>
            <form onSubmit={handleAddMember} className="space-y-3 mt-4">
              <input
                className="neo-input"
                placeholder="Member name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <input
                type="email"
                className="neo-input"
                placeholder="Member email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <input
                type="password"
                className="neo-input"
                placeholder="Temporary password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button type="submit" disabled={loading} className="primary-cta w-full mt-2">
                {loading ? 'Adding...' : 'Add Member'}
              </button>
            </form>
          </div>

          <div className="neo-card lg:col-span-2 slide-up-delay-2 space-y-6">
            <h2 className="section-title">Current Members</h2>
            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {members.length === 0 && <p className="muted">No members yet.</p>}
              {members.map((member) => (
                <div key={member.id} className="member-row">
                  <div>
                    <p className="member-name">{member.name || 'Unnamed member'}</p>
                    <p className="member-email">{member.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="danger-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div>
              <h2 className="section-title">Trainer Leave Blocks</h2>
              <form onSubmit={handleAddLeaveBlock} className="grid md:grid-cols-3 gap-3 mt-3">
                <input
                  type="date"
                  className="neo-input"
                  value={leaveDate}
                  onChange={(event) => setLeaveDate(event.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <input
                  className="neo-input"
                  placeholder="Reason (optional)"
                  value={leaveReason}
                  onChange={(event) => setLeaveReason(event.target.value)}
                />
                <button type="submit" className="primary-cta">Block Date</button>
              </form>

              <div className="space-y-2 mt-4">
                {leaveBlocks.length === 0 && <p className="muted">No leave blocks yet.</p>}
                {leaveBlocks.map((block) => (
                  <div key={block.id} className="member-row">
                    <div>
                      <p className="member-name">{block.date}</p>
                      <p className="member-email">{block.reason}</p>
                    </div>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => handleRemoveLeaveBlock(block.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
