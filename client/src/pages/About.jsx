import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { fetchProfile } from "../api";

export default function About() {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    fetchProfile().then(setProfile);
  }, []);

  const skills = (profile.skills || "").split(/[,，\s]+/).filter(Boolean);

  return (
    <div>
      <Helmet><title>关于 — 静思录</title></Helmet>

      <h1 className="text-3xl font-serif font-bold mb-10 text-ink-800 dark:text-ink-100">
        关于
      </h1>

      <div className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-100 dark:border-ink-700 p-8 transition-colors">
        {profile.avatar && (
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover mb-6 ring-2 ring-ink-100 dark:ring-ink-700"
          />
        )}

        <h2 className="text-2xl font-serif font-bold mb-3 text-ink-800 dark:text-ink-100">
          {profile.name || "你的名字"}
        </h2>

        <p className="text-ink-500 dark:text-ink-400 mb-8 whitespace-pre-wrap leading-relaxed font-serif">
          {profile.bio || "欢迎来到我的博客!"}
        </p>

        {skills.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-sans font-medium text-ink-300 dark:text-ink-600 uppercase tracking-widest mb-3">
              技能
            </h3>
            <div className="flex gap-2 flex-wrap">
              {skills.map((s) => (
                <span
                  key={s}
                  className="text-sm px-3 py-1.5 rounded-full bg-rust-50 dark:bg-rust-900/40 text-rust-600 dark:text-rust-400 font-sans"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-xs font-sans font-medium text-ink-300 dark:text-ink-600 uppercase tracking-widest mb-3">
          联系
        </h3>
        <ul className="space-y-2 text-ink-500 dark:text-ink-400 text-sm font-sans">
          {profile.email && (
            <li>
              Email:{" "}
              <span className="text-ink-700 dark:text-ink-300">
                {profile.email}
              </span>
            </li>
          )}
          {profile.github && (
            <li>
              GitHub:{" "}
              <span className="text-ink-700 dark:text-ink-300">
                {profile.github}
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
