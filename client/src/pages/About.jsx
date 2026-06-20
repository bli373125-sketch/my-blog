import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { fetchProfile } from "../api";

const MACARON_COLORS = [
  { bg: "bg-[#F5E4E0]", text: "text-[#8B6B65]" },
  { bg: "bg-[#E0ECF5]", text: "text-[#5B778B]" },
  { bg: "bg-[#F5F2E0]", text: "text-[#8B855B]" },
  { bg: "bg-[#E0F2EB]", text: "text-[#5B8B78]" },
  { bg: "bg-[#F5EBE0]", text: "text-[#8B755B]" },
];

function hashTag(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) | 0;
  return Math.abs(h) % MACARON_COLORS.length;
}

export default function About() {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    fetchProfile().then(setProfile);
  }, []);

  const skills = (profile.skills || "").split(/[,，\s]+/).filter(Boolean);

  return (
    <div>
      <Helmet>
        <title>关于 — 静思录</title>
      </Helmet>

      <header className="mb-12 animate-fade-up">
        <p className="font-script text-3xl text-vert-700 dark:text-vert-400 mb-2">
          Archive
        </p>
        <h1 className="text-4xl font-serif font-bold text-[var(--color-text)] mb-4 tracking-widest-plus uppercase">
          关于
        </h1>
        <div className="flex items-center gap-3">
          <span className="block h-px w-8 bg-vert-700 dark:bg-vert-500" />
          <span className="w-1.5 h-1.5 rotate-45 border border-vert-700 dark:border-vert-500" />
          <span className="block h-px w-8 bg-vert-700 dark:bg-vert-500" />
        </div>
      </header>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 transition-colors">
        {/* Avatar */}
        {profile.avatar && (
          <div className="mb-8 inline-block">
            <div className="p-1 border border-dashed border-vert-500 dark:border-vert-600 rounded-full">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Name + serial */}
        <p className="font-mono text-[10px] text-ink-300 dark:text-ink-600 tracking-widest mb-2 tabular-nums">
          PROFILE NO.001
        </p>

        <h2 className="text-2xl font-serif font-bold mb-4 text-[var(--color-text)]">
          {profile.name || "你的名字"}
        </h2>

        <div className="flex items-center gap-3 mb-6">
          <span className="block h-px w-6 bg-vert-700 dark:bg-vert-500" />
        </div>

        <p className="text-ink-500 dark:text-ink-400 mb-10 whitespace-pre-wrap leading-relaxed font-serif font-light max-w-prose">
          {profile.bio || "欢迎来到我的博客!"}
        </p>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-10">
            <h3 className="text-[10px] font-mono font-medium text-ink-300 dark:text-ink-600 uppercase tracking-widest mb-4">
              Skills &amp; Tools
            </h3>
            <div className="flex gap-2 flex-wrap">
              {skills.map((s) => {
                const c = MACARON_COLORS[hashTag(s)];
                return (
                  <span
                    key={s}
                    className={`text-sm px-3 py-1.5 rounded font-medium ${c.bg} ${c.text}`}
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact */}
        <div>
          <h3 className="text-[10px] font-mono font-medium text-ink-300 dark:text-ink-600 uppercase tracking-widest mb-4">
            Contact
          </h3>
          <ul className="space-y-2 text-sm font-sans font-light">
            {profile.email && (
              <li className="flex items-center gap-3">
                <span className="text-ink-300 dark:text-ink-600 font-mono text-xs">
                  EMAIL
                </span>
                <span className="text-[var(--color-text)]">{profile.email}</span>
              </li>
            )}
            {profile.github && (
              <li className="flex items-center gap-3">
                <span className="text-ink-300 dark:text-ink-600 font-mono text-xs">
                  GITHUB
                </span>
                <span className="text-[var(--color-text)]">{profile.github}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
