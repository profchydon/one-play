import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArrowRight, Trophy, Users, BarChart3, ShieldCheck } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <Link href="/">
                <img src="/logo.png" alt="OneVOnePlay Logo" className="h-[75px] w-auto object-contain" />
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-brand-navy hover:text-brand-green transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-brand-green text-white font-semibold shadow-sm hover:bg-brand-greenDark hover:shadow-md transition-all"
                  >
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  {/* <Link
                    href="/login"
                    className="text-sm font-medium text-brand-navy hover:text-brand-green transition-colors hidden sm:block"
                  >
                    Sign in
                  </Link> */}
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-brand-navy text-white font-semibold shadow-sm hover:bg-brand-navyLight hover:shadow-md transition-all"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-greenLight via-transparent to-transparent opacity-60"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green/10 text-brand-greenDark font-medium text-sm mb-8">
                <span className="flex h-2 w-2 rounded-full bg-brand-green"></span>
                The ultimate platform for brand-sponsored esports
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-brand-navy tracking-tight mb-8 leading-tight text-balance">
                Engage gamers with <span className="text-brand-green">branded tournaments</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
                Launch fully white-labeled esports campaigns in under 30 minutes. Capture leads, build communities, and elevate your brand in the gaming space.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href={session ? "/dashboard" : "/login"}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-green text-white font-bold text-lg shadow-lg shadow-brand-green/30 hover:bg-brand-greenDark hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Create Your Campaign
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-brand-navy border border-gray-200 font-bold text-lg hover:bg-gray-50 transition-all"
                >
                  View Features
                </Link>
              </div>
            </div>
            
            {/* Dashboard Preview Mockup */}
            <div className="mt-20 mx-auto max-w-5xl">
              <div className="relative rounded-2xl bg-brand-navy p-2 shadow-2xl overflow-hidden border border-brand-navyLight">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-green to-transparent opacity-50"></div>
                <div className="rounded-xl overflow-hidden bg-white aspect-video flex items-center justify-center relative border border-gray-100">
                  {/* Mockup UI Elements */}
                  <div className="absolute top-0 left-0 w-64 h-full bg-gray-50 border-r border-gray-100 p-6 flex flex-col gap-4">
                    <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-8"></div>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-6 bg-gray-100 rounded-md w-full"></div>
                    ))}
                  </div>
                  <div className="ml-64 w-full h-full p-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-10 bg-gray-200 rounded-md w-1/3"></div>
                      <div className="h-10 bg-brand-green/20 rounded-md w-32"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-8 bg-gray-300 rounded w-1/3 mt-auto"></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl mt-2 p-6">
                      <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-medium">Tournament Bracket</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">Everything you need to run a successful campaign</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our platform handles the complex esports infrastructure so you can focus on your brand and engaging your audience.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<Trophy className="w-6 h-6 text-brand-green" />}
                title="Automated Brackets"
                description="Single and double elimination brackets generated automatically when registration closes."
              />
              <FeatureCard 
                icon={<Users className="w-6 h-6 text-brand-green" />}
                title="Lead Generation"
                description="Capture gamer data directly through beautiful, white-labeled registration forms."
              />
              <FeatureCard 
                icon={<BarChart3 className="w-6 h-6 text-brand-green" />}
                title="Campaign Analytics"
                description="Track registrations, match completion rates, and demographic data in real-time."
              />
              <FeatureCard 
                icon={<ShieldCheck className="w-6 h-6 text-brand-green" />}
                title="Self-Serve Management"
                description="Match reporting, opponent confirmation, and dispute resolution handled effortlessly."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OneVOnePlay Logo" className="h-[75px] w-auto object-contain" />
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} OneVOnePlay Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-green/30 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-green/20 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-brand-navy mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
