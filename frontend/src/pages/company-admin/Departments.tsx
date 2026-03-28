import React, { useEffect, useState } from 'react';
import {
    getDepartments,
    createDepartment,
    type Department,
    type CreateDepartmentRequest,
    getDepartmentMembers,
    type DepartmentMember
} from '../../api/companyAdmin.api';

export const Departments: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('isDarkMode');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [formData, setFormData] = useState<CreateDepartmentRequest>({
        department_name: '',
        description: ''
    });
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [membersOpen, setMembersOpen] = useState(false);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState('');
    const [members, setMembers] = useState<DepartmentMember[]>([]);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await getDepartments();
            setDepartments(res.data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // Listen for theme changes
    useEffect(() => {
        const handleThemeChange = () => {
            const saved = localStorage.getItem('isDarkMode');
            setIsDarkMode(saved !== null ? JSON.parse(saved) : true);
        };

        window.addEventListener('themeChange', handleThemeChange);
        return () => {
            window.removeEventListener('themeChange', handleThemeChange);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.department_name.trim()) {
            setError('Department name is required');
            return;
        }

        try {
            setSubmitting(true);
            await createDepartment(formData);
            await fetchDepartments();
            setIsModalOpen(false);
            setFormData({ department_name: '', description: '' });
            setError('');
        } catch (error) {
            console.error("Failed to create department", error);
            setError("Failed to create department. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const openDepartmentMembers = async (dept: Department) => {
        setSelectedDept(dept);
        setMembersOpen(true);
        setMembersError('');
        setMembers([]);
        setMembersLoading(true);
        try {
            const res = await getDepartmentMembers(dept.id);
            setMembers(res.data.members ?? []);
        } catch (err) {
            console.error("Failed to load department members", err);
            setMembersError("Unable to load department members.");
        } finally {
            setMembersLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Company Departments</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mt-1`}>Organize and manage your company structure</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Department
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Departments Grid */}
            {!loading && (
                <>
                    {departments.length === 0 ? (
                        <div className="text-center py-16">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-200'}`}>
                                <svg className={`w-8 h-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className={`text-lg font-semibold mt-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No departments yet</h3>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Create your first department to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {departments && departments.length > 0 ? (
                                departments.map((dept) => (
                                    <div
                                        key={dept.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => void openDepartmentMembers(dept)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                void openDepartmentMembers(dept);
                                            }
                                        }}
                                        className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
                                            isDarkMode
                                                ? 'bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10'
                                                : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md'
                                        } cursor-pointer`}
                                    >
                                        {/* Gradient accent */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                                        </div>

                                        <div className="relative z-10">
                                            {/* Icon */}
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/30 flex items-center justify-center mb-4 group-hover:from-blue-500/40 group-hover:to-blue-600/40 transition-colors">
                                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>

                                            {/* Content */}
                                            <h3 className={`text-lg font-semibold mb-2 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{dept.department_name}</h3>
                                            {dept.description && (
                                                <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{dept.description}</p>
                                            )}

                                            {/* Stats */}
                                            <div className={`flex items-center justify-between pt-4 ${isDarkMode ? 'border-t border-white/5' : 'border-t border-slate-200'}`}>
                                                <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{dept.member_count}</span> members
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        void openDepartmentMembers(dept);
                                                    }}
                                                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-200'}`}>
                                        <svg className={`w-8 h-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-lg font-semibold mt-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No departments found</h3>
                                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Departments will appear here once created</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

        {/* Members Modal */}
        {membersOpen && selectedDept && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMembersOpen(false)} />

                <div className={`relative rounded-xl shadow-2xl p-6 w-full max-w-2xl ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10' : 'bg-white border border-slate-200'}`}>
                    <button
                        onClick={() => setMembersOpen(false)}
                        className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                        type="button"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="mb-4">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {selectedDept.department_name}
                        </h3>
                        {selectedDept.description && (
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                {selectedDept.description}
                            </p>
                        )}
                    </div>

                    {membersLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
                        </div>
                    ) : membersError ? (
                        <p className="text-sm text-red-500">{membersError}</p>
                    ) : members.length === 0 ? (
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>No members in this department yet.</p>
                    ) : (
                        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-200/20">
                            {members.map((m) => (
                                <div key={m.user_id} className="py-3 flex items-start justify-between gap-4">
                                    <div>
                                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {m.name || m.email || m.user_id}
                                        </p>
                                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {m.email}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-end">
                                        {(m.roles ?? []).slice(0, 4).map((r) => (
                                            <span
                                                key={`${m.user_id}-${r}`}
                                                className={`text-[11px] px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
                                            >
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Create Department Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                
                <div className={`relative rounded-xl shadow-2xl p-8 w-full max-w-md ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10' : 'bg-white border border-slate-200'}`}>
                    {/* Close button */}
                    <button
                        onClick={() => {
                            setIsModalOpen(false);
                            setError('');
                        }}
                        className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Create Department</h2>
                        <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Add a new department to your organization</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Department Name */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Engineering"
                                    value={formData.department_name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, department_name: e.target.value });
                                        setError('');
                                    }}
                                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${isDarkMode ? 'bg-slate-700/50 border border-white/10 text-white placeholder-slate-500' : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400'}`}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Description (Optional)
                                </label>
                                <textarea
                                    placeholder="Describe the department's role..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${isDarkMode ? 'bg-slate-700/50 border border-white/10 text-white placeholder-slate-500' : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400'}`}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className={`flex items-center gap-2 p-3 rounded-lg border ${isDarkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                                    <svg className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
                                </div>
                            )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50"
                        >
                            {submitting ? 'Creating...' : 'Create Department'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setFormData({ department_name: '', description: '' });
                                setError('');
                            }}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 hover:border-white/20' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
                </div>
            </div>
        )}
        </div>
    );
};
