import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { fetchProfile } from "../api";

export default function About() {
  const [profile, setProfile] = useState({});

  useEffect(() => { fetchProfile().then(setProfile); }, []);

  const skills = (profile.skills || "").split(/[,，\s]+/).filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto">
      <Helmet><title>About — My Blog</title></Helmet>
      <h1 className="text-3xl font-bold mb-8 dark:text-white">About</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8 transition-colors">
        {profile.avatar && <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full object-cover mb-6" />}
        <h2 className="text-2xl font-bold mb-2 dark:text-white">{profile.name || "Your Name"}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-wrap">{profile.bio || "Welcome!"}</p>
        {skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Skills</h3>
            <div className="flex gap-2 flex-wrap">
              {skills.map((s) => <span key={s} className="text-sm px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">{s}</span>)}
            </div>
          </div>
        )}
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Contact</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
          {profile.email && <li>Email: {profile.email}</li>}
          {profile.github && <li>GitHub: {profile.github}</li>}
        </ul>
      </div>
    </div>
  );
}
