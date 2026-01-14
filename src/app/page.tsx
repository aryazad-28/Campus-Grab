import Link from 'next/link'
import { ArrowRight, Clock, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="mb-24 text-center">
        <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
          Order food from your
          <br />
          <span className="text-neutral-500">campus canteens</span>
        </h1>
        <p className="mx-auto mb-8 max-w-md text-neutral-500">
          Skip the queue. Get your favorite meals delivered fast with smart recommendations.
        </p>
        <Link href="/menu">
          <Button size="lg" className="gap-2">
            Browse Menu
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="grid gap-8 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
            <Utensils className="h-5 w-5 text-neutral-700" />
          </div>
          <h3 className="mb-2 font-medium">Multiple Canteens</h3>
          <p className="text-sm text-neutral-500">
            Browse menus from all campus canteens in one place.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
            <Clock className="h-5 w-5 text-neutral-700" />
          </div>
          <h3 className="mb-2 font-medium">Smart Recommendations</h3>
          <p className="text-sm text-neutral-500">
            Get suggestions for faster preparation times.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
            <ArrowRight className="h-5 w-5 text-neutral-700" />
          </div>
          <h3 className="mb-2 font-medium">Skip the Queue</h3>
          <p className="text-sm text-neutral-500">
            Order ahead and pick up when ready. No waiting.
          </p>
        </div>
      </section>
    </div>
  )
}
