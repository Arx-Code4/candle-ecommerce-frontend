import { ROUTES } from '@/constants';
import { Link } from 'react-router-dom';

export function ShopFooter() {
  return (
    <footer className="border-t border-border bg-background px-6 py-10">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        <div>
          <p className="font-heading text-lg text-foreground mb-2">LUMIÈRE</p>
          <p className="text-sm text-muted-foreground">
            Small-batch soy wax candles, hand-poured in Addis Ababa. Warmth you can carry from room
            to room.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Shop</p>
          <Link to={ROUTES.CATALOG} className="text-sm text-muted-foreground hover:text-primary">
            All candles
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Company</p>
          <Link to={ROUTES.ORDERS} className="text-sm text-muted-foreground hover:text-primary">
            Order history
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Join the list</p>
          <p className="text-xs text-muted-foreground">New scents and small-batch drops, first.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="you@email.com"
              className="w-full rounded-md border border-input px-2 py-1 text-sm bg-background"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground"
            >
              Sign up
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
