import { useState, useEffect } from 'react';
import { LogIn, LogOut, Plus, User, Filter, Search } from 'lucide-react';

// Mock API service
const mockStudentData = [
  { id: 1, name: 'Atanu Ghosh', email: 'atanughosh@gmail.com', course: 'Computer Science', grade: 'A+' },
  { id: 2, name: 'Anik kundu', email: 'anikkundu@gmail.com', course: 'Information Technology', grade: 'B+' },
  { id: 3, name: 'Abhirup Bhoumik', email: 'abhirup@gmail.com', course: 'Civil', grade: 'A' },
  { id: 4, name: 'Raju Mondol', email: 'rajumondol@gmail.com', course: 'Computer Science', grade: 'B' },
  { id: 5, name: 'Jit Das', email: 'jitdas@gmail.com', course: 'Electrical', grade: 'A' },
  { id: 6, name: 'Ayan Roy', email: 'ayanroy@gmail.com', course: 'Civil', grade: 'A+' },
];

const courses = ['All Courses', 'Computer Science', 'Information Technology', 'Electrical', 'Civil'];

const fetchStudents = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStudentData);
    }, 1000);
  });
};

// Firebase Mock
const FirebaseAuthMock = {
  currentUser: null,
  
  login: function(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          this.currentUser = { email, uid: '123456', displayName: email.split('@')[0] };
          resolve(this.currentUser);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });
  },
  
  logout: function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null;
        resolve();
      }, 500);
    });
  },
  
  isAuthenticated: function() {
    return this.currentUser !== null;
  }
};

// Main Dashboard Component
export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    course: 'Computer Science',
    grade: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchStudents();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesCourse = selectedCourse === 'All Courses' || student.course === selectedCourse;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           student.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const handleAddStudent = () => {
    // Form validation
    const errors = {};
    if (!newStudent.name.trim()) errors.name = 'Name is required';
    if (!newStudent.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStudent.email)) {
      errors.email = 'Invalid email format';
    }
    if (!newStudent.grade.trim()) errors.grade = 'Grade is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const newStudentWithId = {
      ...newStudent,
      id: students.length + 1
    };
    
    setStudents([...students, newStudentWithId]);
    setShowAddModal(false);
    setNewStudent({
      name: '',
      email: '',
      course: 'Computer Science',
      grade: ''
    });
    setFormErrors({});
  };

  const handleLogin = async () => {
    try {
      await FirebaseAuthMock.login(loginEmail, loginPassword);
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
      
      // If we need to show student details after login
      if (selectedStudent && !showAddModal) {
        setShowDetailsModal(true);
      }
      
      // If login was triggered for adding a student
      if (showAddModal) {
        setShowAddModal(true);
      }
    } catch (error) {
      alert('Login failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleLogout = async () => {
    await FirebaseAuthMock.logout();
    setIsAuthenticated(false);
  };

  const openStudentDetails = (student) => {
    if (isAuthenticated) {
      setSelectedStudent(student);
      setShowDetailsModal(true);
    } else {
      setSelectedStudent(student);
      setShowLoginModal(true);
    }
  };

  const initiateAddStudent = () => {
    if (isAuthenticated) {
      setShowAddModal(true);
    } else {
      setShowAddModal(true);
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-500 text-white p-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
          </div>
          <div>
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-blue-800 hover:bg-blue-600 px-3 py-3 rounded-md transition-colors"
              >
                
                <span>Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center space-x-1 bg-blue-800 hover:bg-blue-600 px-4 py-3 rounded-md transition-colors"
              >
                
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        {/* Controls */}
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="relative w-full md:w-auto">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="pl-10 pr-8 py-2 border rounded-md appearance-none w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={initiateAddStudent}
            className="flex items-center space-x-1 bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors w-full md:w-auto justify-center"
          >
            <Plus size={16} />
            <span>Add Student</span>
          </button>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No students found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {student.course}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.grade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openStudentDetails(student)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Login Required</h2>
            <p className="mb-4 text-gray-600">Please login to continue</p>
            
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Student</h2>
            
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="course">
                  Course
                </label>
                <select
                  id="course"
                  value={newStudent.course}
                  onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {courses.filter(course => course !== 'All Courses').map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="grade">
                  Grade
                </label>
                <input
                  type="text"
                  id="grade"
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.grade ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.grade && <p className="text-red-500 text-xs mt-1">{formErrors.grade}</p>}
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Student Details</h2>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={40} className="text-gray-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">{selectedStudent.course}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Grade</p>
                  <p className="font-medium">{selectedStudent.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-medium">{selectedStudent.id}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 py-4 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Student Management Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}