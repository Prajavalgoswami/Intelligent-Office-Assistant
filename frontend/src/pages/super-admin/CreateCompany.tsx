import React from "react"
import { useState } from 'react'
import { createCompany } from "../../api/superAdmin.api"

interface FeatureGroup {
  name: string
  description?: string
  features: Array<{
    key: string
    label: string
  }>
}

export default function CreateCompanyPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    companyDomain: '',
    adminEmail: '',
  })

  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({
    email: true,
    calendar: true,
    tasks: true,
    chat: true,
    documents: true,
    office_chatbot: true,
    broadcast: true,
    service_requests: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<null | {
    company_admin_email: string
    temporary_password: string
  }>(null)

  const featureGroups: FeatureGroup[] = [
    {
      name: 'Core Office Features',
      features: [
        { key: 'email', label: 'Email Assistant' },
        { key: 'calendar', label: 'Calendar & Scheduling' },
        { key: 'tasks', label: 'Task Management' },
        { key: 'chat', label: 'Internal Chat' },
        { key: 'documents', label: 'Document Management' },
        { key: 'office_chatbot', label: 'Office AI Chatbot' },
      ],
    },
    {
      name: 'Enterprise Features',
      features: [
        { key: 'broadcast', label: 'Broadcast Announcements' },
        { key: 'service_requests', label: 'Service Requests' },
      ],
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFeatureToggle = (featureKey: string) => {
    setEnabledFeatures(prev => ({
      ...prev,
      [featureKey]: !prev[featureKey],
    }))
  }

  const handleCreateCompany = async () => {
    setLoading(true)
    setError(null)

    try {
      const payload = {
        company_name: formData.companyName,
        company_domain: formData.companyDomain,
        company_admin_email: formData.adminEmail,
        enabled_features: Object.keys(enabledFeatures).filter(
          key => enabledFeatures[key]
        )

      }

      const res = await createCompany(payload)

      setSuccess({
        company_admin_email: res.company_admin_email,
        temporary_password: res.temporary_password,
      })
    } catch (err: any) {
      console.error("Axios error:", err)
      console.error("Backend response:", err?.response?.data)
      setError(JSON.stringify(err?.response?.data, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    console.log('Cancel clicked')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-[1200px] mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Create Company</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Provision a new company and configure its enabled features
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 py-8">
        <div className="space-y-6">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 bg-white dark:bg-slate-900 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-6">
              Company Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Domain
                </label>
                <input
                  type="text"
                  name="companyDomain"
                  value={formData.companyDomain}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="acme.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Admin Email
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@acme.com"
                />
              </div>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 bg-white dark:bg-slate-900 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1">
                Enabled Features
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                All features are enabled by default. These can be modified later.
              </p>
            </div>

            <div className="space-y-8">
              {featureGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                    {group.name}
                  </h3>

                  <div className="space-y-2">
                    {group.features.map(feature => (
                      <div
                        key={feature.key}
                        className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={() => handleFeatureToggle(feature.key)}
                      >
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {feature.label}
                        </span>

                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleFeatureToggle(feature.key)
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabledFeatures[feature.key]
                            ? 'bg-blue-600'
                            : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabledFeatures[feature.key]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mt-6 text-sm text-red-800 dark:text-red-200">
            <pre className="whitespace-pre-wrap font-mono text-xs">{error}</pre>
          </div>
        )}

        {success && (
          <div className="border-2 border-green-500 dark:border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-6 mt-6 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                  Company Created Successfully!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Save these credentials securely. The temporary password will only be shown once.
                </p>
              </div>
            </div>

            <div className="space-y-4 bg-white dark:bg-slate-900/50 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Admin Email
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                    {success.company_admin_email}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(success.company_admin_email)}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    title="Copy to clipboard"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Temporary Password
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg font-mono text-sm text-slate-900 dark:text-yellow-100 border-2 border-yellow-300 dark:border-yellow-700">
                    {success.temporary_password}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(success.temporary_password)}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    title="Copy to clipboard"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                The company admin will need to change this password on first login.
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateCompany}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? "Creating..." : "Create Company"}
          </button>
        </div>
      </div>
    </div>
  )
}
