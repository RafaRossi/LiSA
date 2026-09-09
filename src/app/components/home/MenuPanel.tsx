import {Button} from "@/app/components/home/Button";

interface MenuPanelProps {
    onCreate: () => void;
    onJoin: () => void;
}

export function MenuPanel({onCreate, onJoin}: MenuPanelProps) {
    return (
        <div className="w-full flex flex-col px-1">
            <div className="space-y-3 mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight">LiSA</h1>
                <p className="text-zinc-400 text-md">
                    Compartilhe sua tela instantaneamente sem complicações.
                </p>
            </div>
            <Button variant="primary" onClick={onCreate}>
                Iniciar Transmissão
            </Button>
            <div className="flex items-center gap-3 my-5">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <span className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Ou</span>
                <div className="h-px bg-zinc-800 flex-1"></div>
            </div>
            <Button variant="secondary" onClick={onJoin}>
                Entrar com Código
            </Button>
        </div>
    );
}