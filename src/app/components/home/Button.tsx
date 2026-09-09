import { ButtonHTMLAttributes } from "react";

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20',
    secondary:
        'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-lg',
}

export function Button({ variant = 'primary', className = '', disabled, children, ...rest }: ButtonProps) {
    return (
        <button
            disabled={disabled}
            className={`
                w-full py-3 px-6 font-semibold rounded-xl
                transition-all duration-200 active:scale-95 cursor-pointer
                disabled:opacity-50
                ${variantStyles[variant]}
                ${className}
            `}
            {...rest}
        >
            {children}
        </button>
    );
}