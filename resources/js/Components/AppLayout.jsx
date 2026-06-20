export default function AppLayout({ children, className = '' }) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div
                className={`
                    relative w-full max-w-md min-h-screen
                    bg-white overflow-hidden
                    flex flex-col
                    ${className}
                `}
            >
                {children}
            </div>
        </div>
    );
}
