export function BackButton({onClick}: { onClick: () => void }) {
    return(
        <button
            onClick={onClick}
            className="w-full py-2 text-zinc-400 hover:text-white text-sm transition-colors cursor-pointer mt-2 flex items-center justify-center gap-2"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
        </button>
    )
}