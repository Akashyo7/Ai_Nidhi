import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProfileRecommendations } from '@/services/linkedinService';

interface LinkedInRecommendationsProps {
  recommendations: ProfileRecommendations;
}

const LinkedInRecommendations: React.FC<LinkedInRecommendationsProps> = ({ recommendations }) => {
  const RecommendationSection = ({ 
    title, 
    items, 
    icon, 
    color 
  }: { 
    title: string; 
    items: string[]; 
    icon: string;
    color: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-sm font-medium`}>
          {icon}
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-700 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No specific recommendations at this time.</p>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">LinkedIn Profile Recommendations</h2>
        <p className="text-gray-600">Personalized suggestions to enhance your professional presence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecommendationSection
          title="Profile Optimization"
          items={recommendations.profileOptimization}
          icon="📝"
          color="bg-blue-500"
        />
        
        <RecommendationSection
          title="Content Strategy"
          items={recommendations.contentStrategy}
          icon="📊"
          color="bg-green-500"
        />
        
        <RecommendationSection
          title="Networking Tips"
          items={recommendations.networkingTips}
          icon="🤝"
          color="bg-purple-500"
        />
        
        <RecommendationSection
          title="Skill Development"
          items={recommendations.skillDevelopment}
          icon="🎯"
          color="bg-orange-500"
        />
      </div>

      {/* Action Items Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <h3 className="text-lg font-medium mb-4 text-blue-900">Quick Action Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">This Week</h4>
            <ul className="space-y-1 text-sm">
              {recommendations.profileOptimization.slice(0, 2).map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-blue-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-purple-800 mb-2">This Month</h4>
            <ul className="space-y-1 text-sm">
              {recommendations.contentStrategy.slice(0, 2).map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-purple-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Priority Recommendations */}
      <Card className="p-6 border-yellow-200 bg-yellow-50">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-600 text-xl">⭐</span>
          <h3 className="text-lg font-medium text-yellow-900">Priority Recommendations</h3>
        </div>
        
        <div className="space-y-3">
          {[
            ...recommendations.profileOptimization.slice(0, 1),
            ...recommendations.contentStrategy.slice(0, 1),
            ...recommendations.networkingTips.slice(0, 1)
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
              <Badge className="bg-yellow-100 text-yellow-800 text-xs mt-1">
                HIGH
              </Badge>
              <span className="text-gray-700 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default LinkedInRecommendations;