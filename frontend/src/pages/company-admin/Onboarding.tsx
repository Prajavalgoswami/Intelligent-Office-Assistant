'use client';

import React, { useState } from 'react';

interface OnboardingFormState {
  companyServices: string;
  policyMethod: 'textarea' | 'upload';
  policyText: string;
  policyFile: File | null;
}

export const CompanyOnboardingPage: React.FC = () => {
  const [formState, setFormState] = useState<OnboardingFormState>({
    companyServices: '',
    policyMethod: 'textarea',
    policyText: '',
    policyFile: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setIsSubmitting(true);
    
    // Placeholder submit handler
    console.log('Onboarding form submitted:', {
      companyServices: formState.companyServices,
      policyMethod: formState.policyMethod,
      policyContent: formState.policyMethod === 'textarea' 
        ? formState.policyText 
        : `File: ${formState.policyFile?.name}`,
    });

    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Onboarding data submitted successfully!');
    }, 1000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white mb-2">
          Company Onboarding
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Complete your company profile by providing service descriptions and policies.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Company Services */}
        <div className="space-y-4 p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="space-y-2">
            <label 
              htmlFor="company-services" 
              className="block text-sm font-semibold text-slate-900 dark:text-white"
            >
              Describe Company Services
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Provide a detailed description of the services your company offers.
            </p>
          </div>
          
          <textarea
            id="company-services"
            value={formState.companyServices}
            onChange={handleCompanyServicesChange}
            placeholder="Enter a comprehensive description of your company's services..."
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
          />
          
          <div className="text-xs text-slate-500 dark:text-slate-500">
            {formState.companyServices.length} characters
          </div>
        </div>

        {/* Section 2: Company Policies */}
        <div className="space-y-4 p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Company Policies
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Provide your company policies either by pasting text or uploading a PDF file.
            </p>
          </div>

          {/* Policy method toggle */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handlePolicyMethodChange('textarea')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formState.policyMethod === 'textarea'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Paste Text
            </button>
            <button
              type="button"
              onClick={() => handlePolicyMethodChange('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formState.policyMethod === 'upload'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Upload PDF
            </button>
          </div>

          {/* Textarea option */}
          {formState.policyMethod === 'textarea' && (
            <div className="space-y-2">
              <textarea
                id="policy-text"
                value={formState.policyText}
                onChange={handlePolicyTextChange}
                placeholder="Paste your company policies here..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
              <div className="text-xs text-slate-500 dark:text-slate-500">
                {formState.policyText.length} characters
              </div>
            </div>
          )}

          {/* File upload option */}
          {formState.policyMethod === 'upload' && (
            <div className="space-y-3">
              <label className="block">
                <div className="relative cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-8 px-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
                    <svg 
                      className="w-8 h-8 text-slate-400 dark:text-slate-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        PDF files only
                      </p>
                    </div>
                  </div>
                </div>
              </label>
              
              {formState.policyFile && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <svg 
                      className="w-5 h-5 text-red-500" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {formState.policyFile.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormState(prev => ({ ...prev, policyFile: null }))}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
            isFormValid && !isSubmitting
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
              : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Completing Onboarding...' : 'Complete Onboarding'}
        </button>
      </form>
    </div>
  );
};
