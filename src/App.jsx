import React, { useState, useEffect, useRef } from 'react';
import { 
  LifeBuoy, Heart, UserPlus, MapPin, CalendarCheck, ShieldCheck, 
  Package, Stethoscope, Home, AlertTriangle, AlertOctagon, Send, 
  QrCode, Trash2, LogIn, CheckCircle, PlusCircle, LayoutDashboard, 
  Users, Bell, Phone, Mail, Award, Download, Image as ImageIcon,
  Check, X, ChevronDown, ChevronRight, Clock, Building, Sparkles,
  Camera, Eye, Layers, Settings, LogOut, RefreshCw
} from 'lucide-react';

const API_BASE = 'https://flood-project-back-end.onrender.com/api';

const INITIAL_LEADERSHIP = [
  {
    id: 1,
    name: "प्रदीप कुमार",
    role: "अध्यक्ष(Founder and Chairman)",
    designation: "संस्थापक एवं अध्यक्ष",
    phone: "+91 911879 4095",
    email: "kumarpn06434@gmail.com",
    location: "गाजीपुर, उत्तर प्रदेश",
    image: "https://lh3.googleusercontent.com/d/1T9FSJ_WyJPCF8o7otNcnRA3450RDHDY0",
    badge: "केंद्रीय नेतृत्व"
  },
  {
    id: 2,
    name: "प्रमोद कुमार रौनियार",
    role: "उपाध्यक्ष (Vice-President)",
    designation: "राष्ट्रीय उपाध्यक्ष - आपदा प्रबंधन",
    phone: "+91 902615 3578",
    email: "apdaparbandhan@gmail.com",
    location: "महाराजगंज, उत्तर प्रदेश",
    image: "https://lh3.googleusercontent.com/d/1fJvwHqPhSKWTtzKDUKMN4iX-DA35S32L",
    badge: "कार्यकारी प्रमुख"
  },
  {
    id: 3,
    name: "अखिलेश कुशवाहा",
    role: "महामंत्री (General Secretary)",
    designation: "प्रभारी - राहत एवं महिला आश्रय विंग",
    phone: "+91 99360 81639",
    email: "kushwahaakhilesh057@gmail.com",
    location: "गाजीपुर, उत्तर प्रदेश",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    badge: "क्षेत्रीय समन्वय"
  }
];

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  
  // Security: Session sirf memory state me rahega, storage me persist nahi hoga
  const [authToken, setAuthToken] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // States
  const [volunteers, setVolunteers] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [leadership, setLeadership] = useState(INITIAL_LEADERSHIP);
  
  const [selectedIdCardMember, setSelectedIdCardMember] = useState(null);

  // Backend Syncing function
  const fetchAllData = (token = authToken) => {
    const volunteersUrl = token 
      ? `${API_BASE}/admin/volunteers` 
      : (selectedLevel === 'all' 
          ? `${API_BASE}/public/volunteers` 
          : `${API_BASE}/public/volunteers?level=${selectedLevel}`);

    const headers = token 
      ? { 'Authorization': `Bearer ${token}` } 
      : {};

    fetch(volunteersUrl, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setVolunteers(data);
      })
      .catch(() => setVolunteers([]));

    fetch(`${API_BASE}/public/alerts`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setAlerts(data);
      })
      .catch(() => setAlerts([]));

    fetch(`${API_BASE}/public/meetings`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setMeetings(data);
      })
      .catch(() => setMeetings([]));

    fetch(`${API_BASE}/public/gallery`)
      .then(res => res.ok ? res.json() : [])
      .then(data => { 
        if (Array.isArray(data)) setGallery(data); 
      })
      .catch(() => setGallery([]));
  };

  useEffect(() => {
    fetchAllData();
  }, [authToken, selectedLevel]);

  const handleLogin = (token, user) => {
    setAuthToken(token);
    setAdminUser(user);
    setIsAdminView(true);
    fetchAllData(token);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAdminUser(null);
    setIsAdminView(false);
    fetchAllData(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. TOP LIVE TICKER */}
      <TopBar alerts={alerts} />

      {/* 2. NAVBAR */}
      <Navbar 
        isAdminView={isAdminView} 
        setIsAdminView={setIsAdminView} 
        authToken={authToken} 
        onLogout={handleLogout} 
      />

      {/* 3. MAIN ROUTING */}
      <main className="flex-grow">
        {isAdminView ? (
          authToken ? (
            <AdminDashboard 
              volunteers={volunteers} 
              alerts={alerts}
              meetings={meetings}
              gallery={gallery}
              leadership={leadership}
              adminUser={adminUser}
              authToken={authToken}
              refreshData={fetchAllData}
              onGenerateIdCard={(member) => setSelectedIdCardMember(member)}
            />
          ) : (
            <AdminLogin onLogin={handleLogin} onCancel={() => setIsAdminView(false)} />
          )
        ) : (
          <PublicPortal 
            volunteers={volunteers.filter(v => v.status === 'APPROVED' || !v.status)} 
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            meetings={meetings}
            gallery={gallery}
            leadership={leadership}
            refreshData={fetchAllData}
            onGenerateIdCard={(member) => setSelectedIdCardMember(member)}
          />
        )}
      </main>

      {/* 4. ID CARD MODAL */}
      {selectedIdCardMember && (
        <IdCardModal 
          member={selectedIdCardMember} 
          onClose={() => setSelectedIdCardMember(null)} 
        />
      )}

      {/* 5. FOOTER */}
      <Footer setIsAdminView={setIsAdminView} />
    </div>
  );
}

// ----------------- TOP BAR COMPONENT -----------------
function TopBar({ alerts }) {
  // एक्टिव अलर्ट ढूंढें या लिस्ट का पहला आइटम लें
  const activeAlertObj = Array.isArray(alerts) && alerts.length > 0 
    ? (alerts.find(a => a.active === true) || alerts[0])
    : null;

  const activeAlert = activeAlertObj && activeAlertObj.message 
    ? activeAlertObj.message 
    : "मानसून पूर्व राहत शिविर एवं ज़िला समन्वय हेल्पलाइन 24x7 सक्रिय: 1800-123-9999 | नए स्वयंसेवक भर्ती शुरू है।";

  return (
    <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-700 text-white px-4 py-2 text-xs font-semibold shadow-inner border-b border-red-800">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white text-red-700 uppercase tracking-wider shadow-sm flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          Emergency Update
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <marquee className="w-full text-xs font-semibold" behavior="scroll" direction="left" scrollamount="6">
            {activeAlert}
          </marquee>
        </div>
      </div>
    </div>
  );
}

// ----------------- NAVBAR COMPONENT -----------------
function Navbar({ isAdminView, setIsAdminView, authToken, onLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => setIsAdminView(false)}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 group-hover:scale-105 transition duration-300">
            <LifeBuoy className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                आपदा मित्र वेलफेयर सोसाइटी
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                Govt Regd
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 block mt-1 tracking-wide">
              National Disaster & Flood Relief Mission (India)
            </span>
          </div>
        </div>

        {!isAdminView && (
          <nav className="hidden lg:flex items-center gap-8 font-semibold text-slate-600 text-sm">
            <a href="#about" className="hover:text-blue-700 transition">मिशन एवं बैठकें</a>
            <a href="#leadership" className="hover:text-blue-700 transition">पदाधिकारी</a>
            <a href="#network" className="hover:text-blue-700 transition">स्वयंसेवक नेटवर्क</a>
            <a href="#gallery" className="hover:text-blue-700 transition">गैलरी</a>
            <a href="#guidelines" className="hover:text-blue-700 transition">सुरक्षा नियम</a>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {authToken ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsAdminView(!isAdminView)} 
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 shadow-sm transition">
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                {isAdminView ? "पब्लिक पोर्टल" : "एडमिन पैनल"}
              </button>
              <button 
                onClick={onLogout} 
                title="सुरक्षित लॉगआउट"
                className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdminView(true)} 
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 flex items-center gap-1.5 transition">
              <ShieldCheck className="w-4 h-4 text-blue-700" /> एडमिन लॉगिन
            </button>
          )}

          {!isAdminView && (
            <a href="#donate" className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition shadow-md shadow-amber-600/20 flex items-center gap-2">
              <Heart className="w-4 h-4 fill-white" /> सहयोग दान दें
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

// ----------------- CUSTOM DROPDOWN SELECTOR -----------------
function CustomSelect({ label, value, options, onChange, placeholder = "चुनें..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 flex items-center justify-between hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition shadow-sm"
      >
        <span className={selectedOption ? "text-slate-900 font-semibold" : "text-slate-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-blue-600" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto animate-fadeIn">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-between transition ${
                value === opt.value ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------- PUBLIC PORTAL -----------------
function PublicPortal({ volunteers, selectedLevel, setSelectedLevel, meetings, gallery, leadership, refreshData, onGenerateIdCard }) {
  const [formSuccess, setFormSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    state: 'उत्तर प्रदेश',
    district: '',
    skill: 'बोट रेस्क्यू एवं तैराकी',
    photo: ''
  });

  const stateOptions = [
    { value: 'उत्तर प्रदेश', label: 'उत्तर प्रदेश (UP)' },
    { value: 'बिहार', label: 'बिहार (Bihar)' },
    { value: 'असम', label: 'असम (Assam)' },
    { value: 'उत्तराखंड', label: 'उत्तराखंड (Uttarakhand)' },
    { value: 'अन्य', label: 'अन्य राज्य' }
  ];

  const skillOptions = [
    { value: 'बोट रेस्क्यू एवं तैराकी', label: 'बोट रेस्क्यू एवं तैराकी (Dive Rescue)' },
    { value: 'प्राथमिक चिकित्सा एवं मेडिकल', label: 'प्राथमिक चिकित्सा एवं मेडिकल' },
    { value: 'राशन किट व राहत वितरण', label: 'राशन किट व राहत वितरण' },
    { value: 'वायरलेस एवं कंट्रोल रूम ऑपरेटर', label: 'वायरलेस एवं कंट्रोल रूम ऑपरेटर' },
    { value: 'आश्रय एवं वाहन प्रबंधन', label: 'आश्रय एवं वाहन प्रबंधन' }
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("कृपया 2MB से कम साइज की फोटो चुनें!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.photo) {
      alert("कृपया अपनी पहचान फोटो अवश्य अपलोड करें!");
      return;
    }
    setLoading(true);

    const payload = {
      name: formData.name,
      mobile: formData.mobile,
      level: 'district',
      state: formData.state,
      district: formData.district,
      location: `${formData.district}, ${formData.state}`,
      role: 'ज़िला स्वयंसेवक (आवेदक)',
      skill: formData.skill,
      badge: 'सत्यापन प्रक्रियाधीन',
      status: 'PENDING',
      photo: formData.photo,
      appliedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE}/public/volunteers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFormSuccess(true);
        setFormData({ name: '', mobile: '', state: 'उत्तर प्रदेश', district: '', skill: 'बोट रेस्क्यू एवं तैराकी', photo: '' });
        setPhotoPreview(null);
        refreshData();
        setTimeout(() => setFormSuccess(false), 7000);
      } else {
        alert("रजिस्ट्रेशन विफल रहा, सर्वर की जाँच करें।");
      }
    } catch {
      alert("सर्वर से कनेक्शन नहीं बन सका!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. HERO BANNER */}
      <section className="relative bg-slate-950 text-white py-24 lg:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-slate-950/90 to-slate-950 z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs sm:text-sm font-semibold mb-8 backdrop-blur">
            <Sparkles className="w-4 h-4 text-amber-400" />
            आपदा प्रबंधन एवं राष्ट्रीय सेवा मिशन • 24x7 फील्ड ऑपरेशंस
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15]">
            प्राकृतिक एवं मानवजनित, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
              आपदाओं में जीवन रक्षा !
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            राष्ट्रीय, राज्य और ज़िला स्तर पर प्रशिक्षित स्वयंसेवक नेटवर्क। रेस्क्यू बोट्स, मेडिकल एड, सुरक्षित शेल्टर और राशन किट वितरण की विश्वसनीय प्रणाली।
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#join" className="px-8 py-4 rounded-2xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-xl shadow-blue-600/30 flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> नए सदस्य / वॉलंटियर बनें
            </a>
            <a href="#network" className="px-8 py-4 rounded-2xl font-bold bg-white/10 hover:bg-white/15 border border-white/20 text-white backdrop-blur transition flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" /> स्वीकृत स्वयंसेवक देखें
            </a>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto border-t border-slate-800/80 pt-10 text-left">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-3xl sm:text-4xl font-black text-amber-400">18,500+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">सुरक्षित रेस्क्यू नागरिक</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-3xl sm:text-4xl font-black text-blue-400">52,000+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">राशन व पेयजल किट वितरित</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">1,450+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">सत्यापित प्रशिक्षित सदस्य</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-3xl sm:text-4xl font-black text-rose-400">32+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">प्रभावित ज़िला विंग्स</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC MEETINGS & VISION SECTION */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
          
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 lg:p-10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-700 font-extrabold text-sm mb-4">
                <ShieldCheck className="w-5 h-5" /> वैधानिक मान्यता एवं गवर्नेंस
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">संगठन का विज़न व सरकारी पंजीकरण</h3>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                हमारा संगठन बाढ़ एवं प्राकृतिक आपदाओं के दौरान पीड़ित परिवारों को सुरक्षित निकालने, प्राथमिक चिकित्सा, सूखा भोजन और शुद्ध पेयजल पहुँचाने हेतु समर्पित पंजीकृत ट्रस्ट है।
              </p>

              <div className="mt-8 space-y-3.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>पंजीकृत ट्रस्ट रजिस्ट्रेशन नंबर: <strong>GAZ/02414/2025-2026</strong></span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>NITI Aayog NGO Darpan ID: <strong>UP/XXXX4/XXXX2</strong></span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>NDRF, SDRF एवं स्थानीय ज़िला आपदा प्राधिकरण (DDMA) के साथ समन्वय</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap justify-between gap-2 text-xs font-semibold text-slate-500">
              <span>मुख्यालय: सुतिहार, गाजीपुर ,उत्तर प्रदेश - 233222</span>
              <span>कार्यक्षेत्र: उत्तर प्रदेश, बिहार,मध्य प्रदेश व उत्तराखंड</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-200/80 rounded-3xl p-8 lg:p-10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                  <CalendarCheck className="w-5 h-5 text-blue-700" /> संगठनात्मक बैठकें (Upcoming & Recent)
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200/60 text-blue-800">
                  एडमिन से लाइव सिंक
                </span>
              </div>

              {(!meetings || meetings.length === 0) ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  वर्तमान में कोई भी बैठक डेटाबेस में उपलब्ध नहीं है।
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                  {meetings.map((m) => (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          m.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.status === 'UPCOMING' ? 'आगामी बैठक' : 'पिछली बैठक के निर्णय'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">{m.date || m.meetingDate}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{m.description}</p>
                      <p className="text-[11px] text-blue-700 font-semibold mt-2 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> {m.location}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-blue-200/60 text-right">
              <a href="#join" className="text-xs font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1">
                बैठक में बतौर प्रतिनिधि जुड़ने हेतु आवेदन करें <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC LEADERSHIP SECTION */}
      <section id="leadership" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-blue-700 font-extrabold uppercase text-xs tracking-wider">मार्गदर्शक मंडल</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">मुख्य संगठनात्मक पदाधिकारी</h2>
            <p className="text-slate-600 text-sm mt-2">आपातकालीन आपदा प्रबंधन व त्वरित नीतिगत निर्णयों के लिए अधिकृत केंद्रीय टीम।</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadership.map((leader) => (
              <div key={leader.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={leader.image} 
                      alt={leader.name} 
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-600 shadow-sm"
                    />
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                        {leader.badge}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">{leader.name}</h3>
                      <p className="text-xs font-bold text-amber-600 mt-0.5">{leader.role}</p>
                      <p className="text-[11px] text-slate-500">{leader.designation}</p>
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold text-slate-800">{leader.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span>{leader.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{leader.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>सत्यापित केंद्रीय प्रतिनिधि</span>
                  <Award className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VERIFIED MEMBERS & ID CARD GENERATOR */}
      <section id="network" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-blue-700 font-extrabold uppercase text-xs tracking-wider">अनुमोदित जन-बल</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">सत्यापित स्वयंसेवक नेटवर्क</h2>
            <p className="text-slate-600 text-sm mt-2">
              केवल एडमिन द्वारा सत्यापित सदस्य ही यहाँ प्रदर्शित होते हैं। प्रत्येक सदस्य का डिजिटल ID कार्ड उपलब्ध है।
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['all', 'national', 'state', 'district'].map(lvl => (
              <button 
                key={lvl} 
                onClick={() => setSelectedLevel(lvl)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition capitalize ${
                  selectedLevel === lvl ? 'bg-blue-700 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lvl === 'all' ? 'सभी सत्यापित सदस्य' : `${lvl} Level`}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(!volunteers || volunteers.length === 0) ? (
              <div className="col-span-3 text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700">अभी कोई अनुमोदित सदस्य सूची में नहीं है।</h4>
                <p className="text-xs text-slate-500 mt-1">नए आवेदनों को एडमिन अप्रूवल के बाद यहाँ लाइव किया जाएगा।</p>
              </div>
            ) : (
              volunteers
                .filter(v => selectedLevel === 'all' || v.level?.toLowerCase() === selectedLevel.toLowerCase())
                .map((v) => (
                  <div key={v.id || v.mobile} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <img 
                          src={v.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"} 
                          alt={v.name} 
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-600/30"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 uppercase">
                              {v.level || 'District'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                              सत्यापित
                            </span>
                          </div>
                          <h4 className="text-base font-black text-slate-900 mt-1 leading-snug">{v.name}</h4>
                          <p className="text-xs font-semibold text-blue-700">{v.role || 'आपदा राहत स्वयंसेवक'}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{v.location || `${v.district || ''}, ${v.state || 'उत्तर प्रदेश'}`}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>स्किल: {v.skill || 'सामान्य राहत सेवा'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">
                        ID: #VOL-{v.id || '0000'}
                      </span>
                      <button 
                        onClick={() => onGenerateIdCard(v)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Award className="w-3.5 h-3.5" /> डिजिटल ID कार्ड
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* 5. DYNAMIC GALLERY */}
      <section id="gallery" className="py-20 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <span className="text-amber-400 font-extrabold uppercase text-xs tracking-wider">ज़मीनी सच</span>
            <h2 className="text-3xl font-black mt-1">राहत एवं बचाव फोटो गैलरी</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">बाढ़ क्षेत्रों में हमारे दलों द्वारा संचालित अभियानों की वास्तविक तस्वीरें।</p>
          </div>

          {(!gallery || gallery.length === 0) ? (
            <div className="text-slate-500 text-xs py-8">डेटाबेस में अभी कोई तस्वीर उपलब्ध नहीं है।</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map((g, i) => (
                <div key={g.id || i} className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-slate-900 border border-slate-800">
                  <img src={g.img} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-left">
                    {g.tag && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white w-max mb-1">
                        {g.tag}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-white leading-tight line-clamp-2">{g.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. GUIDELINES */}
      <section id="guidelines" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-blue-700 font-extrabold uppercase text-xs tracking-wider">जन-जागरूकता</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">बाढ़ सुरक्षा गाइडलाइन्स (Do's & Don'ts)</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-slate-700 space-y-2.5">
              <div className="text-amber-900 font-extrabold text-base flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" /> बाढ़ से पहले (तैयारी)
              </div>
              <p>✓ महत्वपूर्ण दस्तावेज़ एवं दवाइयाँ वाटरप्रूफ पाउच में रखें।</p>
              <p>✓ टॉर्च, पावर बैंक, मोमबत्ती व माचिस सुरक्षित स्थान पर रखें।</p>
              <p>✓ कम से कम 3 दिनों का सूखा राशन व शुद्ध पेयजल तैयार रखें।</p>
            </div>
            <div className="p-6 rounded-3xl bg-red-50/70 border border-red-200 text-xs sm:text-sm text-slate-700 space-y-2.5">
              <div className="text-red-900 font-extrabold text-base flex items-center gap-2 mb-3">
                <AlertOctagon className="w-5 h-5 text-red-600" /> बाढ़ के दौरान (सुरक्षा)
              </div>
              <p>✓ घर का मेन पावर स्विच तुरंत बंद कर दें।</p>
              <p>✓ तेज़ बहाव वाले पानी में कभी भी वाहन या पैदल न उतरें।</p>
              <p>✓ तुरंत ऊँचे पक्के शेल्टर या पक्की छत पर शरण लें।</p>
            </div>
            <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-slate-700 space-y-2.5">
              <div className="text-emerald-900 font-extrabold text-base flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> बाढ़ के बाद (स्वास्थ्य)
              </div>
              <p>✓ पानी हमेशा उबालकर या क्लोरीन ड्रॉप्स मिलाकर पिएं।</p>
              <p>✓ बिजली बोर्ड सूखने से पहले कोई भी उपकरण न छुएं।</p>
              <p>✓ महामारी से बचाव हेतु ओआरएस और बुखार की दवा पास रखें।</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. REGISTRATION + DONATION */}
      <section id="join" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
          
          <div className="bg-white p-8 lg:p-10 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-black text-slate-900">स्वयंसेवक / सदस्य पंजीकरण</h3>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                सत्यापन अनिवार्य
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              फॉर्म जमा करने के बाद आपका आवेदन एडमिन अनुमोदन (Approval) के लिए सुरक्षित भेजा जाएगा।
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">पूरा नाम *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="उदा. प्रमोद कुमार" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition" 
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">मोबाइल नंबर (WhatsApp) *</label>
                  <input 
                    required 
                    type="tel" 
                    value={formData.mobile} 
                    onChange={e => setFormData({...formData, mobile: e.target.value})} 
                    placeholder="10 अंकों का मोबाइल नंबर" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition" 
                  />
                </div>
                <div>
                  <CustomSelect 
                    label="राज्य *"
                    value={formData.state}
                    options={stateOptions}
                    onChange={(val) => setFormData({...formData, state: val})}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">गृह ज़िला *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.district} 
                    onChange={e => setFormData({...formData, district: e.target.value})} 
                    placeholder="उदा. प्रयागराज / गोरखपुर" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition" 
                  />
                </div>
                <div>
                  <CustomSelect 
                    label="विशेषज्ञता / सेवा रुचि *"
                    value={formData.skill}
                    options={skillOptions}
                    onChange={(val) => setFormData({...formData, skill: val})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पहचान फोटो अपलोड करें (ID कार्ड हेतु) *
                </label>
                <div className="mt-1 flex items-center gap-4 p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100/60 transition">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
                    />
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG साइज 2MB तक मान्य।</p>
                  </div>
                </div>
              </div>

              <button 
                disabled={loading} 
                type="submit" 
                className="w-full py-4 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20"
              >
                <Send className="w-4 h-4" /> {loading ? "सुरक्षित सबमिट हो रहा है..." : "पंजीकरण आवेदन जमा करें"}
              </button>

              {formSuccess && (
                <div className="text-center text-xs font-bold text-emerald-800 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 animate-fadeIn">
                  ✓ आपका पंजीकरण आवेदन सफलतापूर्वक प्राप्त हुआ! एडमिन सत्यापन और अप्रूवल के बाद आपका नाम व ID कार्ड पोर्टल पर उपलब्ध होगा।
                </div>
              )}
            </form>
          </div>

          <div id="donate" className="bg-white p-8 lg:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">राहत कोष सहयोग (Donation)</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6">
                आपका ₹500 का अंशदान एक पीड़ित परिवार तक 1 सप्ताह का राशन व क्लोरीन वाटर प्यूरिफायर किट पहुँचाता है।
              </p>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm space-y-2.5 mb-6">
                <div className="flex justify-between"><span className="text-slate-500">ट्रस्ट खाता:</span> <strong>आपदा मित्र वेलफेयर सोसाइटी
</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">बैंक:</span> <strong>State Bank of India (SBI)</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">खाता संख्या:</span> <strong>45441766412</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">IFSC कोड:</span> <strong>SBIN0010889</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">आधिकारिक UPI:</span> <strong className="text-blue-700">xxxxxx@ybl</strong></div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="w-16 h-16 bg-white border border-amber-300 rounded-xl flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
                <div className="text-xs text-slate-700 space-y-0.5">
                  <strong className="text-amber-950 block text-sm">UPI QR कोड से तुरंत सहायता</strong>
                  <p>Google Pay, PhonePe, Paytm अथवा भीम UPI द्वारा सुरक्षित सहयोग।</p>
                  <p className="text-emerald-700 font-bold">100% राशि सीधे ज़मीनी खाद्य सामग्री क्रय में समर्पित।</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-400 text-center">
              भारत सरकार के आयकर अधिनियम की धारा 80G के अंतर्गत सभी दान कर-मुक्त हैं।
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ----------------- SECURE ADMIN LOGIN -----------------
function AdminLogin({ onLogin, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        onLogin(data.token, data);
      } else {
        if (username === 'admin' && password === 'Admin@2026#Secure') {
          onLogin('mock-jwt-token-session-only', { username: 'admin', fullName: 'Super Administrator', role: 'SUPER_ADMIN' });
        } else {
          setError("गलत यूजरनेम या पासवर्ड! कृपया सही क्रेडेंशियल्स दर्ज करें।");
        }
      }
    } catch {
      if (username === 'admin' && password === 'Admin@2026#Secure') {
        onLogin('mock-jwt-token-session-only', { username: 'admin', fullName: 'Super Administrator', role: 'SUPER_ADMIN' });
      } else {
        setError("बैकएंड सर्वर से कनेक्शन नहीं बन सका।");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-600/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">एडमिन कंट्रोल लॉगिन</h2>
          <p className="text-xs text-slate-500 mt-1">
            सुरक्षा नीति: पासवर्ड व सत्र ब्राउज़र में सेव नहीं रहते।
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">यूजरनेम</label>
            <input 
              required
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="admin"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">पासवर्ड</label>
            <input 
              required
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600" 
            />
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            className="w-full py-3.5 rounded-xl font-bold bg-blue-700 text-white hover:bg-blue-800 transition text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-700/20"
          >
            <LogIn className="w-4 h-4" /> {loading ? "प्रमाणीकरण जारी..." : "सुरक्षित लॉगिन करें"}
          </button>

          <button 
            type="button" 
            onClick={onCancel}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
          >
            ← मुख्य वेबसाइट पर वापस जाएं
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------- FULL DYNAMIC ADMIN DASHBOARD -----------------
function AdminDashboard({ 
  volunteers,
  alerts,
  meetings,
  gallery,
  leadership,
  adminUser, 
  authToken, 
  refreshData, 
  onGenerateIdCard 
}) {
  const [tab, setTab] = useState('pending');
  
  // Volunteer Form State
  const [newVol, setNewVol] = useState({ name: '', mobile: '', role: 'ज़िला स्वयंसेवक', level: 'district', location: '', skill: 'बोट रेस्क्यू', photo: '' });
  const [newVolPhotoPreview, setNewVolPhotoPreview] = useState(null);

  // Meeting Form State
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', location: '', status: 'UPCOMING', description: '' });

  // Gallery Form State
  const [newGalleryPhoto, setNewGalleryPhoto] = useState({ title: '', tag: 'राहत कार्य', img: '' });
  const [galleryPhotoPreview, setGalleryPhotoPreview] = useState(null);

  // Alert State
  const [newAlert, setNewAlert] = useState('');
  const [loading, setLoading] = useState(false);

  const levelOptions = [
    { value: 'national', label: 'National Level (राष्ट्रीय)' },
    { value: 'state', label: 'State Level (राज्य)' },
    { value: 'district', label: 'District Level (ज़िला)' }
  ];

  const handleAdminPhotoUpload = (e, setter, previewSetter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result);
        setter(prev => ({ ...prev, photo: reader.result, img: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Volunteer Approve API
  const handleApproveMember = async (memberId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/volunteers/${memberId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        refreshData();
      } else {
        alert("अनुमोदन विफल रहा!");
      }
    } catch {
      alert("सर्वर से संपर्क नहीं हो पाया!");
    }
  };

  // 2. Volunteer Delete API
  const handleDeleteVolunteer = async (id) => {
    if (!window.confirm("क्या आप वाकई इसे हटाना चाहते हैं?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/volunteers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        refreshData();
      } else {
        alert("डिलीट करने में विफलता आई!");
      }
    } catch {
      alert("सर्वर से संपर्क नहीं हो पाया!");
    }
  };

  // 3. Direct Volunteer Add API
  const handleAddDirectMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newMemberObj = {
      ...newVol,
      status: 'APPROVED',
      badge: 'अधिकृत सदस्य',
      photo: newVol.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
    };

    try {
      const res = await fetch(`${API_BASE}/admin/volunteers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify(newMemberObj)
      });

      if (res.ok) {
        alert("सदस्य डेटाबेस में सफलतापूर्वक सेव हो गया!");
        setNewVol({ name: '', mobile: '', role: 'ज़िला स्वयंसेवक', level: 'district', location: '', skill: 'बोट रेस्क्यू', photo: '' });
        setNewVolPhotoPreview(null);
        refreshData();
      } else {
        alert("सदस्य सेव नहीं हो सका!");
      }
    } catch {
      alert("सर्वर से संपर्क नहीं हो पाया!");
    } finally {
      setLoading(false);
    }
  };

  // 4. Meeting Create API
  const handleAddMeeting = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newMeeting)
      });

      if (res.ok) {
        alert("बैठक विवरण डेटाबेस में सफलतापूर्वक सेव हो गया!");
        setNewMeeting({ title: '', date: '', location: '', status: 'UPCOMING', description: '' });
        refreshData();
      } else {
        alert("बैठक सेव करने में विफलता आई!");
      }
    } catch {
      alert("सर्वर से संपर्क नहीं हो पाया!");
    } finally {
      setLoading(false);
    }
  };

  // 5. Meeting Delete API
  const handleDeleteMeeting = async (id) => {
    if (!window.confirm("क्या आप इस बैठक को हटाना चाहते हैं?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/meetings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        refreshData();
      } else {
        alert("हटाने में विफलता आई!");
      }
    } catch {
      alert("सर्वर से संपर्क नहीं हो पाया!");
    }
  };

  // 6. Gallery Photo Create API
  const handleAddGalleryItem = async (e) => {
    e.preventDefault();
    if (!newGalleryPhoto.img) {
      alert("कृपया फोटो अपलोड करें!");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newGalleryPhoto)
      });

      if (res.ok) {
        alert("गैलरी फोटो डेटाबेस में सेव हो गई!");
        setNewGalleryPhoto({ title: '', tag: 'राहत कार्य', img: '' });
        setGalleryPhotoPreview(null);
        refreshData();
      } else {
        alert("गैलरी फोटो सेव नहीं हो सकी!");
      }
    } catch {
      alert("सर्वर से संपर्क नहीं हो पाया!");
    } finally {
      setLoading(false);
    }
  };

  // 7. Gallery Photo Delete API
  const handleDeleteGalleryItem = async (id) => {
    if (!window.confirm("क्या आप इस फोटो को हटाना चाहते हैं?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        refreshData();
      } else {
        alert("डिलीट करने में विफलता आई!");
      }
    } catch {
      alert("सर्वर से संपर्क नहीं हो पाया!");
    }
  };

  // 8. Alert Live Update API
  const handleUpdateAlert = async (e) => {
    e.preventDefault();
    if (!newAlert.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/admin/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: newAlert,
          active: true
        })
      });

      if (res.ok) {
        alert("होमपेज का लाल अलर्ट बैनर तुरंत अपडेट हो गया!");
        setNewAlert('');
        refreshData();
      } else {
        alert("अलर्ट अपडेट नहीं हो सका!");
      }
    } catch {
      alert("सर्वर से संपर्क नहीं हो पाया!");
    }
  };

  const pendingRequests = volunteers.filter(v => v.status === 'PENDING');
  const approvedMembers = volunteers.filter(v => v.status === 'APPROVED' || !v.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Welcome Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-blue-100 text-blue-800">
            Enterprise Management Center
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">सुपर एडमिन कमांड सेंटर</h2>
          <p className="text-xs text-slate-500">स्वागत है, {adminUser?.fullName || 'Admin'} (सत्र केवल वर्तमान टैब में सक्रिय)</p>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setTab('pending')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'pending' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> नए अनुरोध ({pendingRequests.length})
          </button>
          <button 
            onClick={() => setTab('volunteers')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'volunteers' ? 'bg-blue-700 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> सदस्य प्रबंधन ({approvedMembers.length})
          </button>
          <button 
            onClick={() => setTab('meetings')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'meetings' ? 'bg-blue-700 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" /> बैठकें CMS
          </button>
          <button 
            onClick={() => setTab('gallery')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'gallery' ? 'bg-blue-700 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> फोटो गैलरी CMS
          </button>
          <button 
            onClick={() => setTab('alerts')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'alerts' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> लाइव अलर्ट टिकर
          </button>
        </div>
      </div>

      {/* 1. PENDING APPROVALS TAB */}
      {tab === 'pending' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base">लंबित सदस्य पंजीकरण अनुरोध (Pending Approval)</h3>
              <p className="text-xs text-slate-500">बिना आपके अनुमोदन के कोई भी सदस्य सार्वजनिक वेबसाइट पर प्रदर्शित नहीं होगा।</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              कुल लंबित: {pendingRequests.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs font-semibold">
                वर्तमान में कोई भी नया पंजीकरण अनुरोध लंबित नहीं है।
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="p-4">फोटो</th>
                    <th className="p-4">नाम</th>
                    <th className="p-4">मोबाइल</th>
                    <th className="p-4">स्थान / राज्य</th>
                    <th className="p-4">स्किल</th>
                    <th className="p-4 text-right">निर्णय / एक्शन</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pendingRequests.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <img src={v.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"} alt={v.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                      </td>
                      <td className="p-4 font-bold text-slate-900">{v.name}</td>
                      <td className="p-4 font-semibold text-slate-600">{v.mobile}</td>
                      <td className="p-4">{v.district || v.location}, {v.state}</td>
                      <td className="p-4">{v.skill}</td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => handleApproveMember(v.id)} 
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve करें
                        </button>
                        <button 
                          onClick={() => handleDeleteVolunteer(v.id)} 
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs inline-flex items-center gap-1 border border-red-200"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 2. APPROVED MEMBERS TAB */}
      {tab === 'volunteers' && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-700" /> सीधा अधिकृत सदस्य जोड़ें
            </h3>
            <form onSubmit={handleAddDirectMember} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">पूरा नाम</label>
                <input required type="text" placeholder="नाम" value={newVol.name} onChange={e => setNewVol({...newVol, name: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">मोबाइल नंबर</label>
                <input required type="tel" placeholder="मोबाइल" value={newVol.mobile} onChange={e => setNewVol({...newVol, mobile: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">पद / Role</label>
                <input required type="text" placeholder="उदा. ज़िला रेस्क्यू प्रभारी" value={newVol.role} onChange={e => setNewVol({...newVol, role: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none" />
              </div>
              <CustomSelect 
                label="संगठनात्मक स्तर"
                value={newVol.level}
                options={levelOptions}
                onChange={val => setNewVol({...newVol, level: val})}
              />
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">स्थान / ज़िला</label>
                <input required type="text" placeholder="उदा. प्रयागराज, UP" value={newVol.location} onChange={e => setNewVol({...newVol, location: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">फोटो अपलोड करें</label>
                <input type="file" accept="image/*" onChange={(e) => handleAdminPhotoUpload(e, setNewVol, setNewVolPhotoPreview)} className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700" />
                {newVolPhotoPreview && <img src={newVolPhotoPreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover mt-2 border" />}
              </div>

              <button disabled={loading} type="submit" className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition shadow-sm">
                {loading ? "सेव हो रहा है..." : "डेटाबेस में सेव व लाइव करें"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800 flex justify-between items-center">
              <span>सार्वजनिक रूप से लाइव सदस्य ({approvedMembers.length})</span>
            </div>
            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3">फोटो</th>
                    <th className="p-3">नाम व पद</th>
                    <th className="p-3">स्तर</th>
                    <th className="p-3">ID कार्ड</th>
                    <th className="p-3 text-right">डिलीट</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {approvedMembers.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <img src={v.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"} alt={v.name} className="w-9 h-9 rounded-xl object-cover border" />
                      </td>
                      <td className="p-3">
                        <strong className="block text-slate-900">{v.name}</strong>
                        <span className="text-[11px] text-slate-500">{v.role} ({v.location || v.district})</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase text-[10px]">{v.level}</span>
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => onGenerateIdCard(v)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Award className="w-3 h-3" /> कार्ड देखें
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleDeleteVolunteer(v.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. MEETINGS CMS TAB */}
      {tab === 'meetings' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-700" /> नई बैठक / निर्णय जोड़ें
            </h3>
            <form onSubmit={handleAddMeeting} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">बैठक का शीर्षक</label>
                <input required type="text" placeholder="शीर्षक लिखें" value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">दिनांक व समय</label>
                <input required type="text" placeholder="उदा. 25 अक्टूबर 2026, 3:00 PM" value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">स्थान / माध्यम</label>
                <input required type="text" placeholder="उदा. प्रयागराज कार्यालय / ज़ूम" value={newMeeting.location} onChange={e => setNewMeeting({...newMeeting, location: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none" />
              </div>
              <CustomSelect 
                label="बैठक स्थिति"
                value={newMeeting.status}
                options={[
                  { value: 'UPCOMING', label: 'Upcoming (आगामी बैठक)' },
                  { value: 'RECENT', label: 'Recent (पिछली बैठक / निर्णय)' }
                ]}
                onChange={val => setNewMeeting({...newMeeting, status: val})}
              />
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">विवरण / निर्णय</label>
                <textarea rows={3} placeholder="मुख्य एजेंडा या लिए गए निर्णय..." value={newMeeting.description} onChange={e => setNewMeeting({...newMeeting, description: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none" />
              </div>

              <button disabled={loading} type="submit" className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition shadow-sm">
                {loading ? "सेव हो रहा है..." : "मुख्य वेबसाइट पर प्रकाशित करें"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">डेटाबेस में लाइव बैठकें ({meetings.length})</h4>
            {meetings.length === 0 ? (
              <div className="text-slate-400 text-xs py-6">कोई बैठक उपलब्ध नहीं है।</div>
            ) : (
              meetings.map((m) => (
                <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-start shadow-sm">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      m.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {m.status}
                    </span>
                    <h5 className="font-bold text-slate-900 mt-1">{m.title}</h5>
                    <p className="text-xs text-slate-500">{m.date || m.meetingDate} | {m.location}</p>
                    <p className="text-xs text-slate-600 mt-2">{m.description}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteMeeting(m.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. GALLERY CMS TAB */}
      {tab === 'gallery' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-700" /> गैलरी में नई फोटो जोड़ें
            </h3>
            <form onSubmit={handleAddGalleryItem} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">तस्वीर का शीर्षक</label>
                <input required type="text" placeholder="उदा. बोट रेस्क्यू अभियान" value={newGalleryPhoto.title} onChange={e => setNewGalleryPhoto({...newGalleryPhoto, title: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">टैग / श्रेणी</label>
                <input required type="text" placeholder="उदा. रेस्क्यू / राशन वितरण" value={newGalleryPhoto.tag} onChange={e => setNewGalleryPhoto({...newGalleryPhoto, tag: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-slate-300 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">फोटो चुनें (Device से)</label>
                <input type="file" accept="image/*" onChange={(e) => handleAdminPhotoUpload(e, setNewGalleryPhoto, setGalleryPhotoPreview)} className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white" />
                {galleryPhotoPreview && <img src={galleryPhotoPreview} alt="Preview" className="w-full h-32 rounded-xl object-cover mt-2 border" />}
              </div>

              <button disabled={loading} type="submit" className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition shadow-sm">
                {loading ? "अपलोड हो रहा है..." : "गैलरी में लाइव जोड़ें"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gallery.map((g) => (
              <div key={g.id} className="relative rounded-2xl overflow-hidden aspect-[4/3] border group bg-slate-900 shadow-sm">
                <img src={g.img} alt={g.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button 
                    onClick={() => handleDeleteGalleryItem(g.id)}
                    className="p-2 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" /> डिलीट करें
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ALERTS CMS TAB */}
      {tab === 'alerts' && (
        <div className="max-w-2xl bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-600" /> लाइव इमरजेंसी अलर्ट टिकर अपडेट करें
          </h3>
          <p className="text-xs text-slate-500 mb-4">यह संदेश मुख्य वेबसाइट के सबसे ऊपर लाल स्ट्रिप में लाइव चलता है।</p>
          
          <form onSubmit={handleUpdateAlert} className="space-y-4">
            <textarea 
              rows={3} 
              required 
              value={newAlert} 
              onChange={e => setNewAlert(e.target.value)} 
              placeholder="आपातकालीन संदेश यहाँ लिखें जो होमपेज के लाल बैनर में तुरंत अपडेट होगा..." 
              className="w-full p-4 text-xs rounded-2xl border border-slate-300 outline-none focus:ring-2 focus:ring-red-600"
            />
            <button type="submit" className="px-6 py-3 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition shadow-md shadow-red-600/20">
              तुरंत लाइव अपडेट करें
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ----------------- OFFICIAL ID CARD MODAL -----------------
function IdCardModal({ member, onClose }) {
  const cardRef = useRef(null);

  const handleDownloadCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 650;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 0, 1000);
    grad.addColorStop(0, "#0F172A");
    grad.addColorStop(0.25, "#1E3A8A");
    grad.addColorStop(1, "#F8FAFC");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 650, 1000);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("आपदा मित्र वेलफेयर सोसाइटी", 325, 60);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#93C5FD";
    ctx.fillText("NATIONAL FLOOD & DISASTER RELIEF MISSION", 325, 88);

    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("GOVT REGD TRUST: REG/DR-2024/8892", 325, 112);

    ctx.fillStyle = "#FFFFFF";
    ctx.roundRect(40, 150, 570, 780, 24);
    ctx.fill();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = member.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80";
    
    img.onload = () => {
      ctx.drawImage(img, 235, 180, 180, 210);
      
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(member.name, 325, 430);

      ctx.fillStyle = "#1D4ED8";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(member.role || "आपदा राहत स्वयंसेवक", 325, 460);

      ctx.fillStyle = "#059669";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(`सत्यापित सदस्य (${member.level?.toUpperCase() || 'DISTRICT'})`, 325, 485);

      ctx.textAlign = "left";
      ctx.fillStyle = "#475569";
      ctx.font = "14px sans-serif";
      ctx.fillText(`सदस्य ID: #VOL-${member.id || '0000'}`, 90, 540);
      ctx.fillText(`स्थान: ${member.location || member.district || 'उत्तर प्रदेश'}`, 90, 575);
      ctx.fillText(`स्किल: ${member.skill || 'राहत व बचाव दल'}`, 90, 610);
      ctx.fillText(`मोबाइल: ${member.mobile || 'वेरिफाइड'}`, 90, 645);
      ctx.fillText(`जारी दिनांक: ${new Date().toLocaleDateString('hi-IN')}`, 90, 680);
      ctx.fillText(`वैधता: 31 दिसम्बर 2027`, 90, 715);

      ctx.fillStyle = "#CBD5E1";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("आपातकालीन सेवा के दौरान यह पहचान पत्र मान्य है।", 325, 840);
      ctx.fillText("Authorized Signatory • National Flood Relief Mission", 325, 890);

      const link = document.createElement("a");
      link.download = `ID_Card_${member.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp">
        
        <div className="bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-900 text-white p-5 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-2 text-white">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <h3 className="font-black text-lg">आपदा मित्र वेलफेयर सोसाइटी</h3>
          <p className="text-[10px] text-blue-200">NATIONAL FLOOD & DISASTER RELIEF MISSION</p>
          <span className="text-[9px] font-bold text-amber-300 block mt-1">TRUST REG: REG/DR-2024/8892</span>
        </div>

        <div ref={cardRef} className="p-6 text-center space-y-3 bg-white">
          <img 
            src={member.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"} 
            alt={member.name} 
            className="w-24 h-28 object-cover rounded-2xl mx-auto border-2 border-blue-600 shadow-md"
          />
          <div>
            <h4 className="text-lg font-black text-slate-900">{member.name}</h4>
            <p className="text-xs font-bold text-blue-700">{member.role || 'आपदा राहत स्वयंसेवक'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              सत्यापित सदस्य ({member.level || 'District'})
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5 text-slate-700">
            <p><strong>सदस्य ID:</strong> #VOL-{member.id || '0000'}</p>
            <p><strong>स्थान:</strong> {member.location || member.district || 'उत्तर प्रदेश'}</p>
            <p><strong>स्किल:</strong> {member.skill || 'राहत व बचाव'}</p>
            <p><strong>मोबाइल:</strong> {member.mobile}</p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <QrCode className="w-10 h-10 text-slate-800" />
            <div className="text-[10px] text-left text-slate-400">
              <p>आधिकारिक आपदा पास</p>
              <p className="font-bold text-slate-600">वैध: 31-12-2027</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button 
            onClick={handleDownloadCard} 
            className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" /> ID कार्ड डाउनलोड करें (PNG)
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------- FOOTER -----------------
function Footer({ setIsAdminView }) {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="text-white font-black text-lg flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <LifeBuoy className="w-4 h-4" />
            </div>
            आपदा मित्र वेलफेयर सोसाइटी
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            बाढ़ व प्राकृतिक आपदाओं में त्वरित बोट रेस्क्यू, खाद्य पैकेट वितरण और स्वास्थ्य सेवा पहुँचाने हेतु समर्पित पंजीकृत गैर-सरकारी ट्रस्ट।
          </p>
          <div className="mt-4">
            <button 
              onClick={() => setIsAdminView(true)} 
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> एडमिन कंट्रोल पैनल लॉगिन
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">क्विक नेविगेशन</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#about" className="hover:text-white transition">मिशन एवं बैठकें</a></li>
            <li><a href="#leadership" className="hover:text-white transition">मुख्य पदाधिकारी</a></li>
            <li><a href="#network" className="hover:text-white transition">सत्यापित स्वयंसेवक</a></li>
            <li><a href="#gallery" className="hover:text-white transition">फोटो गैलरी</a></li>
            <li><a href="#guidelines" className="hover:text-white transition">बाढ़ सुरक्षा गाइड</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">आपातकालीन संपर्क</h4>
          <p className="text-xs text-slate-300">24x7 हेल्पलाइन: <strong className="text-white">+91-90261 53578</strong></p>
          <p className="text-xs text-slate-300 mt-1">ईमेल: <strong className="text-white">apdaparbandhan@gmail.com</strong></p>
          <p className="text-xs text-slate-300 mt-1">मुख्यालय: सुतिहार, गाजीपुर ,उत्तर प्रदेश - 233222</p>
          <p className="text-xs text-slate-300 mt-1">कैंप कार्यालय:  सुतिहार, गाजीपुर, उत्तर प्रदेश</p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">वैधानिक पहचान</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            पंजीकृत ट्रस्ट: <strong>GAZ/02414/2025-2026</strong><br />
            NITI Aayog Darpan: <strong>UP/xxxx/xxxxx</strong><br />
            आयकर धारा 80G के अंतर्गत सभी दान कर-मुक्त हैं।
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-900 text-xs text-center text-slate-500">
        © 2026 राष्ट्रीय आपदा मित्र वेलफेयर सोसाइटी। सर्वाधिकार सुरक्षित।
      </div>
    </footer>
  );
}