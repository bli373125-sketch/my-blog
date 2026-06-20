export default function About() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">关于我</h1>
      <div className="bg-white rounded-lg shadow-sm border p-8 space-y-4 text-gray-700 leading-relaxed">
        <p>
          欢迎来到我的博客！这里是我记录想法、分享经验和展示项目的地方。
        </p>
        <p>
          你可以在这里编辑你的个人介绍，展示你的技能、经历和兴趣爱好。
        </p>
        <h2 className="text-xl font-semibold text-gray-900 mt-6">联系方式</h2>
        <ul className="space-y-2">
          <li>Email: your-email@example.com</li>
          <li>GitHub: github.com/your-username</li>
        </ul>
      </div>
    </div>
  );
}
