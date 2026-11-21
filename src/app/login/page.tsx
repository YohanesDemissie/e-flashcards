
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { createClient } from "@/lib/supabase/client";

// export default function LoginPage() {
//   const router = useRouter();

//   const [mode, setMode] = useState<"signup" | "login">("signup");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();

//     setLoading(true);
//     setMessage("");
//     setError("");

//     const supabase = createClient();

//     try {
//       if (mode === "signup") {
//         const { data, error } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             emailRedirectTo: `${window.location.origin}/auth/confirm`,
//           },
//         });

//         if (error) throw error;

//         if (data.session) {
//           router.push("/dashboard");
//           router.refresh();
//           return;
//         }

//         setMessage(
//           "Your account is almost ready! Check your email for a confirmation link."
//         );
//       } else {
//         const { error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         });

//         if (error) throw error;

//         router.push("/dashboard");
//         router.refresh();
//         return;
//       }
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Something went wrong. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 py-12 text-[#253D35]">
//       <div className="w-full max-w-md">
//         <Link
//           href="/"
//           className="mb-10 flex items-center justify-center gap-2.5"
//         >
//           <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#253D35] text-xl text-white">
//             ✳
//           </span>
//           <span className="text-2xl font-semibold tracking-tight">
//             wonder<span className="font-normal">learn</span>
//           </span>
//         </Link>

//         <div className="rounded-3xl border border-[#253D35]/10 bg-white p-8 shadow-[0_20px_60px_rgba(37,61,53,0.07)] sm:p-10">
//           <div className="text-center">
//             <p className="text-xs font-semibold tracking-[0.2em] text-[#B47D45]">
//               YOUR LEARNING SPACE
//             </p>

//             <h1 className="mt-4 font-serif text-4xl">
//               {mode === "signup" ? "Let's get curious." : "Welcome back."}
//             </h1>

//             <p className="mt-3 text-sm leading-6 text-[#253D35]/60">
//               {mode === "signup"
//                 ? "Create an account and start building your world of learning."
//                 : "Sign in and pick up where your curiosity left off."}
//             </p>
//           </div>

//           <div className="mt-8 grid grid-cols-2 rounded-full bg-[#F1EDE3] p-1">
//             <button
//               type="button"
//               onClick={() => {
//                 setMode("signup");
//                 setMessage("");
//                 setError("");
//               }}
//               className={`rounded-full py-2.5 text-sm font-medium transition ${
//                 mode === "signup"
//                   ? "bg-[#253D35] text-white shadow-sm"
//                   : "text-[#253D35]/65 hover:text-[#253D35]"
//               }`}
//             >
//               Create account
//             </button>

//             <button
//               type="button"
//               onClick={() => {
//                 setMode("login");
//                 setMessage("");
//                 setError("");
//               }}
//               className={`rounded-full py-2.5 text-sm font-medium transition ${
//                 mode === "login"
//                   ? "bg-[#253D35] text-white shadow-sm"
//                   : "text-[#253D35]/65 hover:text-[#253D35]"
//               }`}
//             >
//               Sign in
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="mt-8 space-y-5">
//             <div>
//               <label
//                 htmlFor="email"
//                 className="mb-2 block text-sm font-medium"
//               >
//                 Email address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="you@example.com"
//                 className="w-full rounded-xl border border-[#253D35]/15 bg-[#F7F3EA]/50 px-4 py-3.5 text-sm outline-none transition placeholder:text-[#253D35]/35 focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/10"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="mb-2 block text-sm font-medium"
//               >
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 autoComplete={
//                   mode === "signup" ? "new-password" : "current-password"
//                 }
//                 required
//                 minLength={6}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="At least 6 characters"
//                 className="w-full rounded-xl border border-[#253D35]/15 bg-[#F7F3EA]/50 px-4 py-3.5 text-sm outline-none transition placeholder:text-[#253D35]/35 focus:border-[#49675A] focus:ring-2 focus:ring-[#49675A]/10"
//               />
//             </div>

//             {error && (
//               <div
//                 role="alert"
//                 className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
//               >
//                 {error}
//               </div>
//             )}

//             {message && (
//               <div
//                 role="status"
//                 className="rounded-xl border border-[#49675A]/20 bg-[#DCE7DC] px-4 py-3 text-sm leading-6 text-[#253D35]"
//               >
//                 {message}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="flex w-full items-center justify-center gap-2 rounded-full bg-[#253D35] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#36564A] disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {loading
//                 ? "Please wait..."
//                 : mode === "signup"
//                   ? "Create my account ↗"
//                   : "Sign in ↗"}
//             </button>
//           </form>

//           <p className="mt-7 text-center text-xs leading-5 text-[#253D35]/50">
//             By continuing, you're creating a space for curiosity,
//             discovery, and lifelong learning.
//           </p>
//         </div>

//         <p className="mt-8 text-center text-sm text-[#253D35]/55">
//           <Link href="/" className="transition hover:text-[#253D35]">
//             ← Back to home
//           </Link>
//         </p>
//       </div>
//     </main>
//   );
// }


import AuthForm from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 py-12">
      <AuthForm mode="login" />
    </main>
  );
}
