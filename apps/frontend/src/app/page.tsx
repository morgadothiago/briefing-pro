import Link from "next/link";
import {
  FileText,
  LayoutDashboard,
  Download,
  ArrowRight,
  Play,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0F1E] text-white">
      {/* Navbar */}
      <nav className="border-b border-[#1F2937] px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <span className="text-xl font-bold tracking-tight">
          Briefing<span className="text-[#3B82F6]">Pro</span>
        </span>
        <Link
          href="/login"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Entrar
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-[#0A0F1E] via-[#0F1729] to-[#1E3A5F]">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1F2937] bg-[#111827]/60 px-4 py-1.5 text-xs text-gray-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
            Pipeline completo de vendas para software houses
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
            Profissionalize seu{" "}
            <span className="text-[#3B82F6]">processo de vendas</span>
          </h1>

          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Do primeiro contato ao contrato assinado — tudo em um único
            sistema.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:from-blue-500 hover:to-blue-600 transition-all duration-200"
            >
              Começar agora
              <ArrowRight size={16} />
            </Link>
            <button className="inline-flex items-center gap-2 border border-[#1F2937] text-gray-300 px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#1F2937] transition-colors">
              <Play size={16} />
              Ver demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#0A0F1E] py-20 px-6 border-t border-[#1F2937]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-500 text-sm uppercase tracking-widest mb-12">
            Tudo que você precisa
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Wizard Inteligente",
                desc: "12 etapas guiadas para capturar tudo que você precisa do cliente",
              },
              {
                icon: LayoutDashboard,
                title: "Pipeline de Vendas",
                desc: "Acompanhe cada lead do contato ao contrato com Kanban visual",
              },
              {
                icon: Download,
                title: "Export PDF Profissional",
                desc: "Briefings, escopos e propostas formatados automaticamente",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 hover:-translate-y-0.5 transition-transform duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#3B82F6]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-[#0A0F1E] py-12 px-6 border-t border-[#1F2937]">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-[#0A0F1E] flex items-center justify-center text-xs font-bold text-white"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            Confiado por{" "}
            <span className="text-white font-semibold">+500 agências</span> e
            freelancers em todo o Brasil
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F2937] py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span>
            &copy; {new Date().getFullYear()} BriefingPro. Todos os direitos
            reservados.
          </span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Privacidade
            </Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Termos
            </Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Suporte
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
