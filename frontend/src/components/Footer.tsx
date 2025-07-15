import React from 'react';
import { Globe, Mail, Phone, MapPin, ExternalLink, Linkedin, Twitter, Facebook, Youtube, ChevronRight, Users, Award, Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Project Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">African Fintech Index</h3>
                <p className="text-gray-400 text-sm">Multi-University Research Initiative</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              A collaborative research platform tracking financial technology development across Africa, 
              providing comprehensive insights into digital innovation, investment flows, and regulatory landscapes.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Platform</h4>
            <ul className="space-y-3">
              <li>
                <a href="#dashboard" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#analytics" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Interactive Analytics
                </a>
              </li>
              <li>
                <a href="#countries" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Country Rankings
                </a>
              </li>
              <li>
                <a href="#startups" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Fintech Directory
                </a>
              </li>
              <li>
                <a href="#news" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Latest News
                </a>
              </li>
            </ul>
          </div>

          {/* Research & Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Research</h4>
            <ul className="space-y-3">
              <li>
                <a href="#methodology" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Methodology
                </a>
              </li>
              <li>
                <a href="#reports" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Research Reports
                </a>
              </li>
              <li>
                <a href="#publications" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Academic Publications
                </a>
              </li>
              <li>
                <a href="#api" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#datasets" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Open Datasets
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & University */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm">fintech.research@wits.ac.za</p>
                  <p className="text-gray-400 text-xs">Research Inquiries</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm">+27 11 717 1000</p>
                  <p className="text-gray-400 text-xs">University Main</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm">1 Jan Smuts Avenue</p>
                  <p className="text-gray-400 text-xs">Braamfontein, Johannesburg</p>
                </div>
              </div>
            </div>

            {/* University Map Link */}
            <a
              href="https://www.google.com/maps/place/University+of+the+Witwatersrand/@-26.192877,28.030426,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>View Wits Campus</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-400">
              <p>&copy; 2024 University Partnership. All rights reserved.</p>
              <p className="text-xs">Funded by AFRETECH NETWORK</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center space-x-4 lg:space-x-6 text-sm text-gray-400">
              <a href="#privacy" className="hover:text-white transition-colors whitespace-nowrap">Privacy Policy</a>
              <a href="#terms" className="hover:text-white transition-colors whitespace-nowrap">Terms of Service</a>
              <a href="#accessibility" className="hover:text-white transition-colors whitespace-nowrap">Accessibility</a>
              <a href="#sitemap" className="hover:text-white transition-colors whitespace-nowrap">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};