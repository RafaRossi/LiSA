import {BackButton} from "@/app/components/home/BackButton";
import {InputField} from "@/app/components/home/InputField";
import {Button} from "@/app/components/home/Button";

interface JoinPanelProps {
    active: boolean;
    code: string;
    error?: string;
    isLoading?: boolean;

    setCode: (code: string) => void;
    onSubmit: () => void;
    onBack: () => void;
}

export function JoinPanel({ code, setCode, isLoading, error, onSubmit, onBack }: JoinPanelProps) {
    return (
        <div className="w-full flex flex-col gap-2 px-1">
            <h1 className="text-2xl font-extrabold tracking-tight">LiSA</h1>
            <p className="text-sm">Digite o código da sala</p>
            <InputField
                variant="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                placeholder="00000000"
                maxLength={8}
                error={error}
            />
            <Button variant="primary" onClick={onSubmit} disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar na Sala'}
            </Button>
            <BackButton onClick={onBack} />
        </div>
    )
}