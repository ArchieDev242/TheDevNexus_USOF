import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFilter, FiCheckCircle, FiXCircle, FiAlertCircle, FiTrash2, FiUserX } from 'react-icons/fi';
import Header from '../components/Header';
import '../style/admin-reports-page.css';

export default function AdminReportsPage() 
{
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('pending');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [resolving, setResolving] = useState(null);

    useEffect(() => {
        if(!isAuthenticated || user?.role !== 'admin') navigate('/');
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        fetchReports();
    }, [filter, page]);

    const fetchReports = async () => {
        setLoading(true);
        setError('');

        try 
        {
            const params = new URLSearchParams();
            if(filter && filter !== 'all') params.append('status', filter);

            params.append('page', page);
            params.append('limit', 10);

            const response = await fetch(`/api/reports?${params.toString()}`, {
                credentials: 'include'
            });

            const data = await response.json();

            if(!response.ok) throw new Error(data.message || 'Failed to fetch reports');

            setReports(data.data || []);
            setTotal(data.pagination?.total || 0);

        } catch(err) 
        {
            setError(err.message);
            console.error('Error fetching reports:', err);
        } finally 
        {
            setLoading(false);
        }
    };

    const handleResolveReport = async (reportId, action) => {
        setResolving(reportId);

        try 
        {
            const response = await fetch(`/api/reports/${reportId}`, {
                method: 'PUT',
                headers: 
                {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    status: action === 'delete' ? 'resolved' : 'resolved',
                    action: action,
                    admin_notes: `Admin action: ${action}`
                })
            });

            const data = await response.json();

            if(!response.ok) throw new Error(data.message || 'Failed to resolve report');

            alert('Report resolved successfully');
            fetchReports();

        } catch(err) 
        {
            alert(`Error: ${err.message}`);
        } finally 
        {
            setResolving(null);
        }
    };

    const handleDismissReport = async (reportId) => {
        setResolving(reportId);

        try 
        {
            const response = await fetch(`/api/reports/${reportId}`, {
                method: 'PUT',
                headers: 
                {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    status: 'dismissed',
                    admin_notes: 'Dismissed by admin'
                })
            });

            const data = await response.json();

            if(!response.ok) throw new Error(data.message || 'Failed to dismiss report');

            alert('Report dismissed');
            fetchReports();

        } catch(err) 
        {
            alert(`Error: ${err.message}`);
        } finally 
        {
            setResolving(null);
        }
    };

    const getReportTypeLabel = (type) => {
        const labels = {
            'post': '📝 Пост',
            'user': '👤 Користувач',
            'comment': '💬 Коментар'
        };
        return labels[type] || type;
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': { icon: <FiAlertCircle />, class: 'badge-pending', label: 'Очікується' },
            'resolved': { icon: <FiCheckCircle />, class: 'badge-resolved', label: 'Вирішено' },
            'dismissed': { icon: <FiXCircle />, class: 'badge-dismissed', label: 'Відхилено' }
        };
        const badge = badges[status] || badges['pending'];
        return <span className = {`badge ${badge.class}`}>{badge.icon} {badge.label}</span>;
    };

    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    return (
        <>
            <Header />
            <div className = "admin-reports-page">
                <div className = "container">
                    <div className = "reports-header">
                        <div className = "header-title">
                            <button className = "btn-back" onClick = {() => navigate('/')}>
                                <FiArrowLeft /> Назад
                            </button>
                            <h1>📋 Адмін-панель: Звіти</h1>
                        </div>
                        <p className = "reports-subtitle">Управління звітами про контент</p>
                    </div>

                    <div className = "reports-filters">
                        <div className = "filter-group">
                            <FiFilter />
                            <select value = {filter} onChange = {(e) => { setFilter(e.target.value); setPage(1); }} className = "filter-select">
                                <option value = "all">Всі звіти</option>
                                <option value = "pending">Очікуються</option>
                                <option value = "resolved">Вирішені</option>
                                <option value = "dismissed">Відхилені</option>
                            </select>
                        </div>
                        <span className = "reports-count">Всього: {total}</span>
                    </div>

                    {error && (
                        <div className = "alert alert-error">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className = "reports-loading">
                            <div className = "spinner"></div>
                            <p>Завантаження звітів...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className = "no-reports">
                            <FiCheckCircle size = {64} />
                            <h3>Немає звітів</h3>
                            <p>
                                {filter === 'all' ? 'На цей момент немає жодних звітів' : `Немає ${filter === 'pending' ? 'очікуючих' : filter === 'resolved' ? 'вирішених' : 'відхилених'} звітів`}
                            </p>
                        </div>
                    ) : (
                        <div className = "reports-list">
                            {reports.map((report) => (
                                <div key = {report.id} className = "report-card">
                                    <div className = "report-header">
                                        <div className = "report-info">
                                            <h3>{getReportTypeLabel(report.reported_type)}</h3>
                                            {getStatusBadge(report.status)}
                                        </div>
                                        <div className = "report-meta">
                                            <span className = "report-date">
                                                {new Date(report.created_at).toLocaleDateString('uk-UA', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className = "report-content">
                                        <p className = "report-title">
                                            <strong>Джерело:</strong> {report.reported_content || 'N/A'}
                                        </p>
                                        <p className = "report-reason">
                                            <strong>Причина:</strong> {report.reason}
                                        </p>
                                        <p className = "report-reporter">
                                            <strong>Звіт від:</strong> {report.reporter_name || 'Anonymous'}
                                        </p>
                                    </div>

                                    {report.status === 'pending' && (
                                        <div className = "report-actions">
                                            <button
                                                className = "btn btn-delete"
                                                onClick = {() => handleResolveReport(report.id, 'delete_content')}
                                                disabled = {resolving === report.id}
                                                title = "Видалити контент"
                                            >
                                                <FiTrash2 /> Видалити контент
                                            </button>
                                            <button
                                                className = "btn btn-ban"
                                                onClick = {() => handleResolveReport(report.id, 'ban_user')}
                                                disabled = {resolving === report.id}
                                                title = "Забанити користувача"
                                            >
                                                <FiUserX /> Забанити користувача
                                            </button>
                                            <button
                                                className = "btn btn-dismiss"
                                                onClick = {() => handleDismissReport(report.id)}
                                                disabled = {resolving === report.id}
                                                title = "Відхилити звіт"
                                            >
                                                <FiXCircle /> Відхилити
                                            </button>
                                        </div>
                                    )}

                                    {report.admin_notes && (
                                        <div className = "report-notes">
                                            <strong>Примітки адміна:</strong> {report.admin_notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {total > 10 && (
                        <div className = "pagination">
                            <button
                                className = "btn-pagination"
                                onClick = {() => setPage(Math.max(1, page - 1))}
                                disabled = {page === 1}
                            >
                                ← Попередня
                            </button>
                            <span className = "pagination-info">
                                Сторінка {page} з {Math.ceil(total / 10)}
                            </span>
                            <button
                                className = "btn-pagination"
                                onClick = {() => setPage(Math.min(Math.ceil(total / 10), page + 1))}
                                disabled = {page >= Math.ceil(total / 10)}
                            >
                                Наступна →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
