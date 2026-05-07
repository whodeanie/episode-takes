import { ShareView } from "./ShareView";

type Params = Promise<{ takeId: string }>;

export const dynamic = "force-static";

export default async function SharePage({ params }: { params: Params }) {
  const { takeId } = await params;
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <ShareView takeId={takeId} />
    </div>
  );
}
