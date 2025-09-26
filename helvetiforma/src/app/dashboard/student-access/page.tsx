'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
  id: number;
  username: string;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  registered_date: string;
  status: string;
  enrolled_courses: any[];
  roles: string[];
}

interface Enrollment {
  id: number;
  course_id: number;
  student_id: number;
  enrollment_date: string;
  status: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  course_title: string;
  student_name: string;
  student_email: string;
}

export default function StudentAccessPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    display_name: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load students and enrollments in parallel
      const [studentsResponse, enrollmentsResponse] = await Promise.all([
        fetch('/api/tutor-students'),
        fetch('/api/tutor-enrollments')
      ]);

      const studentsResult = await studentsResponse.json();
      const enrollmentsResult = await enrollmentsResponse.json();

      if (studentsResult.success) {
        setStudents(studentsResult.data.students);
      }

      if (enrollmentsResult.success) {
        setEnrollments(enrollmentsResult.data.enrollments);
      }

    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const createWordPressUser = async (student: Student) => {
    try {
      const response = await fetch('/api/create-wordpress-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: student.username,
          email: student.email,
          password: 'temp_password_123', // Generate a secure password
          first_name: student.first_name,
          last_name: student.last_name,
          display_name: student.display_name,
          role: 'subscriber'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Utilisateur WordPress créé avec succès!');
        loadData(); // Reload data
      } else {
        // Show detailed error message and instructions
        if (result.error.includes('rest_cannot_create_user')) {
          alert(`❌ Création d'utilisateur non autorisée.\n\n📋 Instructions pour créer l'utilisateur manuellement:\n\n1. Connectez-vous à WordPress Admin\n2. Allez dans Utilisateurs > Ajouter\n3. Remplissez les informations:\n   • Nom d'utilisateur: ${student.username}\n   • Email: ${student.email}\n   • Prénom: ${student.first_name}\n   • Nom: ${student.last_name}\n   • Rôle: Abonné\n\n4. Générez un mot de passe sécurisé\n5. Envoyez les identifiants à l'étudiant`);
        } else {
          alert(`Erreur: ${result.error}`);
        }
      }
    } catch (err) {
      console.error('Failed to create WordPress user:', err);
      alert('Erreur lors de la création de l\'utilisateur WordPress');
    }
  };

  const getStudentEnrollments = (studentId: number) => {
    return enrollments.filter(enrollment => enrollment.student_id === studentId);
  };

  const getWordPressLoginUrl = (student: Student) => {
    return `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-login.php`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Accès Étudiants</h1>
              <p className="text-gray-600 mt-2">Gérez les accès WordPress pour les étudiants inscrits</p>
            </div>
            <button
              onClick={() => setShowCreateUser(!showCreateUser)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un Utilisateur
            </button>
          </div>
        </div>

        {/* WordPress Permissions Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Note sur les Permissions WordPress</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  La création automatique d'utilisateurs WordPress est restreinte par les permissions du site. 
                  Vous pouvez soit créer les utilisateurs manuellement dans WordPress Admin, soit utiliser le formulaire ci-dessous 
                  qui vous fournira les instructions détaillées.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create User Form */}
        {showCreateUser && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Créer un Utilisateur WordPress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="nom_utilisateur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom"
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => {
                  if (newUser.username && newUser.email) {
                    createWordPressUser(newUser as any);
                    setNewUser({
                      username: '',
                      email: '',
                      password: '',
                      first_name: '',
                      last_name: '',
                      display_name: ''
                    });
                    setShowCreateUser(false);
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Créer l'Utilisateur
              </button>
              <button
                onClick={() => setShowCreateUser(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Étudiants Inscrits ({students.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cours Inscrits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => {
                  const studentEnrollments = getStudentEnrollments(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {student.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={student.avatar_url}
                                alt={student.display_name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {student.display_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.display_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{student.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {studentEnrollments.length} cours
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {student.roles.map((role, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => createWordPressUser(student)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Créer Accès WP
                        </button>
                        <a
                          href={getWordPressLoginUrl(student)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900"
                        >
                          Connexion WP
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            ← Retour au Tableau de Bord
          </Link>
        </div>
      </div>
    </div>
  );
}
