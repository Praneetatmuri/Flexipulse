import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { appointmentsApi, healthApi, goalsApi } from '../services/apiService';
import { getApiErrorMessage } from '../services/apiService';

export default function Dashboard({ currentUser }) {
  const [metrics, setMetrics] = useState(null);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [deadline, setDeadline] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const userId = currentUser?.id;

  useEffect(() => {
    if (userId) {
      loadMetrics();
      loadGoal();
    }
  }, [userId]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const response = await healthApi.getMetrics(userId);
      const list = Array.isArray(response.data) ? response.data : [];
      setHistory(list.map((item, idx) => ({ name: `M${idx + 1}`, weight: item.weight })));
      if (list.length > 0) {
        const latest = list[list.length - 1];
        setMetrics(latest);
        setHeight(String(latest.height || ''));
        setWeight(String(latest.weight || ''));
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoal = async () => {
    try {
      const response = await goalsApi.getActiveGoal(userId);
      setGoal(response.data);
    } catch (error) {
      setGoal(null);
    }
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    try {
      await goalsApi.saveGoal({
        userId,
        targetWeight: parseFloat(targetWeight),
        startWeight: metrics?.weight || parseFloat(weight),
        currentWeight: metrics?.weight || parseFloat(weight),
        deadline,
        status: 'ACTIVE'
      });
      toast.success('Goal set successfully!');
      setShowGoalModal(false);
      loadGoal();
    } catch (error) {
      toast.error('Failed to set goal.');
    }
  };

  const calculateProgress = () => {
    if (!goal || !metrics) return 0;
    const total = Math.abs(goal.startWeight - goal.targetWeight);
    const progress = Math.abs(goal.startWeight - metrics.weight);
    if (total === 0) return 0;
    return Math.min(100, Math.max(0, (progress / total) * 100));
  };

  const loadStreak = async () => {
    try {
      const response = await appointmentsApi.getAllAppointments();
      const list = Array.isArray(response.data) ? response.data : [];
      const mine = list
        .filter((item) => item.userEmail === currentUser?.email)
        .map((item) => item.date)
        .filter(Boolean)
        .sort();

      let count = 0;
      let prevWeek = null;
      for (let i = mine.length - 1; i >= 0; i -= 1) {
        const d = new Date(mine[i]);
        const week = `${d.getFullYear()}-${Math.ceil((d.getDate() + 6 - d.getDay()) / 7)}`;
        if (prevWeek === null) {
          count = 1;
          prevWeek = week;
          continue;
        }
        if (week !== prevWeek) {
          count += 1;
          prevWeek = week;
        }
      }
      setStreak(count);
    } catch {
      setStreak(0);
    }
  };

  useEffect(() => {
    if (currentUser?.email) {
      loadStreak();
    }
  }, [currentUser?.email]);

  const handleSaveMetrics = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!userId) {
      setMessage('No active user session found. Please login again.');
      return;
    }

    setLoading(true);
    try {
      const response = await healthApi.saveMetrics({
        userId,
        height: parseFloat(height),
        weight: parseFloat(weight),
      });
      setMetrics(response.data);
      setMessage('Metrics updated successfully.');
      toast.success('Metrics updated successfully.');
      loadMetrics();
    } catch (error) {
      console.error('Error saving metrics:', error);
      const friendly = getApiErrorMessage(error, 'Error saving metrics. Please try again.');
      setMessage(friendly);
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="hero-stage fade-up">
          <div className="hero-media" />
          <div className="hero-overlay" />
          <span className="hero-wave hero-wave-cyan" aria-hidden="true" />
          <span className="hero-wave hero-wave-magenta" aria-hidden="true" />
          <span className="hero-wave hero-wave-yellow" aria-hidden="true" />

          <div className="hero-content">
            <div className="hero-topline">
              <p className="hero-menu-item">FITNESS</p>
              <p className="hero-menu-item">NUTRITION</p>
              <p className="hero-menu-item">BOOKINGS</p>
            </div>

            <p className="eyebrow">WELCOME, {currentUser?.name || 'ATHLETE'}</p>
            <h1 className="hero-title">
              WE ARE <span>FLEX</span>
            </h1>
            <p className="hero-subtitle">A fitness movement worth breaking a sweat for.</p>

            <div className="hero-actions">
              <Link to="/workout-ai" className="primary-cta inline-flex px-6">AI Coach</Link>
              <div className="streak-chip">🔥 Streak: {streak} week{streak === 1 ? '' : 's'}</div>
            </div>

            <div className="hero-qr">
              <p className="hero-qr-text">Quick gym check-in</p>
              <div className="hero-qr-box">
                <QRCodeSVG
                  value={`flexipulse-hero-checkin:${currentUser?.id || 'unknown'}`}
                  size={88}
                  bgColor="transparent"
                  fgColor="#f4f7ff"
                />
              </div>
            </div>
          </div>
        </div>

        {message && <div className="status-banner">{message}</div>}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="neo-card slide-up-delay">
            <h2 className="section-title">Current Metrics</h2>
            {metrics ? (
              <div className="space-y-3 mt-4">
                <div className="metric-strip">
                  <p className="metric-label">BMI</p>
                  <p className="metric-value">{metrics.bmi?.toFixed(1)}</p>
                </div>
                <div className="metric-strip">
                  <p className="metric-label">Category</p>
                  <p className="metric-value-sm">{metrics.workoutCategory}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="mini-metric">
                    <p className="mini-label">Height</p>
                    <p className="mini-value">{metrics.height} m</p>
                  </div>
                  <div className="mini-metric">
                    <p className="mini-label">Weight</p>
                    <p className="mini-value">{metrics.weight} kg</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted mt-4">Save metrics to see your status.</p>
            )}
          </div>

          <div className="neo-card slide-up-delay-2">
            <h2 className="section-title">Goal Progress</h2>
            {goal ? (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold">{calculateProgress().toFixed(0)}%</p>
                  <p className="muted text-sm">Target: {goal.targetWeight}kg</p>
                </div>
                <div className="w-full bg-black/40 rounded-full h-4 overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-magenta-400 transition-all duration-1000"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
                <p className="muted text-xs italic">Deadline: {goal.deadline}</p>
                <button onClick={() => setShowGoalModal(true)} className="text-xs text-cyan-400 underline uppercase tracking-widest">Update Goal</button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="muted">No active goal set yet.</p>
                <button onClick={() => setShowGoalModal(true)} className="primary-cta w-full py-2">Set My First Goal</button>
              </div>
            )}
          </div>

          <div className="neo-card slide-up-delay-3">
            <h2 className="section-title">Update Health</h2>
            <form onSubmit={handleSaveMetrics} className="space-y-4 mt-2">
              <input
                type="number" step="0.01" value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Height (m)" className="neo-input py-2" required
              />
              <input
                type="number" step="0.1" value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight (kg)" className="neo-input py-2" required
              />
              <button type="submit" className="primary-cta w-full py-2">Save</button>
            </form>
          </div>
        </div>

        {showGoalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="neo-card w-full max-w-md border-cyan-500/30">
              <h2 className="section-title">Set Your Goal</h2>
              <form onSubmit={handleSaveGoal} className="space-y-5 mt-6">
                <div>
                  <label className="field-label">Target Weight (kg)</label>
                  <input 
                    type="number" step="0.1" value={targetWeight} 
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="neo-input" placeholder="e.g., 75.0" required 
                  />
                </div>
                <div>
                  <label className="field-label">Deadline</label>
                  <input 
                    type="date" value={deadline} 
                    onChange={(e) => setDeadline(e.target.value)}
                    className="neo-input" required 
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="primary-cta flex-1">Save Goal</button>
                  <button type="button" onClick={() => setShowGoalModal(false)} className="neo-input flex-1 bg-transparent hover:bg-white/5 transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="neo-card hover-lift">
            <h2 className="section-title">Weight Trend</h2>
            <div className="h-56 mt-4">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,157,78,0.2)" />
                    <XAxis dataKey="name" stroke="#ffd3ad" />
                    <YAxis stroke="#ffd3ad" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(24,16,11,0.94)',
                        border: '1px solid rgba(255,157,78,0.4)',
                      }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#ff8a2a" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="muted">No trend data yet.</p>
              )}
            </div>
          </div>

          <div className="neo-card hover-lift">
            <h2 className="section-title">Gym Access</h2>
            <div className="mt-5 flex flex-col items-center gap-3">
              <div className="qr-wrap">
                <QRCodeSVG value={`flexipulse-checkin:${userId}`} size={160} bgColor="transparent" fgColor="#ff8a2a" />
              </div>
              <p className="muted text-sm">Scan at desk for entry</p>
              <Link to="/booking" className="primary-cta inline-flex px-5 py-2">Book Session</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
