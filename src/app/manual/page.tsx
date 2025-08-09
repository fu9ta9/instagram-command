import { getManualImages } from "./imageList";
import ManualClientPage from "./ManualClientPage";
import type { ManualImages } from "./imageList";

// SSG用の設定
export const revalidate = 3600; // 1時間でrevalidate

export default async function ManualPage() {
  const images = await getManualImages();
  return <ManualClientPage images={images} />;
} 