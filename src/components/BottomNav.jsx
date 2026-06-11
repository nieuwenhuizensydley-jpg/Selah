import { NavLink, useLocation } from 'react-router-dom'
import { Home, Users, Calendar, ShoppingBag, BarChart2, MoreHorizontal } from 'lucide-react'

const MORE_PATHS = ['/inventory','/reports','/notes','/services','/staff','/expenses','/cashup','/eft','/settings']

export default function BottomNav() {
  const { pathname } = useLocation()
  const moreActive = MORE_PATHS.includes(pathname)

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <Home /><span>Home</span>
      </NavLink>
      <NavLink to="/clients" className={({ isActive }) => `nav-item${isActive || pathname.startsWith('/clients/') ? ' active' : ''}`}>
        <Users /><span>Clients</span>
      </NavLink>
      <NavLink to="/calendar" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <Calendar /><span>Calendar</span>
      </NavLink>
      <NavLink to="/pos" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <ShoppingBag /><span>Checkout</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive || moreActive ? ' active' : ''}`}>
        <MoreHorizontal /><span>More</span>
      </NavLink>
    </nav>
  )
}
