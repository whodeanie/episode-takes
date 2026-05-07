import { ProfileView } from "./ProfileView";

export const dynamic = "force-static";

export default function MePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ProfileView />
    </div>
  );
}
