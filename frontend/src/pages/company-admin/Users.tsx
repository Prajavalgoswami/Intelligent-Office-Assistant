import React, { useEffect, useState } from 'react';
import {
    getDepartments,
    getRoles,
    createUser,
    type Department,
    type Role,
    type CreateUserRequest,
    type CreateUserResponse
} from '../../api/companyAdmin.api';

export const Users: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<CreateUserResponse | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('isDarkMode');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [formData, setFormData] = useState<CreateUserRequest>({
        username: '',
        name: '',
        email: '',
        department_id: '',
        role_ids: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, rolesRes] = await Promise.all([
                    getDepartments(),
                    getRoles()
                ]);
                setDepartments(deptRes.data);
                setRoles(rolesRes.data);
            } catch (error) {
                console.error("Failed to fetch form data", error);
            }
        };
        fetchData();
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

    const handleRoleToggle = (roleId: string) => {
        setFormData(prev => {
            const currentRoles = prev.role_ids;
            if (currentRoles.includes(roleId)) {
                return { ...prev, role_ids: currentRoles.filter(id => id !== roleId) };
            } else {
                return { ...prev, role_ids: [...currentRoles, roleId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username?.trim() || !formData.name || !formData.email || !formData.department_id || formData.role_ids.length === 0) {
            alert("Please fill in all required fields (including username)");
            return;
        }

        try {
            setSubmitting(true);
            const res = await createUser(formData);
            setSuccessData(res.data);
            setFormData({
                username: '',
                name: '',
                email: '',
                department_id: '',
                role_ids: []
            });
        } catch (error: any) {
            console.error("Failed to create user", error);
            alert(error.response?.data?.detail || "Failed to create user");
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Password copied to clipboard!");
    };

    return (
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Success Message display */}
                {successData && (
                    <div className="p-6 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-emerald-200">
                                User Created Successfully
                            </h3>
                        </div>

                        <p className="text-sm text-slate-300 mb-4">
                            Please share these credentials with the new employee securely.
                        </p>

                        {successData.temp_password && (
                            <div className="bg-slate-900/80 border border-white/10 p-4 rounded-lg flex items-center justify-between mb-4 backdrop-blur">
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Temporary Password</span>
                                    <div className="font-mono text-lg font-bold text-white mt-1">
                                        {successData.temp_password}
                                    </div>
                                </div>
                                <button
                                    onClick={() => successData.temp_password && copyToClipboard(successData.temp_password)}
                                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setSuccessData(null)}
                            className="text-sm font-medium text-emerald-300 hover:text-emerald-200 transition-colors"
                        >
                            ← Add another user
                        </button>
                    </div>
                )}

                {!successData && (
                    <div className={`rounded-xl shadow-lg overflow-hidden border ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-white/10' 
                        : 'bg-white border-slate-200'
                    }`}>
                        <form onSubmit={handleSubmit} className={`p-8 space-y-6 ${isDarkMode ? '' : ''}`}>
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Username <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                                    placeholder="e.g. jane_doe"
                                    minLength={3}
                                    maxLength={32}
                                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                      isDarkMode
                                        ? 'bg-slate-700/50 border border-white/10 text-white placeholder-slate-500'
                                        : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 hover:bg-slate-50'
                                    }`}
                                />
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                    3–32 characters: lowercase letters, digits, and underscores only. Used to sign in.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Full Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Jane Doe"
                                        className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                          isDarkMode
                                            ? 'bg-slate-700/50 border border-white/10 text-white placeholder-slate-500'
                                            : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 hover:bg-slate-50'
                                        }`}
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Email Address <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="e.g. jane@company.com"
                                        className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                          isDarkMode
                                            ? 'bg-slate-700/50 border border-white/10 text-white placeholder-slate-500'
                                            : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 hover:bg-slate-50'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Department Selection */}
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Department <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.department_id}
                                        onChange={e => setFormData(prev => ({ ...prev, department_id: e.target.value }))}
                                        className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all ${
                                          isDarkMode
                                            ? 'bg-slate-700/50 border border-white/10 text-white'
                                            : 'bg-slate-100 border border-slate-300 text-slate-900 hover:bg-slate-50'
                                        }`}
                                    >
                                        <option value="" className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>Select a department...</option>
                                        {departments.map(dept => (
                                            <option key={dept.id || dept._id} value={dept.id || dept._id} className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>
                                                {dept.department_name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className={`absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {departments.length === 0 && (
                                    <p className="text-xs text-amber-400 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        No departments found. Please create one first.
                                    </p>
                                )}
                            </div>

                            {/* Roles Selection */}
                            <div className="space-y-3">
                                <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Assign Roles <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {roles.map(role => (
                                        <div
                                            key={role._id}
                                            onClick={() => handleRoleToggle(role._id)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all group ${
                                              formData.role_ids.includes(role._id)
                                                ? isDarkMode
                                                  ? 'border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/50'
                                                  : 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : isDarkMode
                                                  ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                                  : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                                                  formData.role_ids.includes(role._id)
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : isDarkMode
                                                      ? 'border-white/20 group-hover:border-white/40'
                                                      : 'border-slate-400 group-hover:border-slate-500'
                                                }`}>
                                                    {formData.role_ids.includes(role._id) && (
                                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                        {role.role_name}
                                                    </div>
                                                    {role.description && (
                                                        <p className={`text-xs mt-1 line-clamp-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            {role.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {roles.length === 0 && (
                                    <p className="text-xs text-amber-400 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        No roles found. Please create one first.
                                    </p>
                                )}
                            </div>

                            {/* Submit Action */}
                            <div className="pt-6 flex justify-end gap-3">
                                <button
                                    type="reset"
                                    className={`px-6 py-3 font-medium rounded-lg transition-all ${
                                      isDarkMode
                                        ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 hover:border-white/20'
                                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400'
                                    }`}
                                >
                                    Clear
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || departments.length === 0 || roles.length === 0}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50 flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Create User
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
    );
};
