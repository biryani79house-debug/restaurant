export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
            Welcome to Our Restaurant
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Savor exquisite flavors and exceptional dining experiences.
          </p>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <a href="/menu" className="flex h-12 w-full items-center justify-center rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700 md:w-[158px]">
              View Menu
            </a>
            <a href="/reservations" className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]">
              Make Reservation
            </a>
            <a href="/order" className="flex h-12 w-full items-center justify-center rounded-full bg-green-600 px-5 text-white transition-colors hover:bg-green-700 md:w-[158px]">
              Order Online
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
