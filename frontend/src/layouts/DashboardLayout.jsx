import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/tasks/new': 'New Scraping Task',
  '/tasks': 'Task History',
  '/saved-leads': 'Saved Leads',
  '/exports': 'Exports',
  '/settings': 'Settings',
  '/help': 'Help & Docs',
}

function getTitle(pathname) {
  if (pathname.includes('/progress')) return 'Scraping Progress'
  if (pathname.includes('/leads') && pathname.includes('/tasks')) return 'Leads'
  if (pathname.startsWith('/leads/')) return 'Lead Details'
  return PAGE_TITLES[pathname] || 'LeadScrape'
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={getTitle(pathname)}
        />
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
