import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "沖縄マンション検索 | Okinawa Mansion Search",
    template: "%s | 沖縄マンション検索",
  },
  description:
    "沖縄県のマンション情報を検索。那覇市・浦添市・沖縄市など全域の販売中物件・成約事例を掲載。",
  keywords: ["沖縄", "マンション", "不動産", "那覇", "購入", "売買"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        {children}
      </body>
    </html>
  );
}
