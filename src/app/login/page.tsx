import AuthModal from "@/components/AuthModal";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(250,204,21,0.2),_transparent_70%)]"></div>
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
            </div>

            <AuthModal />
        </main>
    );
}
