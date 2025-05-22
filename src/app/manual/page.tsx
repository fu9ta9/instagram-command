import { getManualImages } from "./imageList";
import ManualClientPage from "./ManualClientPage";

// サーバーコンポーネントで画像リストを取得するAPI Routeを用意し、fetchで取得する形にします
// ここではクライアント側のUI部分のみ先に実装します

const SECTIONS = [
  { key: "login", label: "ログイン" },
  { key: "connect", label: "Instagram連携" },
  { key: "search", label: "アカウント検索" },
  { key: "reply", label: "DM自動送信設定" },
];

type Mode = "pc" | "sp";

type ImageInfo = { src: string; alt: string };

// 仮の初期値（APIから取得する想定）
const DEFAULT_IMAGES: ManualImages = {
  login: { pc: [], sp: [] },
  connect: { pc: [], sp: [] },
  search: { pc: [], sp: [] },
  reply: { pc: [], sp: [] },
};

const SECTION_CONTENT: Record<string, { title: string; steps: string[] }> = {
  login: {
    title: "ログイン",
    steps: [
      "トップページ右上または「無料トライアルを始める」ボタンからログイン画面へ進みます。",
      "「Googleでログイン」をクリックし、Googleアカウントで認証します。",
      "ログイン後、管理画面に遷移します。"
    ]
  },
  connect: {
    title: "Instagram連携",
    steps: [
      "管理画面の「連携」タブを開きます。",
      "「Instagramアカウントを連携」ボタンをクリックします。",
      "Instagramの認証画面でログインし、許可を与えます。",
      "連携が完了すると、アカウント情報が表示されます。"
    ]
  },
  search: {
    title: "アカウント検索",
    steps: [
      "「検索」タブを開きます。",
      "検索窓にキーワードやユーザー名を入力し、検索ボタンを押します。",
      "該当するInstagramアカウントが一覧で表示されます。",
      "詳細を見たい場合はアカウントをクリックします。"
    ]
  },
  reply: {
    title: "DM自動送信設定",
    steps: [
      "「返信」タブを開きます。",
      "「新規返信登録」ボタンをクリックします。",
      "案内に従ってキーワードや返信内容を設定し、保存します。",
      "設定後、条件に合致したDMが自動で送信されます。"
    ]
  },
};

export default async function ManualPage() {
  const images = await getManualImages();
  return <ManualClientPage images={images} />;
} 