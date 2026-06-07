import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-ink-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white font-serif">Inkwell</span>
          </Link>
          <p className="text-xs text-gray-400">A platform for ideas worth reading.</p>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Home</Link>
            <Link to="/register" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Sign up</Link>
            <Link to="/write" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Write</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
