import { BookCall } from "components/features/BookCall";

export const metadata = { title: "Book a call", description: "Pick a time for a short video call with Your Name." };

const Dot = () => <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>;

export default function BookPage() {
 return (
  <div className="mx-auto mb-20 w-full max-w-3xl">
   <h1 className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] text-zinc-800 dark:text-white">
    Book a call
    <Dot />
   </h1>
   <p className="mb-8 mt-2 text-slate-600 dark:text-slate-400">Hiring, a project, or just want to talk shop? Pick a time that works for you.</p>
   <div data-xray="GET /v1/book/slots · computed from my weekly hours · client component">
    <BookCall />
   </div>
  </div>
 );
}
