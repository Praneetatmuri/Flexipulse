import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { appointmentsApi, healthApi } from '../services/apiService';
import { getApiErrorMessage } from '../services/apiService';

export default function Dashboard({ currentUser }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);

  const userId = currentUser?.id;

  useEffect(() => {
    if (userId) {
      loadMetrics();
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
        <div className="fade-up">
          <p className="eyebrow">MEMBER DASHBOARD</p>
          <h1 className="page-title">Health Command Center</h1>
          <p className="page-subtitle">Welcome back, {currentUser?.name || 'athlete'}.</p>
          <div className="streak-chip mt-3">🔥 Workout streak: {streak} week{streak === 1 ? '' : 's'}</div>
        </div>

        {message && <div className="status-banner">{message}</div>}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="neo-card slide-up-delay">
            <h2 className="section-title">Current Metrics</h2>
            {loading && !metrics && (
              <div className="space-y-3 mt-4">
                <div className="skeleton h-20" />
                <div className="skeleton h-16" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="skeleton h-14" />
                  <div className="skeleton h-14" />
                </div>
              </div>
            )}
            {metrics ? (
              <div className="space-y-3 mt-4">
                <div className="metric-strip">
                  <p className="metric-label">BMI</p>
                  <p className="metric-value">{metrics.bmi?.toFixed(1)}</p>
                </div>
                <div className="metric-strip">
                  <p className="metric-label">Workout Category</p>
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
              <div className="empty-state mt-4">
                <p className="empty-state-title">No metrics yet.</p>
                <p className="muted">Add your health info to initialize your profile.</p>
              </div>
            )}
          </div>

          <div className="neo-card slide-up-delay-2">
            <h2 className="section-title">Update Metrics</h2>
            <form onSubmit={handleSaveMetrics} className="space-y-4">
              <div>
                <label className="field-label">Height (meters)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 1.75"
                  className="neo-input"
                  required
                />
              </div>
              <div>
                <label className="field-label">Weight (kilograms)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 70"
                  className="neo-input"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="primary-cta w-full disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Metrics'}
              </button>
            </form>
          </div>
        </div>

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
                <div className="empty-state h-full">
                  <p className="empty-state-title">No trend data yet.</p>
                  <p className="muted">Save at least one metric to activate your chart.</p>
                </div>
              )}
            </div>
          </div>

          <div className="neo-card hover-lift">
            <h2 className="section-title">Gym Check-In QR</h2>
            <div className="mt-5 flex flex-col items-center gap-3">
              <div className="qr-wrap">
                <QRCodeSVG
                  value={`flexipulse-checkin:${currentUser?.id || 'unknown'}`}
                  size={160}
                  bgColor="transparent"
                  fgColor="#ff8a2a"
                />
              </div>
              <p className="muted text-center">Scan at front desk to check in instantly.</p>
              <Link to="/booking" className="primary-cta inline-flex px-5">Book Next Session</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
