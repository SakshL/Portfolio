import Squares from "components/decorations/Squares";
import { RepoCard } from "components/elements/RepoCard";
import { GetRepos } from "lib/graphql";

export const runtime = "edge";
export const revalidate = 3600; // Revalidate every hour

export const metadata = {
 title: "Github Repositories",
};

export default async function GithubRepositories() {
 const { user } = await GetRepos("public", 50);
 const repositories = user.repositories.edges.map((edge) => edge.node);
 repositories.sort((a, b) => b.stars - a.stars || a.isArchived - b.isArchived);

 return (
  <>
   <div className="fixed right-full top-full z-[-1] -translate-y-1/4 translate-x-1/2 transform lg:translate-x-1/2 xl:-translate-y-1/2">
    <Squares w="404" h="404" />
   </div>
   <h1 className="mb-8 mt-6 flex items-center justify-center box-decoration-clone bg-clip-text px-8 text-center  text-[2rem] font-semibold motion-reduce:transition-none">
    Open source, from the beginning <span className="bg-gradient-to-r from-[#6310ff] to-[#1491ff] box-decoration-clone bg-clip-text text-fill-transparent dark:from-[#a2facf] dark:to-[#64acff]">.</span>
   </h1>
   <>
    {repositories && (
     <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 text-zinc-800 dark:text-white md:grid-cols-2 lg:grid-cols-3">
      {repositories?.map((repo) => (
       <RepoCard key={repo.id} {...repo} />
      ))}
     </div>
    )}
   </>
  </>
 );
}
