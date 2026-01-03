import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle2, Zap } from "lucide-react";

export default function LandingPage() {
  const handleGoogleLogin = () => {
    window.location.href = "/auth/google";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 fixed w-full bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">G</span>
            </div>
            <span className="font-display font-bold text-xl text-slate-900">GrowthOpt</span>
          </div>
          <Button onClick={handleGoogleLogin} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg shadow-slate-900/10">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            New: AI-Powered Profile Optimization
          </div>
          
          <h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.1] text-slate-900 tracking-tight">
            Turn Search Traffic Into <span className="text-blue-600 relative">
              Customers
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed text-balance">
            Stop guessing with your Google Business Profile. Get a clear optimization score, actionable insights, and AI recommendations to rank higher and convert more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" onClick={handleGoogleLogin} className="w-full sm:w-auto text-lg h-14 px-8 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>
            <Button variant="ghost" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 text-slate-600 hover:text-slate-900">
              See How It Works <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-display font-bold text-xl mb-3 text-slate-900">Optimization Score</h3>
            <p className="text-slate-600 leading-relaxed">
              Get a definitive 0-100 score for your profile health based on Google's ranking factors.
            </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-display font-bold text-xl mb-3 text-slate-900">Actionable Checklist</h3>
            <p className="text-slate-600 leading-relaxed">
              No more confusion. We generate a prioritized weekly checklist to improve your ranking.
            </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="font-display font-bold text-xl mb-3 text-slate-900">AI Recommendations</h3>
            <p className="text-slate-600 leading-relaxed">
              Leverage AI to write posts, respond to reviews, and optimize your business description.
            </p>
          </div>
        </div>

        {/* Unsplash Image with Overlay */}
        <div className="mt-24 relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 border border-slate-200">
          {/* Dashboard mockup scenic placeholder */}
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
            alt="Dashboard Analytics" 
            className="w-full h-auto opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end justify-center pb-12">
            <p className="text-white font-display font-bold text-2xl md:text-3xl text-center max-w-2xl px-4">
              "The simplest way to manage and grow your local presence without being an SEO expert."
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center text-slate-500 text-sm">
        <p>© 2024 GrowthOpt. All rights reserved.</p>
      </footer>
    </div>
  );
}
