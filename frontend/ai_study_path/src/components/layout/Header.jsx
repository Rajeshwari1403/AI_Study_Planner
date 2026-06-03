import React from 'react';
import { useAuth } from "../../context/AuthContext";
import { Bell, User, Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className='sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60'>
      {/* 💡 CHANGE 1: Changed justify-center to justify-between */}
      <div className='flex items-center justify-between h-full px-6'>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleSidebar} 
          className='md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200' 
          aria-label='Toggle Sidebar'
        >
          <Menu size={24} />
        </button>

        {/* 💡 CHANGE 2: Added flex-1 so this spacer pushes the profile content to the far right */}
        <div className='hidden md:block flex-1'></div>

        <div className='flex items-center gap-3'>
          <button className='relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group'>
            <Bell size={20} strokeWidth={2} className='group-hover:scale-110 transition-transform duration-200' />
            <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-white'></span>
          </button>

          {/* User Profile */}
          <div className='flex items-center gap-3 pl-3 border-l border-slate-200/60'>
            {/* Added inline-flex and centered items inside the avatar badge */}
            <div className='flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer group'>
              <div className='inline-flex w-9 h-9 rounded-xl bg-gradient-to-br from-[#8686AC] to-[#434161] items-center justify-center text-white shadow-md shadow-[#a2a2cb] group-hover:shadow-lg group-hover:shadow-[#434161] transition-all duration-200'>
                <User size={18} strokeWidth={2.5} />
              </div>
            </div>
            
            {/* 💡 CHANGE 3: Wrapped profile text inside a column layout container */}
            <div className='flex flex-col text-left'>
              <p className='text-sm font-semibold text-slate-900 leading-none mb-0.5'>
                {user?.username || 'User'}
              </p>
              <p className='text-xs text-slate-500 leading-none'>
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;