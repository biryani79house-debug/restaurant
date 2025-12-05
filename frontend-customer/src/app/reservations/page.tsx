export default function Reservations() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
            Make a Reservation
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Reserve your table for an unforgettable dining experience.
          </p>
          <form className="w-full max-w-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Date</label>
              <input type="date" className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Time</label>
              <input type="time" className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Number of Guests</label>
              <select className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5+</option>
              </select>
            </div>
            <button type="submit" className="w-full rounded-full bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
              Reserve Table
            </button>
          </form>
          <a href="/" className="text-blue-600 hover:text-blue-800">Back to Home</a>
        </div>
      </main>
    </div>
  );
}
