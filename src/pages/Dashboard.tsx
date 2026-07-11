import { Header } from '../components/layout/Header'
import { AstroCard } from '../components/astro/AstroCard'
import { DashboardNavList } from '../components/dashboard/DashboardNavList'

export function Dashboard() {
  return (
    <>
      <Header
        showLogo
        title="Дневник практик Юнгдрунг Бон"
        showSettings
      />
      <div className="px-4 py-4">
        <p className="mb-2 text-center text-lg leading-7 text-[var(--color-accent)]">
          ཡུང་དྲུང་བོན
        </p>
        <h2 className="mb-6 text-center text-base font-medium">
          Добро пожаловать на путь практики
        </h2>

        <div className="mb-6">
          <AstroCard />
        </div>

        <DashboardNavList />
      </div>
    </>
  )
}
