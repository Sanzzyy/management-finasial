import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Import Lucide Icons
import { Calendar, Clock, MapPin, BookOpen, Laptop, AlertCircle, Sparkles, CheckCircle, Circle, Trash2, Edit2, Plus, X } from "lucide-react";

const Schedule = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Get today's name in English
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [activeDay, setActiveDay] = useState(todayName);

  // Form State
  const [subject, setSubject] = useState("");
  const [time, setTime] = useState("");
  const [room, setRoom] = useState("");
  const [type, setType] = useState("Lecture"); // Default English

  // State Edit Mode
  const [editId, setEditId] = useState(null);

  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchSchedules(userData.id);
    }
  }, []);

  const fetchSchedules = async (userId) => {
    try {
      const response = await axios.get(`/api/schedules/${userId}`);
      setSchedules(response.data);
    } catch (error) {
      console.error("Failed to fetch schedules", error);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Helper to map Indonesian days from DB (if existing data) to English UI
  // Note: For new data, we save in English.
  // Ideally, you should migrate old data or just handle display logic.

  // --- LOGIC CREATE / UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editId) {
        // --- UPDATE MODE ---
        await axios.put(`/api/schedules/${editId}`, {
          subject,
          time,
          room,
          type,
          day: activeDay,
        });
        setEditId(null);
      } else {
        // --- CREATE MODE ---
        await axios.post("/api/schedules", {
          subject,
          time,
          room,
          type,
          day: activeDay,
          userId: user.id,
        });
      }

      // Reset Form
      setSubject("");
      setTime("");
      setRoom("");
      setType("Lecture");
      fetchSchedules(user.id);
    } catch (error) {
      alert("Failed to save schedule");
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setSubject(item.subject);
    setTime(item.time);
    setRoom(item.room);
    setType(item.type);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setSubject("");
    setTime("");
    setRoom("");
    setType("Lecture");
  };

  const handleToggleComplete = async (item) => {
    try {
      await axios.put(`/api/schedules/${item.id}`, {
        isCompleted: !item.isCompleted,
      });
      fetchSchedules(user.id);
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this schedule?")) return;
    try {
      await axios.delete(`/api/schedules/${id}`);
      fetchSchedules(user.id);
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const filteredSchedules = schedules
    .filter((s) => s.day === activeDay) // Ensure day matches (Monday === Monday)
    .sort((a, b) => a.time.localeCompare(b.time));

  // Helper for Type Icon
  const getTypeIcon = (t) => {
    switch (t) {
      case "Lecture":
        return <BookOpen size={14} />;
      case "Lab":
        return <Laptop size={14} />; // Praktikum
      case "Exam":
        return <AlertCircle size={14} />; // Ujian/Deadline
      default:
        return <Sparkles size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 pb-28 pt-20 md:pt-0">
      <main className="mx-auto max-w-7xl p-6">
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar size={24} className="text-blue-500" /> Academic Schedule
            </h1>
            <p className="text-sm text-gray-400">Manage your classes and deadlines efficiently.</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-400 text-sm font-bold flex items-center gap-2">
            Today: <span className="text-white">{todayName}</span>
          </div>
        </div>

        {/* Day Navigator */}
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <div className="flex overflow-x-auto pb-4 gap-3 mb-6 hide-scrollbar touch-pan-x">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => {
                setActiveDay(day);
                handleCancelEdit();
              }}
              className={`shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                activeDay === day ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105" : "bg-[#1e293b] text-gray-500 hover:text-gray-300 hover:bg-[#283549]"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: LIST SCHEDULES */}
          <div className="lg:col-span-2 space-y-4">
            {filteredSchedules.length === 0 ? (
              <div className="rounded-3xl bg-[#1e293b] border border-gray-800 p-12 text-center flex flex-col items-center justify-center border-dashed min-h-[300px]">
                <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                  <Calendar size={32} className="text-gray-500 opacity-50" />
                </div>
                <h3 className="text-white font-bold text-lg">No classes today</h3>
                <p className="text-gray-500 text-sm mt-1">Enjoy your free time!</p>
              </div>
            ) : (
              filteredSchedules.map((item) => (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                    item.isCompleted ? "bg-[#1e293b]/50 border-gray-800/50 opacity-60 grayscale" : "bg-[#1e293b] border-gray-800 hover:border-blue-500/30"
                  }`}
                >
                  {/* Accent Line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.type === "Lecture" ? "bg-blue-500" : item.type === "Lab" ? "bg-purple-500" : item.type === "Exam" ? "bg-red-500" : "bg-amber-500"}`}></div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pl-4 gap-4">
                    <div className="flex gap-5 items-center">
                      {/* Time & Type */}
                      <div className="flex flex-col items-center justify-center min-w-[60px]">
                        <span className={`text-lg font-bold flex items-center gap-1 ${item.isCompleted ? "text-gray-500 line-through" : "text-white"}`}>{item.time}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold mt-1 flex items-center gap-1 ${
                            item.type === "Lecture" ? "bg-blue-500/10 text-blue-400" : item.type === "Lab" ? "bg-purple-500/10 text-purple-400" : item.type === "Exam" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {getTypeIcon(item.type)} {item.type}
                        </span>
                      </div>

                      {/* Subject Info */}
                      <div>
                        <h3 className={`text-lg font-bold ${item.isCompleted ? "text-gray-500 line-through decoration-2 decoration-gray-600" : "text-gray-100"}`}>{item.subject}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                          <MapPin size={14} />
                          <span>{item.room}</span>
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-2 border-t sm:border-t-0 border-gray-800 pt-3 sm:pt-0 justify-end">
                      <button
                        onClick={() => handleToggleComplete(item)}
                        className={`p-2 rounded-lg transition ${item.isCompleted ? "bg-emerald-500/20 text-emerald-500" : "bg-gray-800 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400"}`}
                        title={item.isCompleted ? "Mark Undone" : "Mark Done"}
                      >
                        {item.isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                      </button>

                      <button onClick={() => handleEditClick(item)} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-amber-500/20 hover:text-amber-400 transition" title="Edit">
                        <Edit2 size={18} />
                      </button>

                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT COLUMN: FORM */}
          <div className="lg:col-span-1">
            <div className={`sticky top-28 rounded-3xl p-6 border shadow-xl transition-all duration-300 ${editId ? "bg-amber-500/10 border-amber-500/30" : "bg-[#1e293b] border-gray-800"}`}>
              <h3 className={`font-bold mb-6 flex items-center gap-2 ${editId ? "text-amber-500" : "text-white"}`}>
                {editId ? (
                  <>
                    {" "}
                    <span className="p-1 rounded bg-amber-500 text-white">
                      <Edit2 size={12} />
                    </span>{" "}
                    Edit Schedule{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <span className="bg-emerald-500 text-white p-1 rounded">
                      <Plus size={12} />
                    </span>{" "}
                    Add Schedule{" "}
                  </>
                )}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Subject / Activity</label>
                  <input
                    type="text"
                    placeholder="e.g. Web Programming"
                    className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Start Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Type</label>
                    <div className="relative">
                      <select className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none appearance-none" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="Lecture">Lecture</option>
                        <option value="Lab">Lab</option>
                        <option value="Exam">Exam</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                        <BookOpen size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Room / Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Building A Room 301"
                      className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      required
                    />
                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                      <MapPin size={14} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {editId && (
                    <button type="button" onClick={handleCancelEdit} className="flex-1 rounded-xl bg-gray-700 py-3 font-bold text-gray-300 hover:bg-gray-600 transition flex items-center justify-center gap-2">
                      <X size={16} /> Cancel
                    </button>
                  )}
                  <button
                    className={`flex-1 rounded-xl py-3 font-bold text-white shadow-lg transition active:scale-95 flex items-center justify-center gap-2 ${editId ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20" : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"}`}
                  >
                    {editId ? "Update Schedule" : "Save Schedule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Schedule;
