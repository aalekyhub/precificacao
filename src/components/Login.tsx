import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle2, Star, ShieldCheck } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onLogin(); // Call the parent function to "authenticate"
        }, 800);
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Brand & Benefits */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-16 text-white">

                {/* Abstract Shapes for visual interest */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/50 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-black text-xl shadow-lg">P</div>
                        <span className="text-2xl font-black tracking-tight">PrecificaMaster</span>
                    </div>

                    <h1 className="text-5xl font-bold font-serif leading-tight mb-8">
                        Domine a arte de <br />
                        <span className="text-blue-200">precificar com lucro.</span>
                    </h1>

                    <p className="text-lg text-blue-100 max-w-md leading-relaxed mb-12">
                        Transforme sua gestão financeira com uma plataforma completa para artesãos e pequenos empreendedores.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                                <CheckCircle2 className="w-6 h-6 text-blue-200" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Precificação Automática</h3>
                                <p className="text-sm text-blue-200">Cálculos precisos baseados em custos reais.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                                <Star className="w-6 h-6 text-blue-200" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Orçamentos Profissionais</h3>
                                <p className="text-sm text-blue-200">Gere PDFs incríveis para seus clientes.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                                <ShieldCheck className="w-6 h-6 text-blue-200" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Controle Total</h3>
                                <p className="text-sm text-blue-200">Gerencie estoque, contatos e despesas.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-12 text-sm text-blue-200/60 font-medium">
                    &copy; 2024 PrecificaMaster. Todos os direitos reservados.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100/50">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 font-serif mb-3">Bem-vindo de volta!</h2>
                        <p className="text-gray-500 font-medium">Acesse sua conta para continuar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">E-mail</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-700"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Senha</label>
                                <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Esqueceu a senha?</a>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-700"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group mb-6"
                        >
                            {isLoading ? (
                                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Entrar no Sistema
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-medium text-sm">
                            Não tem uma conta?{' '}
                            <a href="#" className="text-blue-600 font-bold hover:underline">
                                Criar conta grátis
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
