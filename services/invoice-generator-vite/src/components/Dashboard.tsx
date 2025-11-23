
import React from 'react';
import { 
  FileText, 
  History, 
  Settings, 
  TrendingUp, 
  Mail, 
  CheckCircle, 
  Users, 
  Download, 
  ArrowRight,
  LogOut,
  Leaf,
  Sun,
  Moon,
  Activity
} from 'lucide-react';

interface DashboardProps {
  user: { name: string; role: 'admin' | 'user'; email: string };
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onNavigate, 
  onLogout,
  isDarkMode,
  toggleTheme
}) => {
  // Mock data for the chart
  const chartData = [40, 25, 60, 45, 80, 55, 90];
  const maxVal = Math.max(...chartData);
  const points = chartData.map((val, i) => {
    const x = (i / (chartData.length - 1)) * 100;
    const y = 100 - (val / maxVal) * 100;
    return `${x},${y}`;
  }).join(' ');

  const StatCard = ({ title, children, className = "" }: { title: string, children?: React.ReactNode, className?: string }) => (
    <div className={`bg-white dark:bg-moss-900 p-6 rounded-2xl border border-moss-100 dark:border-moss-800 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-widest text-moss-400 mb-4">{title}</h3>
      {children}
    </div>
  );

  const NavTile = ({ icon: Icon, title, desc, onClick }: any) => (
    <button 
      onClick={onClick}
      className="group text-left bg-white dark:bg-moss-900 p-8 rounded-2xl border border-moss-100 dark:border-moss-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden w-full"
    >
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
        <Icon size={100} />
      </div>
      <div className="p-3 bg-moss-50 dark:bg-moss-800 rounded-xl w-fit text-moss-600 dark:text-cream-200 mb-6 group-hover:bg-moss-600 group-hover:text-cream-100 transition-colors">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-serif font-bold text-moss-900 dark:text-cream-100 mb-2 group-hover:text-moss-600 dark:group-hover:text-moss-300 transition-colors">{title}</h3>
      <p className="text-sm text-moss-600 dark:text-cream-200/60 leading-relaxed">{desc}</p>
    </button>
  );

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-moss-950 font-sans text-moss-900 dark:text-cream-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-cream-50/90 dark:bg-moss-950/90 backdrop-blur-md border-b border-moss-100 dark:border-moss-900 px-6 md:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-xl tracking-tight">Dashboard</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
           <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-moss-100 dark:hover:bg-moss-900 text-moss-600 dark:text-cream-200 transition-colors"
           >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>
          <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-moss-200 dark:border-moss-800">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold">{user.name}</p>
              <p className="text-xs text-moss-500 dark:text-cream-200/50 capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-moss-200 dark:bg-moss-800 flex items-center justify-center text-moss-700 dark:text-cream-200 font-serif font-bold shadow-inner">
              {user.name.charAt(0)}
            </div>
            <button 
              onClick={onLogout}
              className="ml-2 p-2 text-moss-400 hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12 animate-fade-in">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif mb-4 text-moss-900 dark:text-cream-50">Welcome, {user.name}</h1>
            <p className="text-lg text-moss-600 dark:text-cream-200/70 max-w-2xl font-light">
              Here's a snapshot of your workspace today. Your ecosystem is thriving.
            </p>
          </div>
          <div className="text-sm text-moss-400 dark:text-moss-600 font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </section>

        {/* Navigation Tiles */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NavTile 
            icon={FileText}
            title="Promo Invoice Builder"
            desc="Create beautiful, AI-enhanced invoices with marketing banners."
            onClick={() => onNavigate('invoices')}
          />
          <NavTile 
            icon={History}
            title="Delivery History"
            desc="Track sent documents, open rates, and client engagement."
            onClick={() => onNavigate('history')}
          />
          <NavTile 
            icon={Settings}
            title="Account Settings"
            desc="Manage your profile, branding assets, and billing preferences."
            onClick={() => onNavigate('settings')}
          />
        </section>

        {/* Performance & Stats Widgets */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Pulse */}
          <div className="lg:col-span-2 h-full">
            <StatCard title="Revenue Pulse" className="h-full flex flex-col">
              <div className="flex items-end gap-4 mb-6">
                <span className="text-4xl font-serif font-bold text-moss-900 dark:text-cream-100">$12,450</span>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium mb-1 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  <TrendingUp size={14} /> +18% this week
                </span>
              </div>
              <div className="flex-grow min-h-[200px] w-full relative">
                {/* Minimalist SVG Chart */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" className="text-moss-500" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="currentColor" className="text-moss-500" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d={`M0,100 L0,${100 - (chartData[0] / maxVal) * 100} ${points.split(' ').map((p, i) => `L${p}`).join(' ')} L100,100 Z`}
                    fill="url(#pulseGradient)"
                    className="text-moss-500 dark:text-moss-400"
                  />
                  <polyline 
                    points={points}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    className="text-moss-600 dark:text-cream-200"
                  />
                  {/* Dots on points with tooltip triggers */}
                  {chartData.map((val, i) => (
                    <g key={i} className="group">
                      <circle 
                        cx={(i / (chartData.length - 1)) * 100} 
                        cy={100 - (val / maxVal) * 100} 
                        r="1.5" 
                        className="fill-white dark:fill-moss-900 stroke-moss-600 dark:stroke-cream-200 stroke-[0.5] transition-all group-hover:r-2.5"
                      />
                      <rect 
                        x={(i / (chartData.length - 1)) * 100 - 10}
                        y={100 - (val / maxVal) * 100 - 15}
                        width="20"
                        height="10"
                        rx="2"
                        className="fill-moss-800 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </StatCard>
          </div>

          {/* Delivery Recap & Productivity */}
          <div className="space-y-6 flex flex-col">
            <StatCard title="Delivery Recap">
              <div className="space-y-6">
                <div className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                      <Mail size={18} />
                    </div>
                    <span className="text-sm font-medium">Sent Invoices</span>
                  </div>
                  <span className="text-lg font-bold">142</span>
                </div>
                <div className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
                      <CheckCircle size={18} />
                    </div>
                    <span className="text-sm font-medium">Paid</span>
                  </div>
                  <span className="text-lg font-bold">118</span>
                </div>
                <div className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg group-hover:scale-110 transition-transform">
                      <Users size={18} />
                    </div>
                    <span className="text-sm font-medium">New Clients</span>
                  </div>
                  <span className="text-lg font-bold">12</span>
                </div>
              </div>
            </StatCard>

            <div className="bg-moss-900 dark:bg-moss-800 text-cream-100 p-8 rounded-2xl shadow-lg relative overflow-hidden group cursor-pointer border border-moss-800 dark:border-moss-700 flex-grow flex flex-col justify-center" onClick={() => onNavigate('invoices')}>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-3">
                    <Activity size={16} className="text-green-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-70">Productivity</h3>
                 </div>
                 <p className="text-3xl font-serif mb-2 font-medium">You saved 4 hrs</p>
                 <p className="text-xs opacity-60 max-w-[80%]">Using automation features in the last 7 days.</p>
               </div>
               <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                  <ArrowRight size={18} />
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-moss-700/50 rounded-full blur-3xl group-hover:bg-moss-600/50 transition-colors"></div>
            </div>
          </div>
        </section>

        {/* Admin Section */}
        {user.role === 'admin' && (
          <section className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-moss-900 dark:text-cream-50">Member Activity</h2>
              <span className="px-3 py-1 bg-moss-100 dark:bg-moss-800 text-moss-700 dark:text-cream-200 text-xs font-bold uppercase rounded-full border border-moss-200 dark:border-moss-700">Admin View</span>
            </div>
            <div className="bg-white dark:bg-moss-900 rounded-2xl border border-moss-100 dark:border-moss-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-moss-50 dark:bg-moss-800 text-moss-500 dark:text-cream-200/60 font-medium uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-moss-100 dark:divide-moss-800">
                    {[
                      { name: 'Abishek', email: 'abishek@tmr.com', role: 'Admin', status: 'Active', date: 'Oct 24, 2023' },
                      { name: 'Sarah Conner', email: 'sarah@sky.net', role: 'User', status: 'Active', date: 'Nov 02, 2023' },
                      { name: 'Logan Roy', email: 'l.roy@waystar.com', role: 'User', status: 'Pending', date: 'Nov 05, 2023' },
                      { name: 'Walter White', email: 'heisenberg@chem.net', role: 'User', status: 'Inactive', date: 'Dec 10, 2023' },
                    ].map((u, i) => (
                      <tr key={i} className="hover:bg-moss-50/50 dark:hover:bg-moss-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-moss-900 dark:text-cream-100">{u.name}</div>
                              <div className="text-moss-500 dark:text-cream-200/50 text-xs">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-moss-700 dark:text-cream-200">
                          <span className="inline-flex items-center gap-1.5">
                            {u.role === 'Admin' && <Settings size={12} />}
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                            u.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                            u.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'Active' ? 'bg-green-500' : 
                              u.status === 'Pending' ? 'bg-yellow-500' :
                              'bg-gray-400'
                            }`}></span>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-moss-500 dark:text-cream-200/50 font-mono text-xs">{u.date}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-moss-400 hover:text-moss-700 dark:hover:text-cream-100 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Export Panel */}
        <section className="pt-8 border-t border-moss-100 dark:border-moss-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-moss-900 dark:text-cream-100 text-lg">Data Export</h3>
            <p className="text-sm text-moss-500 dark:text-cream-200/60">Download your full workspace report for analysis.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-moss-900 border border-moss-200 dark:border-moss-700 rounded-xl text-sm font-medium hover:bg-moss-50 dark:hover:bg-moss-800 transition-colors">
                <Download size={16} />
                CSV
             </button>
             <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-moss-900 dark:bg-cream-200 text-white dark:text-moss-900 rounded-xl text-sm font-medium hover:bg-moss-800 dark:hover:bg-cream-100 transition-colors shadow-lg shadow-moss-900/10">
                <FileText size={16} />
                Excel Report
             </button>
          </div>
        </section>
      </main>
    </div>
  );
};
