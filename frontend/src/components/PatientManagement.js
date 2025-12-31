import React, { useState, useEffect } from 'react';
import { patientsAPI } from '../Api.js';

const PatientManagement = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    medical_history: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      // For demo purposes, use mock data
      setPatients([
        {
          _id: '1',
          patient_id: 'P001',
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1980-05-15',
          gender: 'Male',
          created_at: new Date().toISOString()
        },
        {
          _id: '2',
          patient_id: 'P002',
          first_name: 'Jane',
          last_name: 'Smith',
          date_of_birth: '1975-08-22',
          gender: 'Female',
          created_at: new Date().toISOString()
        },
        {
          _id: '3',
          patient_id: 'P003',
          first_name: 'Robert',
          last_name: 'Johnson',
          date_of_birth: '1965-12-03',
          gender: 'Male',
          created_at: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      const newPatient = {
        _id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString()
      };
      setPatients([...patients, newPatient]);
      setShowCreateForm(false);
      setFormData({
        patient_id: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        medical_history: ''
      });
    } catch (err) {
      console.error('Failed to create patient:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name} ${patient.patient_id}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          ➕ Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            className="w-full form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-3 text-gray-400">🔍</div>
        </div>
      </div>

      {/* Create Patient Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Patient</h2>
            
            <form onSubmit={handleCreatePatient}>
              <div className="form-group">
                <label className="form-label">
                  Patient ID *
                </label>
                <input
                  type="text"
                  name="patient_id"
                  required
                  className="form-input"
                  placeholder="e.g., P001"
                  value={formData.patient_id}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    className="form-input"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    className="form-input"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  className="form-input"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Gender
                </label>
                <select
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Medical History
                </label>
                <textarea
                  name="medical_history"
                  rows="3"
                  className="form-input"
                  placeholder="Relevant medical history..."
                  value={formData.medical_history}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patients List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Patients ({filteredPatients.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td className="font-medium text-gray-900">
                    {patient.patient_id}
                  </td>
                  <td>
                    <div className="flex items-center">
                      <span className="text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="text-gray-500">
                    {formatDate(patient.date_of_birth)}
                  </td>
                  <td className="text-gray-500">
                    {patient.gender || 'N/A'}
                  </td>
                  <td className="text-gray-500">
                    {formatDate(patient.created_at)}
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        ✏️
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl text-gray-400 mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900">No patients found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new patient.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;
