import { getManualImages } from "../constants/imageList";
import ManualClientPage from "../components/ManualClientPage";

export default async function ManualPage() {
  const images = await getManualImages();
  return <ManualClientPage images={images} />;
}