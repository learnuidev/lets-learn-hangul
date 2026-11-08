import { createFileRoute } from '@tanstack/react-router'
import { NowWhat } from '@/components/now-what'

export const Route = createFileRoute('/nowwhat')({
  component: NowWhat,
})
