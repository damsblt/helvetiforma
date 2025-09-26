'use client';

import React, { useState, useEffect } from 'react';

interface StudentDashboardData {
  is_instructor: boolean;
  enrolled_course_count: number;
  completed_course_count: number;
  active_course_count: number;
  courses_in_progress: Array<{
    ID: number;
    post_title: string;
    course_completed_percentage: string;
    post_date: string;
  }>;
}

interface StudentOrdersData {
  id: number;
  order_number: string;
  status: string;
  total: string;
  date_created: string;
  courses: Array<{
    id: number;
    title: string;
  }>;
}

interface StudentCalendarData {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  type: string;
  description: string;
}

interface StudentDashboardProps {
  studentId: number;
}

export default function StudentDashboard({ studentId }: StudentDashboardProps) {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [ordersData, setOrdersData] = useState<StudentOrdersData[]>([]);
  const [calendarData, setCalendarData] = useState<StudentCalendarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'calendar'>('overview');

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      const [dashboardRes, ordersRes, calendarRes] = await Promise.all([
        fetch(`/api/students/${studentId}/dashboard`),
        fetch(`/api/students/${studentId}/orders`),
        fetch(`/api/students/${studentId}/calendar`)
      ]);

      if (dashboardRes.ok) {
        const dashboardResult = await dashboardRes.json();
        setDashboardData(dashboardResult.data);
      }

      if (ordersRes.ok) {
        const ordersResult = await ordersRes.json();
        setOrdersData(ordersResult.data);
      }

      if (calendarRes.ok) {
        const calendarResult = await calendarRes.json();
        setCalendarData(calendarResult.data);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl font-semibold text-gray-700">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tableau de bord Étudiant</h1>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Aperçu
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Commandes ({ordersData.length})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Calendrier ({calendarData.length})
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800">Cours Inscrits</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{dashboardData.enrolled_course_count}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800">Cours Terminés</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{dashboardData.completed_course_count}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800">Cours Actifs</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{dashboardData.active_course_count}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800">Statut</h3>
              <p className="text-lg font-bold text-purple-600 mt-2">
                {dashboardData.is_instructor ? 'Formateur' : 'Étudiant'}
              </p>
            </div>
          </div>

          {/* Courses in Progress */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cours en Cours</h2>
            {dashboardData.courses_in_progress.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.courses_in_progress.map((course) => (
                  <div key={course.ID} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{course.post_title}</h3>
                        <p className="text-sm text-gray-500">Inscrit le {formatDate(course.post_date)}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Progression</div>
                        <div className="text-lg font-semibold text-blue-600">{course.course_completed_percentage}</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: course.course_completed_percentage }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucun cours en cours</p>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Historique des Commandes</h2>
          {ordersData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordersData.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.date_created)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Aucune commande trouvée</p>
          )}
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Calendrier</h2>
          {calendarData.length > 0 ? (
            <div className="space-y-4">
              {calendarData.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Type</div>
                      <div className="text-sm font-medium text-blue-600">{event.type}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {formatDate(event.start_date)} - {formatDate(event.end_date)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun événement programmé</p>
          )}
        </div>
      )}
    </div>
  );
}
