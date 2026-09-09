import { InputHTMLAttributes } from "react";

type InputVariant = 'code' | 'text';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    variant?: InputVariant;
    error?: string;
}

const variantStyles: Record<InputVariant, string> = {
    code: 'text-center tracking-widest uppercase',
    text: 'text-left',
};

export function InputField({ variant = 'text', error, className = '', ...rest }: InputProps) {
    return (
        <div className="w-full flex flex-col gap-2">
            <input
                className={`
                    w-full py-3 px-4 bg-zinc-950/50 border rounded-xl
                    placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-inset
                    transition-all
                    ${error ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:ring-indigo-500'}
                    ${variantStyles[variant]}
                    ${className}
                `}
                {...rest}
            />
            <p className={`text-red-400 text-sm ${error ? 'visible' : 'invisible'}`}>
                {error || 'placeholder'}
            </p>
        </div>
    );
}