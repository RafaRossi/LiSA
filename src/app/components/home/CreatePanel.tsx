import {BackButton} from "@/app/components/home/BackButton";
import {Button} from "@/app/components/home/Button";
import {InputField} from "@/app/components/home/InputField";

interface CreatePanelProps {
    active: boolean;
    roomName: string;
    error?: string;
    isLoading?: boolean;

    setRoomName: (value: string) => void;
    onSubmit: () => void;
    onBack: () => void;
}

export function CreatePanel({ roomName, setRoomName, isLoading, error, onSubmit, onBack }: CreatePanelProps) {
    return (
        <div className="w-full flex flex-col gap-3 px-1">
            <h1 className="text-2xl font-extrabold tracking-tight">LiSA</h1>
            <InputField
                variant="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                placeholder="Digite um título"
                maxLength={64}
                error={error}
            />
            <Button variant="primary" onClick={onSubmit} disabled={isLoading}>
                {isLoading ? 'Criando sala...' : 'Criar sala'}
            </Button>
            <BackButton onClick={onBack} />
        </div>
    );
}