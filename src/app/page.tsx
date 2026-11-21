
const subjects = [
  {
    name: "Languages",
    description: "Vocabulary, grammar & conversation",
    symbol: "文",
    color: "bg-[#F1DFD2]",
    symbolColor: "text-[#A75D48]",
  },
  {
    name: "Science",
    description: "Discover how the world works",
    symbol: "✳",
    color: "bg-[#DCE7DC]",
    symbolColor: "text-[#3E6650]",
  },
  {
    name: "Mathematics",
    description: "Build confidence with numbers",
    symbol: "∑",
    color: "bg-[#E5E6F0]",
    symbolColor: "text-[#626B91]",
  },
  {
    name: "History",
    description: "Explore people, places & events",
    symbol: "◷",
    color: "bg-[#F4E7C9]",
    symbolColor: "text-[#A47A35]",
  },
];

const featuredDecks = [
  {
    title: "The Natural World",
    subject: "SCIENCE & NATURE",
    cards: "24 cards",
    color: "bg-[#DCE7DC]",
    artwork: "🌿",
  },
  {
    title: "Everyday Spanish",
    subject: "LANGUAGES",
    cards: "36 cards",
    color: "bg-[#F1DFD2]",
    artwork: "¡Hola!",
  },
  {
    title: "The Solar System",
    subject: "ASTRONOMY",
    cards: "18 cards",
    color: "bg-[#E5E6F0]",
    artwork: "☾",
  },
];

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#253D35]">
      {/* Navigation */}
      <header className="border-b border-[#253D35]/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#253D35] text-lg text-[#F7F3EA]">
              ✳
            </div>
            <span className="text-xl font-semibold tracking-tight">
              wonder<span className="font-normal">learn</span>
            </span>
          </a>

          <div className="hidden items-center gap-9 text-sm text-[#253D35]/75 md:flex">
            <a href="#subjects" className="transition hover:text-[#253D35]">
              Explore
            </a>
            <a href="#featured" className="transition hover:text-[#253D35]">
              Discover decks
            </a>
            <a href="#how-it-works" className="transition hover:text-[#253D35]">
              How it works
            </a>
          </div>

          <a
            href="#get-started"
            className="rounded-full bg-[#253D35] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#36564A]"
          >
            Get started <span className="ml-1">↗</span>
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">
        <div className="max-w-xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#253D35]/15 px-4 py-2 text-xs font-medium tracking-wide text-[#49675A]">
            <span className="h-2 w-2 rounded-full bg-[#D77F72]" />
            A little curiosity goes a long way
          </div>

          <h1 className="font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-[76px]">
            A smarter way
            <br />
            to learn <span className="italic text-[#B47D45]">anything.</span>
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-8 text-[#253D35]/70">
            Turn curiosity into knowledge. Explore ideas, create beautiful
            flashcards, and make learning something you actually look forward to.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#get-started"
              className="inline-flex items-center gap-3 rounded-full bg-[#253D35] px-7 py-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#36564A]"
            >
              Start exploring <ArrowIcon />
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-3 text-sm font-medium text-[#253D35]/75 transition hover:text-[#253D35]"
            >
              See how it works
            </a>
          </div>

          <div className="mt-12 flex items-center gap-4 border-t border-[#253D35]/10 pt-7">
            <div className="flex -space-x-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#F7F3EA] bg-[#D77F72] text-sm">✳</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#F7F3EA] bg-[#E6A65D] text-sm">∑</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#F7F3EA] bg-[#8A9BBD] text-sm">文</span>
            </div>
            <p className="text-xs leading-5 text-[#253D35]/65">
              One space for all the things
              <br />you want to learn.
            </p>
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative mx-auto flex min-h-[430px] w-full max-w-xl items-center justify-center">
          <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E9E3D5]" />

          <div className="absolute left-[7%] top-[12%] rotate-[-10deg] rounded-2xl border border-[#253D35]/10 bg-white px-5 py-4 shadow-sm">
            <span className="text-xs tracking-widest text-[#A75D48]">TODAY'S CURIOSITY</span>
            <p className="mt-2 font-serif text-xl">Learn something new.</p>
          </div>

          <div className="relative z-10 w-[78%] max-w-[340px] rotate-[-4deg] rounded-3xl border border-[#253D35]/10 bg-white p-5 shadow-[0_24px_60px_rgba(37,61,53,0.12)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-[0.2em] text-[#8A9BBD]">
                SCIENCE · 01
              </span>
              <span className="text-xs text-[#253D35]/40">1 of 24</span>
            </div>
            <div className="mt-5 flex h-44 items-center justify-center rounded-2xl bg-[#DCE7DC]">
              <span className="text-8xl">🌱</span>
            </div>
            <p className="mt-5 text-xs font-medium tracking-widest text-[#253D35]/45">
              QUESTION
            </p>
            <h2 className="mt-2 font-serif text-2xl">
              How do plants make their own food?
            </h2>
            <div className="mt-6 flex items-center justify-between border-t border-[#253D35]/10 pt-4">
              <span className="text-xs text-[#253D35]/50">Tap to reveal answer</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#253D35] text-white">↗</span>
            </div>
          </div>

          <div className="absolute bottom-[9%] right-[1%] z-20 rotate-[8deg] rounded-2xl border border-[#253D35]/10 bg-[#F4E7C9] px-5 py-4 shadow-lg">
            <p className="text-[10px] font-semibold tracking-widest text-[#A47A35]">REMEMBER MORE</p>
            <p className="mt-1 font-serif text-lg">One card at a time.</p>
          </div>

          <span className="absolute bottom-[15%] left-[5%] text-4xl text-[#D77F72]">✳</span>
          <span className="absolute right-[9%] top-[8%] text-3xl text-[#8A9BBD]">✳</span>
        </div>
      </section>

      {/* Subject discovery */}
      <section id="subjects" className="border-y border-[#253D35]/10 bg-[#F1EDE3]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
                FOLLOW YOUR CURIOSITY
              </p>
              <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
                What would you like to learn?
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#253D35]/65">
              From the things you have always wondered about to the skills
              you're ready to master.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject) => (
              <a
                key={subject.name}
                href="#get-started"
                className="group rounded-2xl border border-[#253D35]/10 bg-[#F7F3EA] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${subject.color} ${subject.symbolColor} text-3xl`}>
                  {subject.symbol}
                </div>
                <h3 className="mt-6 text-lg font-semibold">{subject.name}</h3>
                <p className="mt-2 text-sm text-[#253D35]/60">
                  {subject.description}
                </p>
                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-[#253D35]/50">Explore subject</span>
                  <span className="transition group-hover:translate-x-1">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured decks */}
      <section id="featured" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
              A GOOD PLACE TO BEGIN
            </p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              Ideas worth exploring.
            </h2>
          </div>
          <a href="#get-started" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
            Explore all decks <ArrowIcon />
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featuredDecks.map((deck) => (
            <a
              key={deck.title}
              href="#get-started"
              className="group overflow-hidden rounded-2xl border border-[#253D35]/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`flex h-52 items-center justify-center ${deck.color}`}>
                <span className={`font-serif transition duration-300 group-hover:scale-110 ${deck.artwork === "¡Hola!" ? "text-5xl text-[#A75D48]" : "text-8xl"}`}>
                  {deck.artwork}
                </span>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#B47D45]">
                  {deck.subject}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <h3 className="font-serif text-2xl">{deck.title}</h3>
                  <ArrowIcon />
                </div>
                <p className="mt-3 text-xs text-[#253D35]/50">{deck.cards}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[#253D35] text-[#F7F3EA]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#E6A65D]">
              LEARNING, REIMAGINED
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              Your curiosity.
              <br />
              Your way of learning.
            </h2>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Discover",
                description: "Explore subjects and ideas that make you curious. There's always something new to learn.",
              },
              {
                number: "02",
                title: "Create",
                description: "Build your own flashcards or let AI help turn the things you want to learn into a study deck.",
              },
              {
                number: "03",
                title: "Remember",
                description: "Study at your own pace with visual cards designed to make knowledge stick.",
              },
            ].map((step) => (
              <div key={step.number} className="border-t border-white/20 pt-6">
                <span className="text-sm text-[#E6A65D]">{step.number}</span>
                <h3 className="mt-5 font-serif text-3xl">{step.title}</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section id="get-started" className="px-6 py-24 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
          THE WORLD IS FULL OF THINGS TO LEARN
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-tight tracking-tight sm:text-6xl">
          Make room for a little more <span className="italic text-[#B47D45]">wonder.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-[#253D35]/65">
          Start building your own learning space. One subject, one question,
          one discovery at a time.
        </p>
        <a
          href="#"
          className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#253D35] px-8 py-4 text-sm font-medium text-white transition hover:bg-[#36564A]"
        >
          Begin your journey <ArrowIcon />
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#253D35]/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-[#253D35]/55 sm:flex-row sm:items-center lg:px-10">
          <span className="font-semibold tracking-tight text-[#253D35]">
            wonderlearn.
          </span>
          <span>Learn anything. Remember everything.</span>
          <span>Made for curious minds.</span>
        </div>
      </footer>
    </main>
  );
}
