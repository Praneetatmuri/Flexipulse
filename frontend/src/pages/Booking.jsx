import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentsApi, trainerApi } from '../services/apiService';
import { getApiErrorMessage } from '../services/apiService';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function Booking({ currentUser }) {
  const [trainerName, setTrainerName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [leaveBlocks, setLeaveBlocks] = useState([]);

  // Demo trainers list
  const trainers = [
    { name: 'John' },
    { name: 'Sarah' },
    { name: 'Mike' },
  ];

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!trainerName || !selectedTime) {
        setMessage('Please select a trainer and time');
        setMessageType('error');
        toast.error('Please select trainer and time first.');
        setLoading(false);
        return;
      }

      const formattedDate = selectedDate.toISOString().split('T')[0];

      const isBlocked = leaveBlocks.some(
        (block) => block.trainerName === trainerName && block.date === formattedDate
      );

      if (isBlocked) {
        setMessage('Trainer is on leave on the selected date. Please choose another date.');
        setMessageType('error');
        toast.error('Selected trainer is on leave for this date.');
        setLoading(false);
        return;
      }

      await appointmentsApi.bookAppointment({
        trainerName,
        userEmail: currentUser.email,
        slotTime: selectedTime,
        date: formattedDate,
      });

      setMessage('Appointment booked successfully.');
      setMessageType('success');
      toast.success(`Session booked with Trainer ${trainerName}!`);
      setTrainerName('');
      setSelectedTime('');
      loadUserAppointments();
    } catch (error) {
      if (error.response?.status === 409) {
        setMessage('Trainer is not available for the selected time slot.');
        toast.error('This slot is already taken. Pick another one.');
      } else {
        const friendly = getApiErrorMessage(error, 'Error booking appointment. Please try again.');
        setMessage(friendly);
        toast.error(friendly);
      }
      setMessageType('error');
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAppointments = async () => {
    try {
      const response = await appointmentsApi.getAllAppointments();
      const list = Array.isArray(response.data) ? response.data : [];
      const mine = list.filter((item) => item.userEmail === currentUser.email);
      setAppointments(mine);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadLeaveBlocks = async () => {
    try {
      const response = await trainerApi.getAllLeaveBlocks();
      setLeaveBlocks(Array.isArray(response.data) ? response.data : []);
    } catch {
      setLeaveBlocks([]);
    }
  };

  React.useEffect(() => {
    loadUserAppointments();
    loadLeaveBlocks();
  }, []);

  return (
    <div className="page-shell">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="fade-up">
          <p className="eyebrow">SESSION SCHEDULER</p>
          <h1 className="page-title">Book Appointment</h1>
          <p className="page-subtitle">Choose your trainer, date, and slot in seconds.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="neo-card slide-up-delay">
            <h2 className="section-title">Schedule Training</h2>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="field-label">Select Trainer</label>
                <select
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  className="neo-input"
                  required
                >
                  <option value="">Choose a trainer...</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.name} value={trainer.name}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Select Date</label>
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  minDate={new Date()}
                  className="w-full rounded-xl border border-orange-400/30"
                />
              </div>

              <div>
                <label className="field-label">Select Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="neo-input"
                  required
                >
                  <option value="">Choose time...</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </select>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${
                    messageType === 'success'
                      ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/40'
                      : 'bg-red-500/20 text-red-100 border border-red-400/40'
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="primary-cta w-full disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>

          <div className="neo-card slide-up-delay-2">
            <h2 className="section-title">Your Appointments</h2>
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((apt) => (
                  <div key={apt.id} className="member-row">
                    <div>
                      <p className="member-name">{apt.trainerName}</p>
                      <p className="member-email">{apt.date} at {apt.slotTime}</p>
                    </div>
                    <span className="role-pill">BOOKED</span>
                  </div>
                ))
              ) : (
                <div className="empty-state py-8">
                  <p className="empty-state-title">You haven&apos;t booked any sessions yet.</p>
                  <p className="muted">Let&apos;s get you sweating. Choose a trainer and reserve your first slot.</p>
                  <Link to="/diet" className="primary-cta inline-flex mt-4 px-5">
                    Build Diet Plan Too
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
