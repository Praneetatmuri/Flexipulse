import React, { useState, useEffect } from 'react';
import { nutritionApi, healthApi } from '../services/apiService';
import { getApiErrorMessage } from '../services/apiService';

export default function AIDiet({ currentUser }) {
  const userId = currentUser?.id;
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  
  // Additional diet preferences
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [allergies, setAllergies] = useState('');
  const [healthConditions, setHealthConditions] = useState([]);
  const [fitnessGoal, setFitnessGoal] = useState('maintenance');
  const [mealsPerDay, setMealsPerDay] = useState('3');
  const [calorieTarget, setCalorieTarget] = useState('');
  const [cuisinePreferences, setCuisinePreferences] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    if (userId) {
      loadMetrics();
      loadApiStatus();
    }
  }, [userId]);

  const loadMetrics = async () => {
    try {
      const response = await healthApi.getMetrics(userId);
      const list = Array.isArray(response.data) ? response.data : [];
      if (list.length > 0) {
        setMetrics(list[list.length - 1]);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadApiStatus = async () => {
    try {
      const response = await nutritionApi.getApiStatus();
      setApiStatus(response.data);
    } catch {
      setApiStatus({ configured: false, message: 'Unable to verify AI service status.' });
    }
  };

  const handleGenerateDiet = async () => {
    setLoading(true);
    setError('');
    setDietPlan(null);

    try {
      if (!metrics) {
        setError('Please add your health metrics first!');
        setLoading(false);
        return;
      }

      const response = await nutritionApi.generateDietPlan({
        userId,
        weight: metrics.weight,
        height: metrics.height,
        workoutCategory: metrics.workoutCategory || 'Balanced Fitness',
        dietaryPreferences: '',
        dietaryRestrictions: dietaryRestrictions.join(', '),
        allergies: allergies,
        healthConditions: healthConditions.join(', '),
        fitnessGoal: fitnessGoal,
        mealsPerDay: parseInt(mealsPerDay),
        calorieTarget: calorieTarget ? parseInt(calorieTarget) : null,
        cuisinePreferences: cuisinePreferences,
        gender: gender,
        age: age ? parseInt(age) : null,
      });

      if (response.data.success) {
        setDietPlan(response.data);
      } else {
        setError(response.data.message || 'Failed to generate diet plan');
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('flexiToken');
        setError('Your session expired after server restart. Please log in again.');
      } else {
        setError(getApiErrorMessage(err, 'Error generating diet plan. Please try again.'));
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseDietPlan = (planText) => {
    try {
      // Try to parse as JSON first
      return JSON.parse(planText);
    } catch (e) {
      // If not JSON, return as plain text
      return { text: planText };
    }
  };

  const renderDietPlan = (plan) => {
    if (plan.text) {
      return (
        <div className="whitespace-pre-wrap text-gray-100 leading-relaxed font-400">
          {plan.text}
        </div>
      );
    }

    if (plan.days && Array.isArray(plan.days)) {
      return (
        <div className="space-y-6">
          {plan.days.map((day) => (
            <div key={day.day} className="border-l-4 border-orange-500 p-4 bg-orange-900/30 rounded-lg">
              <h4 className="font-bold text-lg text-white mb-4">Day {day.day}</h4>
              <div className="space-y-3">
                {day.meals && day.meals.map((meal, idx) => (
                  <div key={idx} className="bg-gray-800/60 p-3 rounded border border-orange-600/50">
                    <p className="font-semibold text-orange-300">{meal.meal}</p>
                    {Array.isArray(meal.items) ? (
                      <ul className="ml-4 mt-2 space-y-1">
                        {meal.items.map((item, i) => (
                          <li key={i} className="text-gray-100 text-sm">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-100 text-sm mt-2">{meal.items}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-gray-100">{JSON.stringify(plan, null, 2)}</p>;
  };

  return (
    <div className="page-shell">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="fade-up">
          <p className="eyebrow">AI NUTRITION ENGINE</p>
          <h1 className="page-title">Smart Diet Planner</h1>
          <p className="page-subtitle">Generate a precise weekly plan tuned to your metrics and preferences.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Panel: Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Health Metrics */}
            <div className="neo-card">
              <h2 className="section-title mb-4">Your Health Profile</h2>

              {apiStatus && !apiStatus.configured && (
                <div className="bg-yellow-500/20 border border-yellow-400/40 p-3 rounded-lg mb-4 text-yellow-100 text-sm">
                  {apiStatus.message}
                </div>
              )}

              {metrics ? (
                <div className="space-y-3 mb-6 bg-orange-50/50 p-4 rounded-lg">
                  <div className="metric-strip">
                    <p className="metric-label">BMI</p>
                    <p className="metric-value">{metrics.bmi?.toFixed(1)}</p>
                  </div>
                  <div className="metric-strip">
                    <p className="metric-label">Workout Category</p>
                    <p className="metric-value-sm">{metrics.workoutCategory}</p>
                  </div>
                  <div className="mini-metric">
                    <p className="mini-label">Height / Weight</p>
                    <p className="mini-value">{metrics.height} m / {metrics.weight} kg</p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-500/20 border border-yellow-400/40 p-4 rounded-lg mb-6">
                  <p className="text-yellow-100 text-sm">
                    Please update your health metrics first on the dashboard.
                  </p>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="neo-card">
              <h2 className="section-title mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text block mb-2">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="label-text block mb-2">Age (years)</label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    placeholder="e.g., 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>
            <div className="neo-card">
              <h3 className="section-title mb-3">Dietary Restrictions</h3>
              <div className="space-y-2">
                {['Vegetarian', 'Vegan', 'Keto', 'Gluten-Free', 'Low-Carb', 'No Dairy'].map((option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded transition">
                    <input
                      type="checkbox"
                      checked={dietaryRestrictions.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDietaryRestrictions([...dietaryRestrictions, option]);
                        } else {
                          setDietaryRestrictions(dietaryRestrictions.filter((r) => r !== option));
                        }
                      }}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-white font-500">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="neo-card">
              <h3 className="section-title mb-3">Food Allergies & Intolerances</h3>
              <input
                type="text"
                placeholder="e.g., nuts, shellfish, eggs, soy (comma-separated)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="input-field w-full"
              />
            </div>

            {/* Health Conditions */}
            <div className="neo-card">
              <h3 className="section-title mb-3">Health Conditions</h3>
              <div className="space-y-2">
                {['Diabetes', 'Hypertension', 'Thyroid', 'IBS', 'Heart Disease', 'High Cholesterol'].map((option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded transition">
                    <input
                      type="checkbox"
                      checked={healthConditions.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setHealthConditions([...healthConditions, option]);
                        } else {
                          setHealthConditions(healthConditions.filter((c) => c !== option));
                        }
                      }}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-white font-500">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Goals & Preferences */}
            <div className="neo-card">
              <h3 className="section-title mb-4">Fitness & Nutrition Goals</h3>
              <div className="space-y-4">
                <div>
                  <label className="label-text block mb-2">Primary Goal</label>
                  <select
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="weight-loss">Weight Loss</option>
                    <option value="muscle-gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="athletic-performance">Athletic Performance</option>
                    <option value="general-health">General Health</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-text block mb-2">Meals Per Day</label>
                    <select
                      value={mealsPerDay}
                      onChange={(e) => setMealsPerDay(e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="2">2 Meals</option>
                      <option value="3">3 Meals</option>
                      <option value="4">4 Meals</option>
                      <option value="5">5 Meals</option>
                      <option value="6">6 Meals</option>
                    </select>
                  </div>

                  <div>
                    <label className="label-text block mb-2">Daily Calorie Target (Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g., 2000"
                      value={calorieTarget}
                      onChange={(e) => setCalorieTarget(e.target.value)}
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text block mb-2">Cuisine Preferences</label>
                  <input
                    type="text"
                    placeholder="e.g., Indian, Mediterranean, Asian (comma-separated)"
                    value={cuisinePreferences}
                    onChange={(e) => setCuisinePreferences(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/40 text-red-100 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerateDiet}
              disabled={loading || !metrics}
              className="primary-cta w-full disabled:opacity-50 text-lg py-4"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">...</span>
                  Generating Your Personal Plan...
                </>
              ) : (
                '🍽️ Generate My 7-Day Diet Plan'
              )}
            </button>

            <p className="text-xs text-orange-100/70 text-center">
              AI output is generated by Gemini based on your metrics and preferences.
            </p>
          </div>

          {/* Right Panel: Diet Plan Output */}
          <div className="md:col-span-1">
            <div className="neo-card sticky top-20">
              <h2 className="section-title mb-4">Your Diet Plan</h2>
              {dietPlan ? (
                <div className="max-h-screen overflow-y-auto space-y-4">
                  {renderDietPlan(parseDietPlan(dietPlan.dietPlan || ''))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg mb-2 text-white">📋 Your personalized diet plan will appear here.</p>
                  <p className="text-sm text-gray-300">Fill in your preferences and generate to receive a full weekly recommendation tailored to your goals.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
