import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
