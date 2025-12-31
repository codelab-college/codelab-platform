import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../services/adminApi';
import { Plus, Edit2, Trash2, X, GraduationCap, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    usn: '',
    password: '',
    department: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await getTeachers();
      setTeachers(response.data.teachers);
    } catch (error) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, formData);
        toast.success('Teacher updated successfully');
      } else {
        await createTeacher(formData);
        toast.success('Teacher created successfully');
      }
      fetchTeachers();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await deleteTeacher(id);
      toast.success('Teacher deleted');
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to delete teacher');
    }
  };

  const openModal = (teacher = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.name,
        email: teacher.email,
        usn: teacher.usn,
        password: '',
        department: teacher.department || ''
      });
    } else {
      setEditingTeacher(null);
      setFormData({ name: '', email: '', usn: '', password: '', department: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({ name: '', email: '', usn: '', password: '', department: '' });
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.usn.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff375f]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Teacher Management</h1>
            <p className="text-gray-400 mt-1">Manage platform teachers</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff375f] hover:bg-[#ff4d6d] text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Teacher
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#282828] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-500 focus:border-[#ff375f] focus:outline-none"
          />
        </div>

        {/* Teachers Table */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Teacher</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Department</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Assignments</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e3e3e]">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400">No teachers found</p>
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-[#3e3e3e]/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <span className="text-blue-400 font-semibold">
                              {teacher.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{teacher.name}</p>
                            <p className="text-gray-500 text-xs">{teacher.usn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{teacher.email}</td>
                      <td className="px-4 py-3 text-gray-300">{teacher.department || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-[#ffa116]/20 text-[#ffa116] rounded text-sm font-medium">
                          {teacher.assignment_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(teacher)}
                            className="p-2 hover:bg-[#3e3e3e] rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            className="p-2 hover:bg-[#ff375f]/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-[#ff375f]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#3e3e3e]">
              <h3 className="text-lg font-semibold text-white">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-[#3e3e3e] rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">USN/ID</label>
                <input
                  type="text"
                  value={formData.usn}
                  onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                  required
                  disabled={!!editingTeacher}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Password {editingTeacher && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingTeacher}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-[#3e3e3e] text-white rounded-lg hover:bg-[#4e4e4e] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#ff375f] text-white rounded-lg hover:bg-[#ff4d6d] transition-colors"
                >
                  {editingTeacher ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TeacherManagement;
