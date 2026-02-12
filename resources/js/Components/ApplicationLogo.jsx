export default function ApplicationLogo({ className = '' }) {
    return (
        <img 
            src="/images/warlen.png"
            alt="Warlen Logo"
            className={`h-20 w-auto ${className}`}
        />
    );
}
