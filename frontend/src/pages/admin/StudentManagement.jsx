import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getStudents, createStudent, updateStudent, deleteStudent, batchImportStudents } from '../../services/adminApi';
import { Plus, Edit2, Trash2, X, Users, Search, Upload, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [csvData, setCsvData] = useState('');
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    usn: '',
    password: '',
    department: '',
    section: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [pagination.page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStudents = async () => {
    try {
      const response = await getStudents({ page: pagination.page, search, limit: 20 });
      setStudents(response.data.students);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
        toast.success('Student updated successfully');
      } else {
        await createStudent(formData);
        toast.success('Student created successfully');
      }
      fetchStudents();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await deleteStudent(id);
      toast.success('Student deleted');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleBatchImport = async () => {
    try {
      const lines = csvData.trim().split('\n');
      const students = lines.slice(1).map(line => {
        const [usn, name, email, department, section] = line.split(',').map(s => s.trim());
        return { usn, name, email, department, section };
      }).filter(s => s.usn && s.name);

      if (students.length === 0) {
        toast.error('No valid students found in CSV');
        return;
      }

      const response = await batchImportStudents(students);
      toast.success(response.data.message);
      fetchStudents();
      setShowImportModal(false);
      setCsvData('');
    } catch (error) {
      toast.error('Import failed');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCsvData(e.target.result);
      reader.readAsText(file);
    }
  };

  const downloadTemplate = () => {
    const template = 'USN,Name,Email,Department,Section\n1MS21CS001,John Doe,john@college.edu,CSE,A\n1MS21CS002,Jane Smith,jane@college.edu,CSE,B';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
  };

  const openModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        usn: student.usn,
        password: '',
        department: student.department || '',
        section: student.section || ''
      });
    } else {
      setEditingStudent(null);
      setFormData({ name: '', email: '', usn: '', password: '', department: '', section: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({ name: '', email: '', usn: '', password: '', department: '', section: '' });
  };

  if (loading && students.length === 0) {
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
            <h1 className="text-2xl font-bold text-white">Student Management</h1>
            <p className="text-gray-400 mt-1">{pagination.total} total students</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#282828] border border-[#3e3e3e] text-white rounded-lg hover:bg-[#3e3e3e] transition-colors"
            >
              <Upload className="w-5 h-5" />
              Import CSV
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff375f] hover:bg-[#ff4d6d] text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Student
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, USN, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="w-full pl-10 pr-4 py-3 bg-[#282828] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-500 focus:border-[#ff375f] focus:outline-none"
          />
        </div>

        {/* Students Table */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Department</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Submissions</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Solved</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Score</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e3e3e]">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400">No students found</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-[#3e3e3e]/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#00b8a3]/20 rounded-full flex items-center justify-center">
                            <span className="text-[#00b8a3] font-semibold">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{student.name}</p>
                            <p className="text-gray-500 text-xs">{student.usn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-300">{student.department || '-'}</p>
                        <p className="text-gray-500 text-xs">Section {student.section || '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-300">{student.submission_count || 0}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[#00b8a3] font-medium">{student.solved_count || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-[#ffa116]/20 text-[#ffa116] rounded text-sm font-medium">
                          {student.total_score || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(student)}
                            className="p-2 hover:bg-[#3e3e3e] rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#3e3e3e]">
              <p className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 bg-[#3e3e3e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 bg-[#3e3e3e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#3e3e3e]">
              <h3 className="text-lg font-semibold text-white">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-[#3e3e3e] rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">USN</label>
                  <input
                    type="text"
                    value={formData.usn}
                    onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                    required
                    disabled={!!editingStudent}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Password {editingStudent && '(optional)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingStudent}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:border-[#ff375f] focus:outline-none"
                  />
                </div>
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
                  {editingStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#3e3e3e]">
              <h3 className="text-lg font-semibold text-white">Import Students from CSV</h3>
              <button onClick={() => setShowImportModal(false)} className="p-1 hover:bg-[#3e3e3e] rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a1a1a] border border-dashed border-[#3e3e3e] rounded-lg text-gray-400 hover:border-[#ff375f] transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Upload CSV File
                </button>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-3 bg-[#3e3e3e] rounded-lg text-gray-300 hover:bg-[#4e4e4e] transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Template
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  CSV Data (USN, Name, Email, Department, Section)
                </label>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={8}
                  placeholder="USN,Name,Email,Department,Section&#10;1MS21CS001,John Doe,john@college.edu,CSE,A&#10;1MS21CS002,Jane Smith,jane@college.edu,CSE,B"
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-600 focus:border-[#ff375f] focus:outline-none font-mono text-sm"
                />
              </div>

              <p className="text-xs text-gray-500">
                Default password for all imported students: <code className="text-[#ffa116]">password123</code>
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 bg-[#3e3e3e] text-white rounded-lg hover:bg-[#4e4e4e] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBatchImport}
                  disabled={!csvData.trim()}
                  className="flex-1 px-4 py-2 bg-[#ff375f] text-white rounded-lg hover:bg-[#ff4d6d] transition-colors disabled:opacity-50"
                >
                  Import Students
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default StudentManagement;
