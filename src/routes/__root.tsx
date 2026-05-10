import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { BackgroundMusic } from "@/components/BackgroundMusic";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-display font-black text-gradient-red">৪০৪</div>
        <h2 className="mt-3 text-xl font-semibold">পেজ খুঁজে পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          আপনি যে পেজটি খুঁজছেন তা নেই অথবা সরিয়ে নেওয়া হয়েছে।
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          হোমে ফিরুন
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-semibold">কিছু একটা ভুল হয়েছে</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            আবার চেষ্টা করুন
          </button>
          <a href="/" className="rounded-md border border-input px-4 py-2 text-sm">হোম</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "জুলাই সনদ বাস্তবায়ন আন্দোলন — সনদ চাই, অধিকার চাই" },
      {
        name: "description",
        content: "জুলাই সনদ বাস্তবায়ন আন্দোলন — জনগণের অধিকার ও গণতান্ত্রিক সংস্কারের জন্য একটি গণআন্দোলন।",
      },
      { property: "og:title", content: "জুলাই সনদ বাস্তবায়ন আন্দোলন — সনদ চাই, অধিকার চাই" },
      { property: "og:description", content: "জুলাই সনদের কার্যকর বাস্তবায়নের লক্ষ্যে আমরা “জুলাই সনদ বাস্তবায়ন আন্দোলন” গঠন করছি—একটি ঐক্যবদ্ধ প্ল্যাটফর্ম, যেখানে নাগরিকদের কণ্ঠস্বর শক্তিশালী করা হবে এবং" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "জুলাই সনদ বাস্তবায়ন আন্দোলন — সনদ চাই, অধিকার চাই" },
      { name: "description", content: "জুলাই সনদের কার্যকর বাস্তবায়নের লক্ষ্যে আমরা “জুলাই সনদ বাস্তবায়ন আন্দোলন” গঠন করছি—একটি ঐক্যবদ্ধ প্ল্যাটফর্ম, যেখানে নাগরিকদের কণ্ঠস্বর শক্তিশালী করা হবে এবং" },
      { name: "twitter:description", content: "জুলাই সনদের কার্যকর বাস্তবায়নের লক্ষ্যে আমরা “জুলাই সনদ বাস্তবায়ন আন্দোলন” গঠন করছি—একটি ঐক্যবদ্ধ প্ল্যাটফর্ম, যেখানে নাগরিকদের কণ্ঠস্বর শক্তিশালী করা হবে এবং" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0d11d16c-c429-4b65-bd16-8ef6a600b319/id-preview-4d77bcab--b2cee948-f6ad-4e2c-a83f-b20d55566e5c.lovable.app-1778294734971.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0d11d16c-c429-4b65-bd16-8ef6a600b319/id-preview-4d77bcab--b2cee948-f6ad-4e2c-a83f-b20d55566e5c.lovable.app-1778294734971.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ChromeLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin-dashboard");
  if (isAdmin) {
    return <Outlet />;
  }
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
      <BackgroundMusic />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChromeLayout />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
