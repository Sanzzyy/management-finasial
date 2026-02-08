import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Import Lucide Icons
import { Calendar, Clock, MapPin, BookOpen, Laptop, AlertCircle, Sparkles, CheckCircle, Circle, Trash2, Edit2, Plus, X, Loader2 } from "lucide-react";

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
  const [type, setType] = useState("Lecture");

  // State Edit Mode
  const [editId, setEditId] = useState(null);

  // --- STATE LOADING ---
  const [isLoading, setIsLoading] = useState(false); // Untuk proses Submit/Edit
  const [isFetching, setIsFetching] = useState(true); // KHUSUS untuk Load Data Awal
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const userData = JSON.parse(storedUser);
      setUser(userData.user || userData);
      fetchSchedules();
    }
  }, []);

  const fetchSchedules = async () => {
    // Set fetching true saat mulai ambil data
    setIsFetching(true);
    try {
      const response = await api.get("/schedules");
      setSchedules(response.data);
    } catch (error) {
      console.error("Failed to fetch schedules", error);
      if (error.response?.status === 401) navigate("/login");
    } finally {
      // Selesai loading (sukses/gagal), matikan loading
      setIsFetching(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // --- HANDLER: CREATE / UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true); // Loading tombol simpan

    try {
      if (editId) {
        // --- UPDATE MODE ---
        await api.put(`/schedules/${editId}`, {
          subject,
          time,
          room,
          type,
          day: activeDay,
        });

        Swal.fire({
          icon: "success",
          title: "Schedule Updated!",
          text: "Your class details have been updated.",
          background: "#1e293b",
          color: "#fff",
          timer: 1500,
          showConfirmButton: false,
        });

        setEditId(null);
      } else {
        // --- CREATE MODE ---
        await api.post("/schedules", {
          subject,
          time,
          room,
          type,
          day: activeDay,
        });

        Swal.fire({
          icon: "success",
          title: "Schedule Added!",
          text: `${subject} has been added to ${activeDay}.`,
          background: "#1e293b",
          color: "#fff",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      // Reset Form & Refresh Data
      setSubject("");
      setTime("");
      setRoom("");
      setType("Lecture");
      await fetchSchedules();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to save schedule.",
        background: "#1e293b",
        color: "#fff",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setSubject(item.subject);
    setTime(item.time);
    setRoom(item.room);
    setType(item.type);

    const formElement = document.getElementById("schedule-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
      const updatedSchedules = schedules.map((s) => (s.id === item.id ? { ...s, isCompleted: !s.isCompleted } : s));
      setSchedules(updatedSchedules);

      await api.put(`/schedules/${item.id}`, {
        isCompleted: !item.isCompleted,
      });
      fetchSchedules();
    } catch (error) {
      console.error("Failed to update status");
      fetchSchedules();
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Schedule?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
      background: "#1e293b",
      color: "#fff",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/schedules/${id}`);
        await fetchSchedules();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Schedule has been removed.",
          background: "#1e293b",
          color: "#fff",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete schedule.",
          background: "#1e293b",
          color: "#fff",
        });
      }
    }
  };

  const filteredSchedules = schedules.filter((s) => s.day === activeDay).sort((a, b) => a.time.localeCompare(b.time));

  const getTypeIcon = (t) => {
    switch (t) {
      case "Lecture":
        return <BookOpen size={14} />;
      case "Lab":
        return <Laptop size={14} />;
      case "Exam":
        return <AlertCircle size={14} />;
      default:
        return <Sparkles size={14} />;
    }
  };

  // --- COMPONENT: SKELETON LOADER ---
  const ScheduleSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse bg-[#1e293b] border border-gray-800 rounded-2xl p-5 h-[100px] flex items-center gap-4">
          <div className="w-1.5 h-full bg-gray-700 rounded"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-8 bg-gray-700 rounded-lg"></div>
        </div>
      ))}
    </div>
  );

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
            {/* LOGIKA DISPLAY: Fetching -> Empty -> List */}
            {isFetching ? (
              // TAMPILKAN SKELETON SAAT LOADING
              <ScheduleSkeleton />
            ) : filteredSchedules.length === 0 ? (
              // TAMPILKAN EMPTY STATE JIKA DATA KOSONG (SETELAH FETCHING)
              <div className="rounded-3xl bg-[#1e293b] border border-gray-800 p-12 text-center flex flex-col items-center justify-center border-dashed min-h-[300px] animate-in fade-in zoom-in duration-300">
                <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                  <Calendar size={32} className="text-gray-500 opacity-50" />
                </div>
                <h3 className="text-white font-bold text-lg">No classes today</h3>
                <p className="text-gray-500 text-sm mt-1">Enjoy your free time!</p>
              </div>
            ) : (
              // TAMPILKAN DATA ASLI
              filteredSchedules.map((item) => (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 animate-in slide-in-from-bottom-2 ${
                    item.isCompleted ? "bg-[#1e293b]/50 border-gray-800/50 opacity-60 grayscale" : "bg-[#1e293b] border-gray-800 hover:border-blue-500/30"
                  }`}
                >
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

          {/* RIGHT COLUMN: FORM (Tidak berubah) */}
          <div className="lg:col-span-1" id="schedule-form">
            <div className={`sticky top-28 rounded-3xl p-6 border shadow-xl transition-all duration-300 ${editId ? "bg-amber-500/10 border-amber-500/30" : "bg-[#1e293b] border-gray-800"}`}>
              <h3 className={`font-bold mb-6 flex items-center gap-2 ${editId ? "text-amber-500" : "text-white"}`}>
                {editId ? (
                  <>
                    <span className="p-1 rounded bg-amber-500 text-white">
                      <Edit2 size={12} />
                    </span>
                    Edit Schedule
                  </>
                ) : (
                  <>
                    <span className="bg-emerald-500 text-white p-1 rounded">
                      <Plus size={12} />
                    </span>
                    Add Schedule
                  </>
                )}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input: Subject */}
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Subject / Activity</label>
                  <input
                    type="text"
                    disabled={isLoading}
                    placeholder="e.g. Web Programming"
                    className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Input: Time */}
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Start Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        disabled={isLoading}
                        className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {/* Input: Type */}
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Type</label>
                    <div className="relative">
                      <select
                        disabled={isLoading}
                        className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                      >
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

                {/* Input: Room */}
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Room / Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={isLoading}
                      placeholder="e.g. Building A Room 301"
                      className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      required
                    />
                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                      <MapPin size={14} />
                    </div>
                  </div>
                </div>

                {/* BUTTONS GROUP */}
                <div className="flex gap-2 mt-4">
                  {editId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="flex-1 rounded-xl bg-gray-700 py-3 font-bold text-gray-300 hover:bg-gray-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={16} /> Cancel
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 rounded-xl py-3 font-bold text-white shadow-lg transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      editId ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20" : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> {editId ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>{editId ? "Update Schedule" : "Save Schedule"}</>
                    )}
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
