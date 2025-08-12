import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { linkedinService, LinkedInProfileInput } from '@/services/linkedinService';

interface LinkedInProfileFormProps {
  onAnalysisComplete?: (analysis: any) => void;
}

const LinkedInProfileForm: React.FC<LinkedInProfileFormProps> = ({ onAnalysisComplete }) => {
  const [formData, setFormData] = useState<LinkedInProfileInput>({
    headline: '',
    summary: '',
    currentPosition: '',
    company: '',
    industry: '',
    location: '',
    skills: [],
    experience: [],
    education: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof LinkedInProfileInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        duration: '',
        description: ''
      }]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        school: '',
        degree: '',
        field: ''
      }]
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const analysis = await linkedinService.analyzeProfile(formData);
      onAnalysisComplete?.(analysis);
    } catch (err) {
      setError('Failed to analyze LinkedIn profile. Please try again.');
      console.error('LinkedIn analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">LinkedIn Profile Analysis</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <Input
            label="Professional Headline"
            value={formData.headline}
            onChange={(e) => handleInputChange('headline', e.target.value)}
            placeholder="e.g., Senior Software Engineer | Full-Stack Developer"
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Industry"
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              placeholder="e.g., Technology, Healthcare, Finance"
              required
            />
            
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., San Francisco, CA"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Current Position"
              value={formData.currentPosition}
              onChange={(e) => handleInputChange('currentPosition', e.target.value)}
              placeholder="e.g., Senior Software Engineer"
            />
            
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="e.g., Google, Microsoft"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Brief description of your professional background and expertise..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Skills</h3>
          
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add a skill"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Experience</h3>
            <Button type="button" onClick={addExperience} variant="outline" size="sm">
              Add Experience
            </Button>
          </div>
          
          {formData.experience.map((exp, index) => (
            <Card key={index} className="p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Experience {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeExperience(index)}
                  variant="outline"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Job Title"
                  value={exp.title}
                  onChange={(e) => updateExperience(index, 'title', e.target.value)}
                  placeholder="e.g., Software Engineer"
                />
                
                <Input
                  label="Company"
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  placeholder="e.g., Google"
                />
              </div>
              
              <Input
                label="Duration"
                value={exp.duration}
                onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                placeholder="e.g., Jan 2020 - Present"
                className="mb-4"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  placeholder="Brief description of your role and achievements..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Education */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Education</h3>
            <Button type="button" onClick={addEducation} variant="outline" size="sm">
              Add Education
            </Button>
          </div>
          
          {formData.education.map((edu, index) => (
            <Card key={index} className="p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Education {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeEducation(index)}
                  variant="outline"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="School"
                  value={edu.school}
                  onChange={(e) => updateEducation(index, 'school', e.target.value)}
                  placeholder="e.g., Stanford University"
                />
                
                <Input
                  label="Degree"
                  value={edu.degree || ''}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  placeholder="e.g., Bachelor's"
                />
                
                <Input
                  label="Field of Study"
                  value={edu.field || ''}
                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                  placeholder="e.g., Computer Science"
                />
              </div>
            </Card>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !formData.headline || !formData.industry}
          className="w-full"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Analyzing Profile...
            </>
          ) : (
            'Analyze LinkedIn Profile'
          )}
        </Button>
      </form>
    </Card>
  );
};

export default LinkedInProfileForm;