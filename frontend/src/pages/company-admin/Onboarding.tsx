import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { completeOnboarding } from "../../api/companyAdmin.api";
import { OnboardingLayout } from "../../layouts/OnboardingLayout";

interface OnboardingFormState {
  companyServices: string;
  policyMethod: 'textarea' | 'upload';
  policyText: string;
  policyFile: File | null;
}

export const CompanyOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<OnboardingFormState>({
    companyServices: '',
    policyMethod: 'textarea',
    policyText: '',
    policyFile: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation logic
  const isCompanyServicesValid = formState.companyServices.trim().length > 0;
  const isPolicyValid =
    (formState.policyMethod === 'textarea' && formState.policyText.trim().length > 0) ||
    (formState.policyMethod === 'upload' && formState.policyFile !== null);
  const isFormValid = isCompanyServicesValid && isPolicyValid;

  // Handlers
  const handleCompanyServicesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormState(prev => ({
      ...prev,
      companyServices: e.target.value,
    }));
  };

  const handlePolicyMethodChange = (method: 'textarea' | 'upload') => {
    setFormState(prev => ({
      ...prev,
      policyMethod: method,
      policyText: '',
      policyFile: null,
    }));
  };

  const handlePolicyTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormState(prev => ({
      ...prev,
      policyText: e.target.value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormState(prev => ({
        ...prev,
        policyFile: file,
      }));
    } else if (file) {
      alert('Please upload a PDF file only');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('services', formState.companyServices);

      if (formState.policyMethod === 'textarea') {
        formData.append('policies_text', formState.policyText);
      } else if (formState.policyFile) {
        formData.append('policies_file', formState.policyFile);
      }

      await completeOnboarding(formData);

      // Update local storage or context if necessary to reflect first_login = false
      // For now, redirecting should be enough as the backend handles state
      // But we might need to refresh the token if claims changed?
      // Usually claims like 'first_login' are in the token. 
      // If so, we might need to re-login or refresh token.
      // For this task, we'll assume redirect is enough or next token refresh handles it.

      navigate("/company-admin");

    } catch (err: any) {
      console.error("Onboarding failed", err);
      setError(err.response?.data?.detail || "Failed to submit onboarding data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout 
      step={1} 
      totalSteps={1}
      title="Welcome to Intelligent Office Assistant"
      description="Let's set up your company profile and policies"
    >
      <div className="w-full space-y-6">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Company Services */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="company-services"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                What Services Does Your Company Offer?
                <span className="text-red-400 ml-1">*</span>
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Describe the main services and products your company provides.
              </p>
            </div>

            <textarea
              id="company-services"
              value={formState.companyServices}
              onChange={handleCompanyServicesChange}
              placeholder="e.g. We provide enterprise software solutions for businesses..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-white/10 text-white placeholder-slate-500 text-sm resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Section 2: Company Policies */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Company Policies & Handbook
                <span className="text-red-400 ml-1">*</span>
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Upload or paste your company policies, HR guidelines, and code of conduct.
              </p>
            </div>

            {/* Policy method toggle */}
            <div className="flex gap-2 p-1 bg-slate-700/30 rounded-lg w-fit border border-white/10">
              <button
                type="button"
                onClick={() => handlePolicyMethodChange('textarea')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${formState.policyMethod === 'textarea'
                    ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-300'
                  }`}
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => handlePolicyMethodChange('upload')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${formState.policyMethod === 'upload'
                    ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-300'
                  }`}
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload PDF
              </button>
            </div>

            {/* Textarea option */}
            {formState.policyMethod === 'textarea' && (
              <textarea
                id="policy-text"
                value={formState.policyText}
                onChange={handlePolicyTextChange}
                placeholder="Paste your policy content here..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-white/10 text-white placeholder-slate-500 text-sm resize-y min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            )}

            {/* File upload option */}
            {formState.policyMethod === 'upload' && (
              <label className="block">
                <div className={`relative cursor-pointer flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all py-12 ${formState.policyFile
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                  }`}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {formState.policyFile ? (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-white truncate max-w-xs">
                        {formState.policyFile.name}
                      </p>
                      <p className="text-xs text-emerald-400 mt-1">
                        Click to replace
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-200">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PDF files only
                      </p>
                    </div>
                  )}
                </div>
              </label>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up your company...
                </>
              ) : (
                <>
                  <span>Save and Continue</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
};
