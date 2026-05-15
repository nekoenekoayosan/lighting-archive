import { LightDetailClient } from '@/components/LightDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LightDetailPage({ params }: PageProps) {
  const { id } = await params
  
  return <LightDetailClient lightId={parseInt(id)} />
}