"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Loader2, TrendingUp, TrendingDown, Ship, MapPin, CalendarClock, Scale, CheckCircle2, AlertCircle, Info, ThermometerSun, Wind, Waves, Anchor } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [appStarted, setAppStarted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);
  
  const [formData, setFormData] = useState({
    cargo_type: "Coal",
    quantity: 50000,
    origin: "Indonesia",
    destination: "Paradip",
    timeline: 30,
    vessel_type: "Panamax/Capesize"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'timeline' ? Number(value) : value
    }));
  };

  const loadDemo = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    setLoading(true);
    const minWait = new Promise(resolve => setTimeout(resolve, 3000));
    try {
      const resPromise = fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const [res] = await Promise.all([resPromise, minWait]);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // Recharts Data
  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Today', rate: data.forecasts.current },
      { name: 'Day 7', rate: data.forecasts['7_day'] },
      { name: 'Day 14', rate: data.forecasts['14_day'] },
      { name: 'Day 30', rate: data.forecasts['30_day'] },
    ];
  }, [data]);

  const container = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (data && resultsRef.current) {
      const cards = gsap.utils.toArray(".stagger-card");
      gsap.fromTo(cards, 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [data]);

  // Port Weather Mock Data
  const portWeather: Record<string, any> = {
    "Paradip": { temp: "28°C", condition: "Partly Cloudy", swell: "1.2m", wind: "12 kts", status: "Optimal" },
    "Haldia": { temp: "26°C", condition: "Light Rain", swell: "1.8m", wind: "15 kts", status: "Monitor Draft" },
    "Visakhapatnam": { temp: "30°C", condition: "Clear", swell: "0.9m", wind: "8 kts", status: "Optimal" },
    "Ennore": { temp: "32°C", condition: "Sunny", swell: "1.1m", wind: "10 kts", status: "Optimal" },
    "Chennai": { temp: "31°C", condition: "Scattered Clouds", swell: "1.4m", wind: "14 kts", status: "Safe to Berth" }
  };

  const weatherData = portWeather[formData.destination] || portWeather["Paradip"];

  if (!appStarted) {
    return (
      <div className="relative min-h-screen flex flex-col font-sans overflow-hidden animate-in fade-in duration-700">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          <div className="absolute inset-0 bg-[url('/bg_image.png')] bg-cover bg-center"></div>
        </div>

        {/* Top Navbar */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-6 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-white rounded-md flex items-center justify-center">
              <Anchor className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-widest text-white uppercase drop-shadow-md flex flex-col leading-none">
              DEVANS <span className="font-light text-[10px] tracking-[0.3em] text-gray-300 mt-1">FREIGHT</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-xs font-bold text-white tracking-widest uppercase">
            <a href="#" className="hover:text-blue-400 transition-colors border-b-2 border-blue-500 pb-1">Home</a>
            <a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-1">Services <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></a>
            <a href="#" className="hover:text-blue-400 transition-colors">Fleet</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Tracking</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a>
          </div>

          <div>
            <button 
              onClick={() => {
                setAppStarted(true);
                setInitialLoad(true);
                setTimeout(() => setInitialLoad(false), 3000);
              }}
              className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-md transition-colors shadow-lg"
            >
              Request a Quote
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <main className="relative z-20 flex-1 flex flex-col justify-center px-8 w-full max-w-screen-2xl mx-auto pb-32">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-[5.5rem] font-extrabold text-white leading-[1.1] drop-shadow-xl mb-6 tracking-tight uppercase">
              Intelligent Freight,<br/> Forecasted With<br/> Precision.
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed drop-shadow-md max-w-2xl font-medium">
              Optimize your vessel chartering and bulk cargo procurement from overseas to the East Coast of India using AI-driven predictive analytics and constraint matching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  setAppStarted(true);
                  setInitialLoad(true);
                  setTimeout(() => setInitialLoad(false), 3000);
                }}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold px-10 py-4 rounded-md transition-colors shadow-lg tracking-widest uppercase text-sm"
              >
                Launch Engine
              </button>
              <button 
                onClick={() => {
                  setAppStarted(true);
                  setInitialLoad(true);
                  setTimeout(() => setInitialLoad(false), 3000);
                }}
                className="bg-transparent hover:bg-white/10 text-white font-bold px-10 py-4 rounded-md transition-colors border-2 border-white tracking-widest uppercase text-sm backdrop-blur-sm"
              >
                Check Feasibility
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative animate-in fade-in duration-700" ref={container}>
      
      {/* Dark Blurred Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xl z-10"></div>
        <div className="absolute inset-0 bg-cyan-900/10 mix-blend-overlay z-10"></div>
        <div className="absolute inset-0 bg-[url('/bg_image.png')] bg-cover bg-center"></div>
      </div>
      
      {/* Top Navigation Bar - Dark Mode */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3 relative z-10 cursor-pointer" onClick={() => setAppStarted(false)}>
          <div className="w-8 h-8 bg-slate-800 rounded-md border border-slate-600 flex items-center justify-center">
            <Anchor className="text-cyan-400 w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white hover:text-cyan-400 transition-colors">DEVANS Freight</span>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-300 tracking-widest uppercase relative z-10">
          <button onClick={() => setAppStarted(false)} className="hover:text-cyan-400 transition-colors">Home</button>
          <button onClick={() => setData(null)} className="hover:text-cyan-400 transition-colors border-b-2 border-cyan-400 pb-1 text-cyan-400">Chartering</button>
          <button className="hover:text-cyan-400 transition-colors flex items-center gap-1">Services <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
          <button className="hover:text-cyan-400 transition-colors">Fleet</button>
          <button className="hover:text-cyan-400 transition-colors">Contact</button>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="hidden sm:block text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-800/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50">
            SIH 2026 Prototype
          </div>
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-cyan-400 px-4 py-2 rounded-md hover:bg-cyan-300 transition-all shadow-[0_0_10px_rgba(34,211,238,0.3)] uppercase tracking-wider"
          >
            Request a Quote
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 ml-2">N</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 min-h-[85vh]">
        
        {/* Loading Overlay */}
        {(loading || initialLoad) && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden">
            {/* Transparent Background Image */}
            <div className="absolute inset-0 bg-[url('/bg_image.png')] bg-cover bg-center opacity-40 scale-105 animate-pulse" style={{ animationDuration: '4s' }}></div>
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <img 
                src="/loading_ship.svg" 
                alt="Loading"
                className="w-full max-w-sm mb-8 animate-pulse drop-shadow-[0_0_40px_rgba(34,211,238,0.6)] opacity-100"
              />
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  <h2 className="text-2xl font-bold tracking-wide drop-shadow-lg">
                    {initialLoad ? "Initializing DEVANS Freight Engine" : "Analyzing Market & Fleet Feasibility"}
                  </h2>
                </div>
                <p className="text-cyan-200 text-sm font-medium drop-shadow-md tracking-wider">
                  {initialLoad ? "Connecting to global port registries and loading forecasting models..." : "Forecasting freight rates and validating port constraints..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {!data ? (
          <div className="max-w-6xl mx-auto mt-4">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight drop-shadow-md">Chartering Procurement System</h1>
              <p className="text-slate-300 text-sm">Enter cargo requirements to generate a market forecast, feasibility check, and optimization report.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left Panel - Form */}
              <div className="bg-[#1e293b]/90 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-700/50">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">NEW CHARTERING REQUEST FORM</h2>
                </div>
                
                <form className="p-6 flex-1 space-y-6">
                  {/* Cargo Details */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Cargo Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Commodity / Cargo Type</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Ship className="h-4 w-4 text-slate-500" />
                          </div>
                          <input type="text" name="cargo_type" value={formData.cargo_type} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-white shadow-inner transition-all hover:bg-slate-900" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Total Quantity (MT)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Scale className="h-4 w-4 text-slate-500" />
                          </div>
                          <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-white shadow-inner transition-all hover:bg-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="pt-2">
                    <h3 className="text-lg font-bold text-white mb-4">Route</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Port of Origin</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-4 w-4 text-slate-500" />
                          </div>
                          <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-white shadow-inner transition-all hover:bg-slate-900" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Destination Port (East Coast)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-4 w-4 text-slate-500" />
                          </div>
                          <select name="destination" value={formData.destination} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-white appearance-none shadow-inner transition-all hover:bg-slate-900">
                            <option value="Paradip">Paradip</option>
                            <option value="Haldia">Haldia</option>
                            <option value="Visakhapatnam">Visakhapatnam</option>
                            <option value="Ennore">Ennore</option>
                            <option value="Chennai">Chennai</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline & Vessel */}
                  <div className="pt-2">
                    <h3 className="text-lg font-bold text-white mb-4">Timeline & Vessel</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Required Timeline (Days)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarClock className="h-4 w-4 text-slate-500" />
                          </div>
                          <input type="number" name="timeline" value={formData.timeline} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-white shadow-inner transition-all hover:bg-slate-900" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Preferred Vessel Class</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Ship className="h-4 w-4 text-slate-500" />
                          </div>
                          <select name="vessel_type" value={formData.vessel_type} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-white appearance-none shadow-inner transition-all hover:bg-slate-900">
                            <option value="Any">Any Suitable</option>
                            <option value="Handysize">Handysize</option>
                            <option value="Supramax">Supramax</option>
                            <option value="Panamax">Panamax</option>
                            <option value="Capesize">Capesize</option>
                            <option value="Panamax/Capesize">Panamax/Capesize</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Right Panel - Image & Summary */}
              <div className="bg-[#1e293b]/90 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-2xl p-4 gap-4">
                <div className="w-full h-56 rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
                  <img src="/form_ship.jpg" alt="Ship" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-700/50 rounded-md"><Scale className="w-4 h-4 text-slate-300" /></div>
                       <div>
                         <p className="text-[10px] uppercase text-slate-400 font-bold">CARGO</p>
                         <p className="text-sm font-semibold text-white">{formData.cargo_type} ({formData.quantity.toLocaleString()} MT)</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-700/50 rounded-md"><MapPin className="w-4 h-4 text-slate-300" /></div>
                       <div>
                         <p className="text-[10px] uppercase text-slate-400 font-bold">ROUTE</p>
                         <p className="text-sm font-semibold text-white truncate max-w-[120px]">{formData.origin} → {formData.destination}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-700/50 rounded-md"><Ship className="w-4 h-4 text-slate-300" /></div>
                       <div>
                         <p className="text-[10px] uppercase text-slate-400 font-bold">CLASS</p>
                         <p className="text-sm font-semibold text-white truncate max-w-[120px]">{formData.vessel_type}</p>
                       </div>
                    </div>
                  </div>
                  {/* Map UI */}
                  <div className="bg-[#0f172a] rounded-lg border border-slate-700 relative overflow-hidden flex items-center justify-center p-2">
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center opacity-20 invert grayscale filter"></div>
                    <div className="w-full h-full relative z-10 flex flex-col items-center justify-center">
                       <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <path d="M 80 60 Q 60 30 30 40" stroke="#22d3ee" strokeWidth="1.5" fill="none" strokeDasharray="4 2" className="animate-pulse" />
                         <circle cx="80" cy="60" r="3" fill="#22d3ee" />
                         <circle cx="30" cy="40" r="3" fill="#22d3ee" />
                       </svg>
                       <div className="absolute top-[35%] left-[25%] text-[10px] font-bold text-cyan-400 drop-shadow-md">Paradip</div>
                       <div className="absolute top-[65%] right-[15%] text-[10px] font-bold text-white drop-shadow-md">Indonesia</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-[#1e293b]/90 backdrop-blur-md border border-slate-700 rounded-xl p-4 flex items-center justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400"></div>
              
              {/* Radar Fake UI */}
              <div className="w-16 h-16 rounded-full border border-green-500/30 bg-green-900/20 relative overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.1)] ml-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,197,94,0.2)_10%,transparent_70%)]"></div>
                <div className="w-full h-px bg-green-500/50 absolute top-1/2 -translate-y-1/2"></div>
                <div className="h-full w-px bg-green-500/50 absolute left-1/2 -translate-x-1/2"></div>
                <div className="w-1/2 h-1/2 border-r-2 border-t-2 border-green-400 absolute top-0 right-0 origin-bottom-left animate-spin" style={{ animationDuration: '3s' }}></div>
              </div>

              {/* Submit Button */}
              <div className="flex-1 flex flex-col items-center justify-center mx-8">
                <button 
                  onClick={loadDemo}
                  disabled={loading}
                  className="w-full max-w-md bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold py-3 px-6 rounded-md shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2"/> Processing...</> : "Validate & Generate Procurement Plan"}
                </button>
                <p className="text-slate-400 text-xs mt-3">{loading ? "Connecting to AI Core..." : "Ready to Process"}</p>
              </div>

              {/* Coordinates Fake UI */}
              <div className="text-right text-[10px] font-mono mr-4">
                <p className="text-slate-400 mb-1 tracking-widest uppercase">Position Coordinates</p>
                <p className="text-white">LAT <span className="text-cyan-400 ml-2">22.49089</span></p>
                <p className="text-white">LON <span className="text-cyan-400 ml-2">-LONGITUDE</span></p>
              </div>
            </div>
          </div>
        ) : (
          <div ref={resultsRef} className="space-y-6">
            
            {/* Action Bar */}
            <div className="stagger-card flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 backdrop-blur-xl p-5 rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Info className="w-5 h-5 text-blue-600" />
                <span>Showing procurement scenario for <strong className="text-blue-900">{formData.quantity.toLocaleString()} MT</strong> of <strong className="text-blue-900">{formData.cargo_type}</strong> from {formData.origin} to <strong className="text-blue-900">{formData.destination}</strong>.</span>
              </div>
              <button 
                onClick={() => {
                  setData(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold rounded-xl transition-all shadow-sm border border-gray-200 hover:shadow"
              >
                Modify Parameters
              </button>
            </div>

            {/* Dynamic Sea State & Weather Widget */}
            <div className="stagger-card bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100/50 rounded-xl flex items-center justify-center">
                  <Waves className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Live Sea State: {formData.destination}</h3>
                  <p className="text-xs text-gray-500 font-medium">Real-time port meteorological data</p>
                </div>
              </div>
              
              <div className="flex flex-wrap md:flex-nowrap items-center gap-6 md:gap-8 w-full md:w-auto">
                <div className="flex items-center gap-3">
                   <ThermometerSun className="w-6 h-6 text-amber-500" />
                   <div>
                     <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Temp</p>
                     <p className="text-sm font-bold text-gray-900">{weatherData.temp} • {weatherData.condition}</p>
                   </div>
                </div>
                <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                <div className="flex items-center gap-3">
                   <Wind className="w-6 h-6 text-sky-500" />
                   <div>
                     <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Wind</p>
                     <p className="text-sm font-bold text-gray-900">{weatherData.wind}</p>
                   </div>
                </div>
                <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                <div className="flex items-center gap-3">
                   <Waves className="w-6 h-6 text-blue-500" />
                   <div>
                     <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Swell Height</p>
                     <p className="text-sm font-bold text-gray-900">{weatherData.swell}</p>
                   </div>
                </div>
                <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                   <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                   <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">{weatherData.status}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Market Signal */}
              <div className="stagger-card col-span-1 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col relative">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${data.signal.includes('NOW') ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div className="bg-white/40 px-6 py-4 border-b border-gray-100/50">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Market Entry Signal</h3>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-5">
                    {data.signal.includes('NOW') ? (
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 drop-shadow-sm" />
                    ) : (
                      <AlertCircle className="w-10 h-10 text-amber-500 drop-shadow-sm" />
                    )}
                    <span className={`text-3xl font-extrabold tracking-tight ${data.signal.includes('NOW') ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {data.signal}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed font-medium">
                    {data.signal_reason}
                  </p>
                </div>
              </div>

              {/* Forecast Data with Recharts */}
              <div className="stagger-card col-span-1 lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="bg-white/40 px-6 py-4 border-b border-gray-100/50 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Freight Rate Forecast</h3>
                  <div className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm ${data.forecasts.trend.includes('Increasing') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {data.forecasts.trend.includes('Increasing') ? <TrendingUp className="w-4 h-4 mr-1.5"/> : <TrendingDown className="w-4 h-4 mr-1.5"/>}
                    {data.forecasts.trend}
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-48 w-full mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} domain={['auto', 'auto']} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                          itemStyle={{ color: '#1e3a8a' }}
                        />
                        <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#1e3a8a' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/60 border border-gray-100 rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Today</p>
                      <p className="text-xl font-black text-gray-900">${data.forecasts.current.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/60 border border-gray-100 rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Day 7</p>
                      <p className="text-xl font-black text-gray-900">${data.forecasts['7_day'].toFixed(2)}</p>
                    </div>
                    <div className="bg-white/60 border border-gray-100 rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Day 14</p>
                      <p className="text-xl font-black text-gray-900">${data.forecasts['14_day'].toFixed(2)}</p>
                    </div>
                    <div className="bg-white/60 border border-gray-100 rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Day 30</p>
                      <p className="text-xl font-black text-gray-900">${data.forecasts['30_day'].toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimal Decision Card */}
            {data.optimization.length > 0 && (
              <div className="stagger-card bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden flex flex-col md:flex-row transform transition-transform duration-500 hover:scale-[1.01]">
                {/* Image Side */}
                <div className="md:w-1/3 bg-[url('https://images.unsplash.com/photo-1576435728678-68ce0f6be374?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center relative min-h-[300px]">
                  <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent"></div>
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider mb-4 w-max shadow-sm border border-white/30">
                      Top Recommendation
                    </span>
                    <h2 className="text-4xl font-black mb-2 tracking-tight">{data.optimization[0]['Vessel Name']}</h2>
                    <p className="text-blue-100 flex items-center gap-2 font-medium">
                      <Ship className="w-5 h-5" /> {data.optimization[0]['Vessel Type']} Class
                    </p>
                  </div>
                </div>
                
                {/* Data Side */}
                <div className="md:w-2/3 p-10 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-8 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Recommended Action</p>
                      <p className="text-2xl font-bold text-gray-900">{data.signal.includes('NOW') ? 'Proceed to Charter' : 'Hold / Monitor Market'}</p>
                    </div>
                    <div className="mt-6 sm:mt-0 text-left sm:text-right bg-blue-50 px-6 py-4 rounded-2xl border border-blue-100 shadow-inner">
                      <p className="text-xs text-blue-600 uppercase tracking-widest font-bold mb-1">Total Effective Rate</p>
                      <p className="text-5xl font-black text-blue-900 tracking-tight">${data.optimization[0]['Effective Rate ($/MT)'].toFixed(2)} <span className="text-2xl text-blue-400 font-medium tracking-normal">/ MT</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Base Freight</p>
                      <p className="font-extrabold text-xl text-gray-800">${data.optimization[0]['Estimated Freight Cost ($)'].toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Est. Waiting Cost</p>
                      <p className="font-extrabold text-xl text-gray-800">${data.optimization[0]['Estimated Waiting Cost ($)'].toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Risk Factor Cost</p>
                      <p className="font-extrabold text-xl text-gray-800">${data.optimization[0]['Risk Cost ($)'].toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Risk Assessment</p>
                      <p className="font-extrabold text-xl text-emerald-600 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                        {data.optimization[0]['Risk Level']}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feasibility Table */}
            <div className="stagger-card bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="bg-white/40 px-6 py-5 border-b border-gray-100/50">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vessel-Port Feasibility Analysis</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-5 font-bold tracking-wider">Vessel Name</th>
                      <th className="px-6 py-5 font-bold tracking-wider">Class</th>
                      <th className="px-6 py-5 font-bold tracking-wider">Cargo Fit</th>
                      <th className="px-6 py-5 font-bold tracking-wider">Port Limits</th>
                      <th className="px-6 py-5 font-bold tracking-wider">Status</th>
                      <th className="px-6 py-5 font-bold tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.feasibility.map((vessel: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white transition-colors duration-200">
                        <td className="px-6 py-5 font-bold text-gray-900">{vessel['Vessel Name']}</td>
                        <td className="px-6 py-5 text-gray-500 font-medium">{vessel['Vessel Type']}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${vessel['CARGO FIT'] === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {vessel['CARGO FIT']}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${vessel['PORT FIT'] === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {vessel['PORT FIT']}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border ${vessel['STATUS'] === 'FEASIBLE' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-gray-100 border-gray-200 text-gray-500 shadow-sm'}`}>
                            {vessel['STATUS']}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-gray-500 text-xs font-medium">{vessel['REASON']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Subscription / Pricing Section */}
      <section id="pricing" className="bg-white border-t border-gray-100 py-24 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Transparent Pricing for Maritime Logistics</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">Scale your chartering operations with our predictive AI. Save an average of 8% on total freight costs by chartering at the optimal time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white rounded-3xl border border-gray-200 p-10 shadow-sm flex flex-col hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Basic Tracker</h3>
              <p className="text-gray-500 text-sm mb-8 flex-1 font-medium">For small charterers needing basic feasibility checks.</p>
              <div className="mb-8 pb-8 border-b border-gray-100">
                <span className="text-5xl font-black text-gray-900">Free</span>
              </div>
              <ul className="space-y-5 mb-10 text-sm text-gray-600 font-medium">
                <li className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Vessel-Port Feasibility</li>
                <li className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Up to 10 queries / month</li>
                <li className="flex items-center gap-4 opacity-40"><AlertCircle className="w-5 h-5"/> No AI Forecasting</li>
              </ul>
              <button className="w-full py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors">
                Current Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-blue-900 rounded-3xl border border-blue-800 p-10 shadow-[0_20px_50px_rgba(30,58,138,0.3)] flex flex-col relative transform md:-translate-y-6">
              <div className="absolute top-0 right-10 transform -translate-y-1/2">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">Most Popular</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Professional</h3>
              <p className="text-blue-200 text-sm mb-8 flex-1 font-medium">Full access to AI forecasting and market signals.</p>
              <div className="mb-8 pb-8 border-b border-blue-800">
                <span className="text-5xl font-black text-white">$499</span>
                <span className="text-blue-300 font-medium">/mo</span>
              </div>
              <ul className="space-y-5 mb-10 text-sm text-blue-50 font-medium">
                <li className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-amber-400"/> Everything in Basic</li>
                <li className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-amber-400"/> 30-Day Rate Forecasting</li>
                <li className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-amber-400"/> Optimal Chartering Signals</li>
                <li className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-amber-400"/> Unlimited Queries</li>
              </ul>
              <button className="w-full py-4 px-4 bg-white hover:bg-gray-50 text-blue-900 font-black rounded-xl transition-colors shadow-lg">
                Upgrade to Pro
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-3xl border border-gray-200 p-10 shadow-sm flex flex-col hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise API</h3>
              <p className="text-gray-500 text-sm mb-8 flex-1 font-medium">For hedge funds and major trading houses.</p>
              <div className="mb-8 pb-8 border-b border-gray-100">
                <span className="text-5xl font-black text-gray-900">Custom</span>
              </div>
              <ul className="space-y-5 mb-10 text-sm text-gray-600 font-medium">
                <li className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Full API Access</li>
                <li className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Custom Risk Models</li>
                <li className="flex items-center gap-4"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Dedicated Account Manager</li>
              </ul>
              <button className="w-full py-4 px-4 bg-white border-2 border-gray-200 hover:border-blue-900 hover:text-blue-900 text-gray-800 font-bold rounded-xl transition-colors mt-auto">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-50 border-t border-gray-200 text-gray-400 py-10 text-center text-sm font-medium">
        <p>© 2026 DEVANS Freight • SIH Prototype Engine</p>
      </footer>
      
    </div>
  );
}
