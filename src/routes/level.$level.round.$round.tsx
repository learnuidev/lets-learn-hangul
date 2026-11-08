import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/level/$level/round/$round')({
  component: RoundLayout,
})

function RoundLayout() {
  return (
    <div className="round">
      <Outlet />
    </div>
  )
}
