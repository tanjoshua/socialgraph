// Custom Next.js App Router type definitions
export type PageParams = {
  [key: string]: string;
};

export type PageProps = {
  params: PageParams;
  searchParams?: { [key: string]: string | string[] | undefined };
};
