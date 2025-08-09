import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Car, Plus, Sparkles, ArrowRight } from 'lucide-react';

export default function FirstTimeIntro({ dealer }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Card className="max-w-2xl mx-auto border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardContent className="p-12 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Car className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome to Aura, {dealer?.business_name}! 
            </h2>
            <p className="text-slate-600 text-lg">
              Ready to start selling vehicles on India&apos;s most trusted B2B platform?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">List Your First Vehicle</h3>
              <p className="text-sm text-slate-600">Add your inventory with AI-powered pricing</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Get AI Insights</h3>
              <p className="text-sm text-slate-600">Market trends and pricing recommendations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Start Selling</h3>
              <p className="text-sm text-slate-600">Connect with verified buyers nationwide</p>
            </div>
          </div>

          <div className="space-y-4">
            <Link to={createPageUrl('AddVehicle')}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Vehicle
              </Button>
            </Link>
            <p className="text-sm text-slate-500">
              It only takes 5 minutes to get your first listing live!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}