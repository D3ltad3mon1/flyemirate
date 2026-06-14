export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm text-neutral-600 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl text-emirates">Emirates</div>
          <p className="mt-3 text-xs">Fly Better with Emirates.</p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-neutral-900">Help</h4>
          <ul className="space-y-2 text-xs">
            <li>Contact us</li><li>Baggage</li><li>Manage your booking</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-neutral-900">About Emirates</h4>
          <ul className="space-y-2 text-xs">
            <li>The Emirates story</li><li>Careers</li><li>News</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-neutral-900">Follow us</h4>
          <p className="text-xs">© {new Date().getFullYear()} Emirates. Demo site.</p>
        </div>
      </div>
    </footer>
  );
}
