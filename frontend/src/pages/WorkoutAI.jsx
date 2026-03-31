import React, { useState, useEffect } from 'react';
import { workoutsApi, getApiErrorMessage } from '../services/apiService';
import toast from 'react-hot-toast';

export default function WorkoutAI({ currentUser }) {
    const [goalType, setGoalType] = useState('Strength');
    const [daysPerWeek, setDaysPerWeek] = useState(3);
    const [equipment, setEquipment] = useState('Gym');
    const [fitnessLevel, setFitnessLevel] = useState('Beginner');
    const [loading, setLoading] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [history, setHistory] = useState([]);

    const userId = currentUser?.id;

    useEffect(() => {
        if (userId) {
            loadHistory();
        }
    }, [userId]);

    const loadHistory = async () => {
        try {
            const response = await workoutsApi.getHistory(userId);
            setHistory(response.data);
            if (response.data.length > 0) {
                setCurrentPlan(response.data[0]);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setCurrentPlan(null);
        try {
            const response = await workoutsApi.generateWorkout({
                userId,
                goalType,
                daysPerWeek,
                equipment,
                fitnessLevel
            });
            setCurrentPlan(response.data);
            toast.success('New workout plan generated!');
            loadHistory();
        } catch (error) {
            const msg = getApiErrorMessage(error, 'AI generation failed. Using fallback.');
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-shell">
            <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="hero-title !text-5xl">AI COACH</h1>
                        <p className="muted">Personalized training protocols powered by Gemini.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="neo-card border-magenta-500/20">
                            <h2 className="section-title">Configure Routine</h2>
                            <form onSubmit={handleGenerate} className="space-y-4 mt-4">
                                <div>
                                    <label className="field-label">Target Goal</label>
                                    <select value={goalType} onChange={(e) => setGoalType(e.target.value)} className="neo-input">
                                        <option>Strength</option>
                                        <option>Hypertrophy (Muscle)</option>
                                        <option>Fat Loss</option>
                                        <option>Endurance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="field-label">Frequency (Days/Week)</label>
                                    <select value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))} className="neo-input">
                                        <option value={2}>2 Days</option>
                                        <option value={3}>3 Days</option>
                                        <option value={4}>4 Days</option>
                                        <option value={5}>5 Days</option>
                                        <option value={6}>6 Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="field-label">Environment</label>
                                    <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className="neo-input">
                                        <option>Commercial Gym</option>
                                        <option>Dumbbells Only</option>
                                        <option>Bodyweight Only</option>
                                        <option>Home Gym (Basic)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="field-label">Experience Level</label>
                                    <select value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)} className="neo-input">
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={loading} className="primary-cta w-full py-3">
                                    {loading ? 'ANALYZING...' : 'GENERATE PLAN'}
                                </button>
                            </form>
                        </div>

                        <div className="neo-card">
                            <h2 className="section-title">History</h2>
                            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                                {history.map((item) => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => setCurrentPlan(item)}
                                        className={`p-3 rounded border border-white/5 cursor-pointer transition-all hover:bg-white/5 ${currentPlan?.id === item.id ? 'border-cyan-500 bg-cyan-500/5' : ''}`}
                                    >
                                        <p className="font-bold text-sm tracking-widest">{item.goalType.toUpperCase()}</p>
                                        <p className="muted text-xs">{new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        {loading ? (
                            <div className="neo-card h-[600px] flex flex-col items-center justify-center space-y-6 text-center">
                                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                <div>
                                    <p className="text-xl font-bold tracking-widest animate-pulse">OPTIMIZING PROTOCOL</p>
                                    <p className="muted">Gemini is architecting your weekly split...</p>
                                </div>
                            </div>
                        ) : currentPlan ? (
                            <div className="neo-card min-h-[600px] border-cyan-500/20 slide-up">
                                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                                    <div>
                                        <h2 className="section-title">{currentPlan.goalType} Protocol</h2>
                                        <p className="muted text-xs">Generated on {new Date(currentPlan.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => window.print()} className="text-xs text-magenta-400 border border-magenta-400/30 px-3 py-1 rounded">EXPORT PDF</button>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-sm md:text-base">
                                        {currentPlan.planText}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="neo-card h-[600px] flex flex-col items-center justify-center text-center opacity-40">
                                <p className="text-4xl mb-4">🏋️‍♂️</p>
                                <p className="text-xl font-bold tracking-tighter">PLAN NOT FOUND</p>
                                <p className="muted">Select your parameters and generate a new plan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
