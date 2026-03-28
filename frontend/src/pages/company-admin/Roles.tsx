import React, { useEffect, useState } from 'react';
import {
    getRoles,
    createRole,
    type Role,
    type CreateRoleRequest
} from '../../api/companyAdmin.api';

export const Roles: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('isDarkMode');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [formData, setFormData] = useState<CreateRoleRequest>({
        role_name: '',
        description: '',
        priority: 'LOW'
    });

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await getRoles();
            setRoles(res.data);
        } catch (error) {
            console.error("Failed to fetch roles", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // Listen for theme changes
    useEffect(() => {
    const handleThemeChange = () => {
        const saved = localStorage.getItem('isDarkMode');
        setIsDarkMode(saved ? JSON.parse(saved) : true);
    };

    window.addEventListener('themeChange', handleThemeChange);

    return () => window.removeEventListener('themeChange', handleThemeChange);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.role_name.trim()) {
            setError('Role name is required');
            return;
        }

        try {
            setSubmitting(true);
            await createRole(formData);
            await fetchRoles();
            setIsModalOpen(false);
            setFormData({ role_name: '', description: '', priority: 'LOW' });
            setError('');
        } catch (error) {
            console.error("Failed to create role", error);
            setError("Failed to create role. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'from-red-500/30 to-red-600/30 border-red-500/30 text-red-400';
            case 'MEDIUM': return 'from-amber-500/30 to-amber-600/30 border-amber-500/30 text-amber-400';
            case 'LOW': return 'from-blue-500/30 to-blue-600/30 border-blue-500/30 text-blue-400';
            default: return 'from-slate-500/30 to-slate-600/30 border-slate-500/30 text-slate-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Role Management</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mt-1`}>Define roles and permissions for your team</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Role
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            )}

                {/* Roles Grid */}
                {!loading && (
                    <>
                        {roles.length === 0 ? (
                            <div className="text-center py-16">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-200'}`}>
                                    <svg className={`w-8 h-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                                    </svg>
                                </div>
                                <h3 className={`text-lg font-semibold mt-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No roles yet</h3>
                                <p className="text-slate-400 text-sm mt-1">Create your first role to get started</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {roles.map((role) => (
                                    <div
                                        key={role._id}
                                        className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 ${
    isDarkMode
        ? 'bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-white/10 hover:border-white/20'
        : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm'
}`}
                                    >
                                        {/* Gradient accent */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className={`absolute inset-0 bg-gradient-to-br ${getPriorityColor(role.priority)}`} />
                                        </div>

                                        <div className="relative z-10">
                                            {/* Priority badge */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getPriorityColor(role.priority)} border`}>
                                                    {role.priority} PRIORITY
                                                </div>
                                                {role.is_system_role && (
                                                    <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                                                        System
                                                    </span>
                                                )}
                                            </div>

                                            {/* Icon */}
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 flex items-center justify-center mb-4 group-hover:from-emerald-500/40 group-hover:to-emerald-600/40 transition-colors">
                                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                                                </svg>
                                            </div>

                                            {/* Content */}
                                            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{role.role_name}</h3>
                                            {role.description && (
                                                <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{role.description}</p>
                                            )}

                                            {/* Permissions */}
                                            {role.permissions && role.permissions.length > 0 && (
                                                <div className="pt-4 border-t border-white/5">
                                                    <div className="text-xs text-slate-400 mb-2 font-medium">
                                                        {role.permissions.length} permissions
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.permissions.slice(0, 2).map((perm, idx) => (
                                                            <span key={idx} className={`text-xs px-2 py-1 rounded border ${
    isDarkMode
        ? 'bg-white/5 text-slate-300 border-white/5'
        : 'bg-slate-100 text-slate-700 border-slate-200'
}`}>
                                                                {perm}
                                                            </span>
                                                        ))}
                                                        {role.permissions.length > 2 && (
                                                            <span className="text-xs px-2 py-1 text-slate-400">
                                                                +{role.permissions.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

            {/* Create Role Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/10 shadow-2xl p-8 w-full max-w-md">
                        {/* Close button */}
                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                setError('');
                            }}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Create New Role</h2>
                        <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Define a new role for your team members</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Role Name */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Role Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Senior Manager"
                                    value={formData.role_name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, role_name: e.target.value });
                                        setError('');
                                    }}
                                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                                        isDarkMode
                                            ? 'bg-slate-700/50 border border-white/10 text-white placeholder-slate-500'
                                            : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400'
                                    }`}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Description (Optional)
                                </label>
                                <textarea
                                    placeholder="Describe the role's responsibilities..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none ${
                                        isDarkMode
                                            ? 'bg-slate-700/50 border border-white/10 text-white placeholder-slate-500'
                                            : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400'
                                    }`}
                                />
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-3">
                                    Priority Level
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: p })}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                                                formData.priority === p
                                                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-red-400">{error}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50"
                                >
                                    {submitting ? 'Creating...' : 'Create Role'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setFormData({ role_name: '', description: '', priority: 'LOW' });
                                        setError('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-medium border border-white/10 hover:border-white/20 transition-all duration-200"
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
