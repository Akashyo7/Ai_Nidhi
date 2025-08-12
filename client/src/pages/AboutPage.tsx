import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About ANIDHI
          </h1>
          <p className="text-xl text-gray-600">
            The future of intelligent personal branding
          </p>
        </div>

        <div className="space-y-8">
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Project Vision
            </h2>
            <p className="text-gray-600 mb-4">
              ANIDHI is a self-hosted personal branding platform that creates an intelligent, 
              learning ecosystem for digital reputation management and content strategy. 
              The platform acts as a "digital twin" that learns from user interactions, 
              monitors external trends, and provides proactive guidance for personal and professional branding.
            </p>
            <p className="text-gray-600">
              Built with a multi-layered architecture, it combines internal self-awareness 
              with external market intelligence to deliver personalized content strategies 
              and project management capabilities.
            </p>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Development Journey
            </h2>
            <p className="text-gray-600 mb-4">
              This project showcases a full-scale product management approach, 
              documenting the complete journey from ideation to implementation. 
              The development follows a structured spec-driven methodology with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Comprehensive Business Requirements Document (BRD)</li>
              <li>Detailed Product Requirements Document (PRD)</li>
              <li>AI-powered prototyping and development guides</li>
              <li>Phased implementation with measurable outcomes</li>
            </ul>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Technology Stack
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>React 18 with TypeScript</li>
                  <li>Tailwind CSS for styling</li>
                  <li>Vite for build tooling</li>
                  <li>Apple/Anthropic-inspired design</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>Node.js with Express</li>
                  <li>PostgreSQL database</li>
                  <li>Huginn for automation</li>
                  <li>MCP server integration</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Student-Friendly Approach
            </h2>
            <p className="text-gray-600 mb-4">
              ANIDHI is designed with students in mind, offering:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Free and open-source foundation with Huginn</li>
              <li>GitHub Pages deployment for zero hosting costs</li>
              <li>Free tier integrations (Supabase, Vercel, Render)</li>
              <li>Maximum monthly cost of $24 with full features</li>
              <li>Educational value through hands-on development</li>
            </ul>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Links & Resources
            </h2>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/huginn/huginn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Github size={16} />
                <span>Huginn Repository</span>
                <ExternalLink size={14} />
              </a>
              <a
                href="https://kiro.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <ExternalLink size={16} />
                <span>AWS Kiro</span>
              </a>
              <a
                href="https://modelcontextprotocol.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <ExternalLink size={16} />
                <span>Model Context Protocol</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};