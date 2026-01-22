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
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="border-b border-slate-800">
        <div className="max-w-[1440px] mx-auto px-10 py-8">
          <h1 className="text-3xl font-semibold mb-2">Create Company</h1>
          <p className="text-base text-slate-400">
            Provision a new company and configure its enabled features
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-10 py-8">
        <div className="space-y-6">
          <div className="border border-slate-800 rounded-lg p-6 bg-slate-900/40">
            <h2 className="text-lg font-semibold text-slate-50 mb-6">
              Company Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-base font-medium text-slate-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-slate-300 mb-2">
                  Company Domain
                </label>
                <input
                  type="text"
                  name="companyDomain"
                  value={formData.companyDomain}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-slate-300 mb-2">
                  Company Admin Email
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="border border-slate-800 rounded-lg p-6 bg-slate-900/40">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-50 mb-1">
                Enabled Features
              </h2>
              <p className="text-base text-slate-400">
                All features are enabled by default. These can be modified later.
              </p>
            </div>

            <div className="space-y-8">
              {featureGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                    {group.name}
                  </h3>

                  <div className="space-y-3">
                    {group.features.map(feature => (
                      <div
                        key={feature.key}
                        className="flex items-center justify-between p-3 rounded-md hover:bg-slate-800/50 cursor-pointer"
                        onClick={() => handleFeatureToggle(feature.key)}
                      >
                        <span className="text-base font-medium text-slate-300">
                          {feature.label}
                        </span>

                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleFeatureToggle(feature.key)
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                            enabledFeatures[feature.key]
                              ? 'bg-blue-600'
                              : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white ${
                              enabledFeatures[feature.key]
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
          <div className="border border-red-800 bg-red-900/30 rounded-lg p-4 mt-6 text-base">
            {error}
          </div>
        )}

        {success && (
          <div className="border border-green-800 bg-green-900/30 rounded-lg p-4 mt-6 text-base">
            <p>
              Admin Email: {success.company_admin_email}
            </p>
            <p className="mt-1">
              Temporary Password: {success.temporary_password}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateCompany}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Company"}
          </button>
        </div>
      </div>
    </div>
  )
}
