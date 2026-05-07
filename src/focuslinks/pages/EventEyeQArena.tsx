'use client';
import { useState } from 'react';
import { Link } from '../../context/NavigationContext';
import { ArrowLeft, Trophy, Award, CheckCircle2, Calendar, User, Tag, Globe, Clock, Quote } from 'lucide-react';
import SEO from '../components/SEO';

export default function EventEyeQArena() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(50 / itemsPerPage);

  const modules = [
    { id: 1, topic: "Eyelids & Adnexa", questions: 10, points: 18, bonus: 2 },
    { id: 2, topic: "Conjunctiva & Sclera", questions: 10, points: 17, bonus: 1 },
    { id: 3, topic: "Cornea", questions: 10, points: 20, bonus: 2 },
    { id: 4, topic: "Anterior Chamber & Aqueous Humor", questions: 10, points: 16, bonus: 1 },
    { id: 5, topic: "Iris & Pupil", questions: 10, points: 15, bonus: 1 },
    { id: 6, topic: "Crystalline Lens & Accommodation", questions: 10, points: 19, bonus: 2 },
    { id: 7, topic: "Vitreous Body", questions: 10, points: 15, bonus: 1 },
    { id: 8, topic: "Retina", questions: 10, points: 24, bonus: 2 },
    { id: 9, topic: "Optic Nerve & Pathways", questions: 10, points: 24, bonus: 2 },
    { id: 10, topic: "Extraocular Muscles & Ocular Motility", questions: 10, points: 16, bonus: 2 },
  ];

  const leaderboard = [
    { rank: 1, name: "Rudra Kumar Sinha", score: "97.5%", time: "24:11", initial: "R" },
    { rank: 2, name: "Farhan Sheikh", score: "96%", time: "31:57", initial: "F" },
    { rank: 3, name: "Gurman kaur", score: "94.5%", time: "25:39", initial: "G" },
    { rank: 4, name: "Sofia Petrova", score: "94%", time: "28:10", initial: "S" },
    { rank: 5, name: "Rahul sharma", score: "94%", time: "32:18", initial: "R" },
    { rank: 6, name: "P.kaviya", score: "93.5%", time: "13:39", initial: "P" },
    { rank: 7, name: "Kritika Dey", score: "93.5%", time: "23:48", initial: "K" },
    { rank: 8, name: "Naushaba Afreen", score: "93%", time: "17:42", initial: "N" },
    { rank: 9, name: "Abdurrahman", score: "93%", time: "45:10", initial: "A" },
    { rank: 10, name: "Chukwudi Ezeh", score: "92.5%", time: "24:16", initial: "C" },
    { rank: 11, name: "Yuvarani", score: "92%", time: "14:32", initial: "Y" },
    { rank: 12, name: "Alex Ray", score: "92%", time: "18:30", initial: "A" },
    { rank: 13, name: "Mohd Atif Alam", score: "91.5%", time: "19:59", initial: "M" },
    { rank: 14, name: "Ashirvad Tiwari", score: "90%", time: "19:56", initial: "A" },
    { rank: 15, name: "Divya Kumari", score: "89%", time: "40:35", initial: "D" },
    { rank: 16, name: "Mohd Danish", score: "88.5%", time: "30:10", initial: "M" },
    { rank: 17, name: "Ummer Farooq", score: "87.5%", time: "15:10", initial: "U" },
    { rank: 18, name: "Shruti Kulkarni", score: "87.5%", time: "21:27", initial: "S" },
    { rank: 19, name: "Maria Garcia", score: "87.5%", time: "25:05", initial: "M" },
    { rank: 20, name: "T N Akshatha", score: "87.5%", time: "39:33", initial: "T" },
    { rank: 21, name: "Sahib Ansari", score: "86.5%", time: "40:41", initial: "S" },
    { rank: 22, name: "Mohd Arman", score: "85.5%", time: "23:54", initial: "M" },
    { rank: 23, name: "Roshan Mehta", score: "85.5%", time: "25:54", initial: "R" },
    { rank: 24, name: "Harini L", score: "84.5%", time: "16:18", initial: "H" },
    { rank: 25, name: "Ben Carter", score: "84.5%", time: "22:45", initial: "B" },
    { rank: 26, name: "Yuvarani", score: "84.5%", time: "28:59", initial: "Y" },
    { rank: 27, name: "Priyadharshini kumar", score: "84%", time: "33:35", initial: "P" },
    { rank: 28, name: "Karthika", score: "83.5%", time: "16:20", initial: "K" },
    { rank: 29, name: "Nithesh S Shetty", score: "83%", time: "26:26", initial: "N" },
    { rank: 30, name: "Nandini Suresh", score: "82.5%", time: "41:48", initial: "N" },
    { rank: 31, name: "Nkechi Anozie", score: "82%", time: "29:26", initial: "N" },
    { rank: 32, name: "David Lee", score: "82%", time: "35:50", initial: "D" },
    { rank: 33, name: "Appu Raj", score: "82%", time: "45:43", initial: "A" },
    { rank: 34, name: "Kemi Onasanya", score: "81.5%", time: "15:20", initial: "K" },
    { rank: 35, name: "Marwan K", score: "81%", time: "18:04", initial: "M" },
    { rank: 36, name: "Neelesh", score: "79.5%", time: "29:29", initial: "N" },
    { rank: 37, name: "Omotola Adebisi", score: "78.5%", time: "33:00", initial: "O" },
    { rank: 38, name: "Haziel Rynjah", score: "78%", time: "50:53", initial: "H" },
    { rank: 39, name: "Priya Singh", score: "77%", time: "31:15", initial: "P" },
    { rank: 40, name: "Emeka Uzo", score: "76.5%", time: "34:25", initial: "E" },
    { rank: 41, name: "Charles Olamidoyin LAIZER", score: "75%", time: "23:31", initial: "C" },
    { rank: 42, name: "Yashwant", score: "74.5%", time: "26:23", initial: "Y" },
    { rank: 43, name: "Priya Joseph", score: "74.5%", time: "42:58", initial: "P" },
    { rank: 44, name: "Keerthana P", score: "73.5%", time: "29:05", initial: "K" },
    { rank: 45, name: "Aisha Bello", score: "72.5%", time: "25:00", initial: "A" },
    { rank: 46, name: "Noel Fernandes", score: "70.5%", time: "22:22", initial: "N" },
    { rank: 47, name: "Firoz Ahmed", score: "68.5%", time: "34:47", initial: "F" },
    { rank: 48, name: "zainab ansari", score: "66.5%", time: "33:37", initial: "Z" },
    { rank: 49, name: "Femi Adebayo", score: "65%", time: "26:16", initial: "F" },
    { rank: 50, name: "Sahbaj khan", score: "64.5%", time: "20:42", initial: "S" }
  ];

  return (
    <>
    <SEO title="Eye Q Arena" description="FocusLinks Eye Q Arena — interactive quiz and knowledge challenge for optometry professionals." keywords="eye q arena, quiz, optometry challenge" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Banner */}
      <div className="bg-slate-900 pt-8 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/community" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Community
          </Link>
          <div className="max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Clock className="w-3 h-3 mr-1.5" /> Event Ended
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Eye Q Arena 2025: The International Optometry Knowledge Championship
            </h1>
            <p className="text-xl text-slate-300 italic border-l-4 border-blue-500 pl-4 mb-8">
              "Where Global Vision Meets Knowledge."
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Event Concluded!</h2>
                  <p className="text-slate-600 dark:text-slate-300">Thank you to all participants! Check out the final standings below.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="#leaderboard" className="inline-flex justify-center items-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                    <Trophy className="w-4 h-4 mr-2" /> Final Leaderboard
                  </a>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                The Eye Q Arena 2025 has concluded! This international optometry quiz competition brought together passionate optometry students, interns, and professionals from across the globe for a thrilling test of knowledge. Organized by Focus Links, this event successfully promoted academic excellence, global collaboration, and clinical reasoning skills in the field of eye care.
              </p>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                Participants competed on their knowledge from the anterior to the posterior segment of the eye, with final rankings determined by score, accuracy, and completion time. We extend our immense gratitude to all participants for making this a landmark event.
              </p>
            </div>

            {/* Highlights */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Event Highlights</h3>
              <ul className="space-y-4">
                {[
                  "International Competition: The event was a massive success, with participants from over 15 countries.",
                  "100 Challenging Questions: Contestants were tested on 10 in-depth modules over 60 minutes.",
                  "Dynamic Scoring: The final leaderboard reflects a combination of question difficulty and speed.",
                  "Digital Certificates: All qualifying participants will receive their certificates via email. Top performers will receive a prestigious Certificate of Excellence.",
                  "Organized by FocusLinks: Proudly hosted by the world's largest global eye care community."
                ].map((highlight, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 text-lg">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modules Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Competition Modules</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="p-4 pl-6">Module</th>
                      <th className="p-4">Topic</th>
                      <th className="p-4 text-center">Questions</th>
                      <th className="p-4 text-center">Max Points</th>
                      <th className="p-4 text-center">Time Bonus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modules.map((mod) => (
                      <tr key={mod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="p-4 pl-6 text-slate-500 font-medium">{mod.id}</td>
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">{mod.topic}</td>
                        <td className="p-4 text-center text-slate-600 dark:text-slate-400">{mod.questions}</td>
                        <td className="p-4 text-center text-slate-600 dark:text-slate-400">{mod.points}</td>
                        <td className="p-4 text-center text-slate-600 dark:text-slate-400">{mod.bonus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 relative">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-100" />
                <p className="text-slate-700 dark:text-slate-300 italic mb-6 relative z-10">
                  "The Eye Q Arena was a fantastic experience! The questions were challenging and covered a great breadth of topics. It really pushed me to review my knowledge. Can't wait for the next one!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mr-3">F</div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Farhan Sheikh</p>
                    <p className="text-sm text-slate-500">Participant</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 relative">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-100" />
                <p className="text-slate-700 dark:text-slate-300 italic mb-6 relative z-10">
                  "An incredibly well-organized event. The platform was seamless, and the live leaderboard added a thrilling competitive edge. A huge congratulations to the Focus Links team for putting this together."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-3">K</div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Kritika Dey</p>
                    <p className="text-sm text-slate-500">Participant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Note */}
            <div className="bg-blue-600 rounded-2xl shadow-md p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
              <h3 className="text-2xl font-bold mb-6 relative z-10">A Note from the Founder</h3>
              <blockquote className="text-lg text-blue-50 italic leading-relaxed mb-6 relative z-10">
                "The Eye Q Arena 2025 has been a monumental success, far exceeding our expectations. I want to extend my deepest gratitude to my esteemed lecturer, V.M. Ramkumar, whose guidance was invaluable. A massive thank you to every participant who joined us. Your engagement and passion are what make this community thrive. We are incredibly excited to see you on the leaderboard and can't wait for the next event!"
              </blockquote>
              <p className="font-semibold text-blue-200 relative z-10">– Janarthan Veeramani, Founder of Focus Links</p>
            </div>

            {/* Leaderboard */}
            <div id="leaderboard" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden scroll-mt-24">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                  <Trophy className="w-6 h-6 text-amber-500 mr-3" /> Top 50 Participants
                </h3>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">50 Total Participants</span>
              </div>
              <div className="divide-y divide-slate-100">
                {leaderboard.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user, idx) => {
                  const actualIdx = (currentPage - 1) * itemsPerPage + idx;
                  return (
                  <div key={actualIdx} className="p-4 sm:px-6 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className={`w-8 font-bold text-lg ${actualIdx < 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                      #{user.rank}
                    </div>
                    <div className="flex-1 flex items-center ml-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-4 ${
                        actualIdx === 0 ? 'bg-amber-500' : 
                        actualIdx === 1 ? 'bg-slate-400' : 
                        actualIdx === 2 ? 'bg-amber-700' : 'bg-blue-600'
                      }`}>
                        {user.initial}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-white text-lg">{user.score}</div>
                      <div className="text-sm text-slate-500 flex items-center justify-end">
                        <Clock className="w-3 h-3 mr-1" /> {user.time}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">Event Details</h3>
              
              <div className="space-y-6">
                <div className="flex">
                  <Calendar className="w-5 h-5 text-slate-400 mr-4 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Date</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">2 Nov - 12 Nov 2025</p>
                  </div>
                </div>
                
                <div className="flex">
                  <User className="w-5 h-5 text-slate-400 mr-4 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Organizer</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Organized by V.M. Ram Kumar</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Powered by Focus Links</p>
                  </div>
                </div>

                <div className="flex">
                  <Globe className="w-5 h-5 text-slate-400 mr-4 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Platform</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Hosted by Focus Links</p>
                  </div>
                </div>

                <div className="flex">
                  <Clock className="w-5 h-5 text-slate-400 mr-4 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Event Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 mt-1">
                      Concluded
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Organizer */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">About the Organizer</h3>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl mr-4">
                  V
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">V.M. Ram Kumar</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">M.Optom | Lecturer & Clinical Optometrist</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <Tag className="w-5 h-5 text-slate-400 mr-2" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Quiz", "International", "Competition", "Students", "Professionals", "Anterior Segment", "Posterior Segment", "Optometry Certification", "Clinical Knowledge"].map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </>
  );
}
